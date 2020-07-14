import { Action, State, action, Store } from "easy-peasy"
import { v4 } from "uuid"
import { auth, userFirestoreDocRef } from "./firebase";

export type FirebaseModel = {
  firebase: {
    instance: string,
    timestamp: number,
    uid: string | null,

    setState: Action<FirebaseModel, State<FirebaseModel>>
  }
}

export const instance = v4();
export const FIREBASE_MODEL_DEFAULT = {
  instance: instance,
  timestamp: 0,
  uid: null,
}

export const makeFirebaseModel = () => {
  
  const model: FirebaseModel = {
    firebase: {
      ...FIREBASE_MODEL_DEFAULT,
      
      setState: action((oldState, state) => {
        if (instance === state.firebase.instance) {
          console.info("received state from same instance, ignoring.");
          return;
        }

        if (oldState.firebase.uid != null && oldState.firebase.uid !== state.firebase.uid) {
          console.warn("received state from different user, ignoring.");
          return;
        }

        if (state.firebase.timestamp > oldState.firebase.timestamp) {
          console.info('received newer state, updating.');
          return state;
        }

        console.info('local state is newer than remote, keeping.');
        return;
      }),
    }
  };

  return model;  
}

export const attachFirebaseListeners = <C>(store: Store<FirebaseModel, C>) => {

  let unsubSnapshot: Function | null = null;
  let document: firebase.firestore.DocumentReference | null = null;

  auth.onAuthStateChanged((user) => {
    unsubSnapshot?.();
    unsubSnapshot = null;

    console.log("auth state updated in firebase listener. uid: ", user?.uid);

    if (user) {
      document = userFirestoreDocRef(user);

      unsubSnapshot = document.onSnapshot((doc) => {
        console.log("received firebase document snapshot. meta: ", doc.data()?.firebase);

        // console.log('got snapshot from firebase');
        if (doc?.exists) {
          // previous data exists. load from online.
          const data = doc.data()! as FirebaseModel;
          store.getActions().firebase.setState(data);
        } else {
          // no previous data exists. upload our data.
          document!.set(store.getState());
          // store.dispatch(firebaseSnapshotAction(user, defaultState as unknown as S));
        }
      });
    } else {
      document = null;
      // new user state is signed out. delete data.
      store.getActions().firebase.setState({firebase: FIREBASE_MODEL_DEFAULT});
    }
  });

  store.subscribe(() => {
    // @ts-ignore
    console.log("subscribe listener called. meta: ", store.getState()?.firebase);
    document?.set(store.getState());
  });
};