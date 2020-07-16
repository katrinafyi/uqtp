import { Action, State, action, Store, ThunkOn, Thunk, thunk } from "easy-peasy"
import { v4 } from "uuid"
import { auth, userFirestoreDocRef, mergeData } from "./firebase";

export type FirebaseMeta = {
  __instance: string,
  __timestamp: number,
  __uid: string | null,
}

export type FirebaseModel = FirebaseMeta & {
  setStateFromFirebase: Action<FirebaseModel, FirebaseMeta>,
  uploadStateToFirebase: Thunk<FirebaseModel, FirebaseModel>,
}

export const instance = v4();
export const FIREBASE_META_DEFAULT: FirebaseMeta = {
  __instance: instance,
  __timestamp: 0,
  __uid: null,
};

export const updateFirebaseMeta = (): FirebaseMeta => ({
  __instance: instance,
  __timestamp: Date.now(),
  __uid: auth.currentUser?.uid ?? null,
});

export const makeFirebaseModel = () => {
  
  const model: FirebaseModel = {
    ...FIREBASE_META_DEFAULT,
    
    setStateFromFirebase: action((oldState, payload) => {
      // debugger;
      if (payload.__instance == null) {
        console.warn("received state missing firebase metadata, merging.");
        // @ts-ignore
        return mergeData(payload, oldState) as any;
      }

      if (instance === payload.__instance) {
        console.info("received state from same instance, ignoring.");
        return;
      }

      if (oldState.__uid != null && oldState.__uid !== payload.__uid) {
        console.warn("received state from different user, ignoring.");
        return;
      }

      if (payload.__timestamp > oldState.__timestamp) {
        console.info('received newer state, updating.');
        return payload;
      }

      console.info('local state is newer than remote, keeping.');
      return;
    }),

    uploadStateToFirebase: thunk(async (actions, payload) => {
      console.log("upload state to firebase called...");
      if (payload.__uid == null) {
        console.warn("refusing to upload null user.");
        return;
      }
      
      await userFirestoreDocRef(payload.__uid).set(payload);
    }),
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
          // debugger;
          store.getActions().setStateFromFirebase({ ...FIREBASE_META_DEFAULT, ...data });
        } else {
          // no previous data exists. upload our data.
          document!.set({ ...store.getState(), ...updateFirebaseMeta()});
          // store.dispatch(firebaseSnapshotAction(user, defaultState as unknown as S));
        }
      });
    } else {
      document = null;
      // new user state is signed out. delete data.
      store.getActions().setStateFromFirebase(FIREBASE_META_DEFAULT);
    }
  });

  store.subscribe(() => {
    // @ts-ignore
    console.log("subscribe listener called, uploading state. meta: ", store.getState()?.firebase);
    // document?.set({ ...store.getState(), ...updateFirebaseMeta()});
  });
};