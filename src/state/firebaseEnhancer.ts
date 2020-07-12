import { auth as globalAuth, userFirestoreDocRef } from "./firebase";
import { PersistState } from "./schema";
import { migratePeristState } from "./migrations";
import type firebase from "firebase";
import { StoreEnhancerStoreCreator, StoreEnhancer, Middleware, MiddlewareAPI, AnyAction, Action, Reducer, PreloadedState } from "redux";
import { RootAction } from "./store";
import { setPersistState } from "./ducks/persist";



type DocRef = firebase.firestore.DocumentReference;

type FirebaseSnapshotAction<T> = { 
  type: 'firebaseSnapshotAction', 
  user: firebase.User | null,
  state: T, 
};

export const makeFirestorePersistEnhancer = 
  <T>(getDocRef: (user: firebase.User | null) => DocRef, 
    migrateState?: (state: T) => T | null, 
    defaultState?: T,
    firebaseAuth?: firebase.auth.Auth): StoreEnhancer => {
  
  const auth = firebaseAuth ?? globalAuth;
  const migrate = migrateState ?? (() => null);

  // @ts-ignore
  return (createStore) => <S = any, A extends Action = AnyAction>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>) => {

    const firebaseSnapshotAction = (u: firebase.User | null, s: S): FirebaseSnapshotAction<S> => ({
      type: 'firebaseSnapshotAction', user: u, state: s,
    });

    let unsubSnapshot: Function | null = null;
    let user: firebase.User | null = null;

    const firebaseReducer = (s?: S, a?: A | FirebaseSnapshotAction<S>) => {
      console.log("firebase reducer called with ", a);
      if (a?.type === 'firebaseSnapshotAction') {
        const a2 = a as FirebaseSnapshotAction<S>;
        return { ...a2.state, __user: a2?.user?.uid };
      } else if (user != null) {
        const newState = reducer(s, a as A);
        // @ts-ignore
        if (newState !== s && newState != null && s?.__user === user.uid)
          getDocRef(user).set(newState)
        return newState;
      };
      return s;
    };

    // @ts-ignore
    const store = createStore(firebaseReducer, preloadedState);

    auth.onAuthStateChanged((newUser) => {

      unsubSnapshot?.();
      unsubSnapshot = null;

      user = newUser;
  
      console.log('auth state changed: ' + user?.uid);
      console.log(user);
      if (user) {
        const docRef = getDocRef(user);
        unsubSnapshot = docRef.onSnapshot((doc) => {
          // console.log('got snapshot from firebase');
          if (doc?.exists) {
            // previous data exists. load from online.
            const data = doc.data()! as T;
            const migrated = migrate(data);
            if (migrated)
              docRef?.set(migrated);
            else
              store.dispatch(firebaseSnapshotAction(user, data as unknown as S));
          } else {
            // no previous data exists. upload our data.
            // docRef?.set(store.getState());
            store.dispatch(firebaseSnapshotAction(user, defaultState as unknown as S));
          }
        });
      } else {
        // new user state is signed out. delete data.
        store.dispatch(firebaseSnapshotAction(null, null as unknown as S));
      }
    });

    return store;
  };
}