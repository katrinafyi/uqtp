import { auth as globalAuth } from "./firebase";
import type firebase from "firebase";
import { StoreEnhancer, AnyAction, Action, Reducer, PreloadedState } from "redux";

type DocRef = firebase.firestore.DocumentReference;

export const makeFirestorePersistEnhancer = 
  <T>(firebaseAuth: firebase.auth.Auth,
    getDocRef: (user: firebase.User | null) => DocRef | null, 
    setStateType: string,
    blacklistTypes?: string[],
    defaultState?: T,
    migrateState?: (state: T) => T | null, 
    ): StoreEnhancer => {
  
  const auth = firebaseAuth ?? globalAuth;
  const migrate = migrateState ?? (() => null);

  // @ts-ignore
  return (createStore) => <S = any, A extends Action = AnyAction>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>) => {

    const SET_STATE = setStateType;

    const blacklist = new Set([...blacklistTypes ?? [], SET_STATE]);

    const setState = (s: S): any => ({
      type: SET_STATE, payload: s,
    });
    console.assert(SET_STATE, 'set state type cannot be null');
    blacklist.forEach(x => console.assert(x, 'blacklisted type should not be null'));

    let unsubSnapshot: Function | null = null;
    let user: firebase.User | null = null;

    const firebaseReducer = (s: S, a: A) => {
      console.log("firebase reducer called with ", a, s);
      if (!blacklist.has(a.type) && user != null) {
        const newState = reducer(s, a as A);
        // @ts-ignore
        if (newState !== s && newState != null) {
          console.log("... uploading new state to firebase", newState);
          getDocRef(user)!.set(newState)
        }
        return s;
      };
      console.log("... action blacklisted: " + a.type);
      return reducer(s, a as A);
    };

    // @ts-ignore
    const store = createStore(firebaseReducer, preloadedState);

    auth.onAuthStateChanged((newUser) => {

      unsubSnapshot?.();
      unsubSnapshot = null;

      user = newUser;
  
      console.log('auth state changed: ' + user?.uid);
      // console.log(user);
      if (user) {
        const docRef = getDocRef(user);
        unsubSnapshot = docRef!.onSnapshot((doc) => {
          if (doc?.exists) {
            console.log('... got snapshot from firebase');
            // previous data exists. load from online.
            const data = doc.data()! as T;
            const migrated = migrate(data);
            if (migrated)
              docRef?.set(migrated);
            else
              store.dispatch(setState(data as unknown as S));
          } else {
            console.log('... no data on firebase, uploading.');
            // no previous data exists. upload our data.
            docRef?.set(store.getState());
            // store.dispatch(firebaseSnapshotAction(defaultState as unknown as S));
          }
        });
      } else {
        // new user state is signed out. delete data.
        store.dispatch(setState(defaultState as unknown as S));
      }
    });

    return store;
  };
}