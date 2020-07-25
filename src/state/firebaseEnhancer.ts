import { auth as globalAuth, userFirestoreDocRef, auth } from "./firebase";
import firebase from "firebase";
import { StoreEnhancer, AnyAction, Action as ReduxAction, Reducer, PreloadedState } from "redux";
import { Thunk, Action, thunk, State, action } from "easy-peasy";
import { produceWithPatches, createDraft, finishDraft, enablePatches, isDraft } from 'immer';

enablePatches();

export type FirebaseState = {
  __ref: firebase.database.Reference | null,  
};

export type FirebaseModel = FirebaseState & {
  __setFirebaseState: Action<FirebaseModel, any>,
};

export const firebaseModel: FirebaseModel = {
  __ref: null,

  __setFirebaseState: action((_, state) => {
    console.log("__setFirebaseState", state);    
    return state as State<FirebaseModel>;
  }),
}


export const makeFirestorePersistEnhancer = <T, U extends T>(
  defaultState?: T,
  cleanState?: (t: U) => T,
): StoreEnhancer => {
  
  return (createStore) => (reducer: any, preloadedState?: any): any => {

    const setState = (s: FirebaseState): any => ({
      type: '@action.__setFirebaseState', payload: s,
    });

    let unsubSnapshot: Function | null = null;
    let user: firebase.User | null = null;

    const store = createStore(reducer, preloadedState);

    auth.onAuthStateChanged((newUser: firebase.User | null) => {

      unsubSnapshot?.();
      unsubSnapshot = null;

      user = newUser;
  
      console.log('auth state changed: ' + user?.uid);
     //console.log(user);
      if (user) {
        const docRef = userFirestoreDocRef(user);
        unsubSnapshot = docRef!.on('value', doc => {
          if (doc?.exists()) {
            console.log('... got snapshot from firebase');
            // previous data exists. load from online.
            const data = doc.val()! as FirebaseState;
            data.__ref = docRef;
            store.dispatch(setState(data as FirebaseState));
          } else {
            console.log('... no data on firebase, uploading.');
            // no previous data exists. upload our data.
            const data = cleanState ? cleanState(store.getState() as U) : store.getState();
            docRef?.set(data);
            // store.dispatch(firebaseSnapshotAction(defaultState as unknown as S));
          }
        });
      } else {
        // new user state is signed out. delete data.
        store.dispatch(setState(defaultState as unknown as FirebaseState));
      }
    });

    return store;
  };
};

type ActionFunction<Model extends object, Payload> = (state: State<Model>, payload: Payload) => void | State<Model>;

export const firebaseAction = <M extends object, P>(actionFunction: ActionFunction<M, P>): Thunk<M, P> => {
  return thunk(async (actions, payload, { getState, getStoreState, meta }) => {
    
    const s = getStoreState();
    
    const prevState = getState();
    const [, patches] = produceWithPatches(prevState, (s: State<M>) => actionFunction(s, payload));

    
    const updates: any = {};
    const basePath = meta.parent.join('/');
    for (const patch of patches) {
      const path = basePath + patch.path.join('/');
      updates[path] = patch.op === 'remove' ? null : patch.value;
    }
    
    console.log("patches", patches);
    console.log("update", updates);
    // @ts-ignore
    console.log(s.__ref);
    // debugger;

    // @ts-ignore
    await (s.__ref as FirebaseModel['__ref'])?.update(updates);
  });
};

export type FirebaseThunk<
  Model extends object = {},
  Payload = void,
  Injections = any,
  StoreModel extends object = {},
  Result = any
> = Thunk<Model & FirebaseModel, Payload, Injections, StoreModel, Result>;