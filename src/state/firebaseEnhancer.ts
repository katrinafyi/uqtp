import { userFirestoreDocRef, auth } from "./firebase";
import firebase from "firebase";
import { Thunk, Action, thunk, State, action, Store } from "easy-peasy";
import { produceWithPatches, enablePatches } from 'immer';
import { IS_DEBUG } from "../isDebug";

enablePatches();

type FirebaseRef = firebase.database.Reference;

export type FirebaseState = {
  __ref: firebase.database.Reference | null,  
};

export type FirebaseModel = FirebaseState & {
  __setFirebaseState: Action<FirebaseModel, any>,
  __setFirebaseRef: Action<FirebaseModel, FirebaseRef | null>,
};

export const firebaseModel: FirebaseModel = {
  __ref: null,

  __setFirebaseState: action((_, state) => {
    //console.log("__setFirebaseState", state);    
    return state as State<FirebaseModel>;
  }),

  __setFirebaseRef: action((s, ref) => {
    s.__ref = ref;
  }),
}


export const attachFirebasePersistListener = <State, Model, Config>(
  store: Store<FirebaseModel, Config>,
  defaultState?: State,
  cleanState?: (t: Model) => State,
  onSetState?: (x: void) => any,
) => {
  
  const { __setFirebaseState, __setFirebaseRef } = store.getActions();

  let listener: Function | null = null;
  let docRef: FirebaseRef | null = null;
  let user: firebase.User | null = null;

  auth.onAuthStateChanged((newUser: firebase.User | null) => {

    if (listener)
      docRef?.off('value', listener as any);
    listener = null;

    user = newUser;

  IS_DEBUG && console.log('auth state changed: ' + user?.uid);
    //console.log(user);
    docRef = userFirestoreDocRef(user);
    __setFirebaseRef(docRef);

    let first = true; // only upload data on first connect.
    if (user) {
      listener = docRef!.on('value', doc => {
        if (doc?.exists()) {
          // previous data exists. load from online.
          const data = doc.val()! as FirebaseState;
          data.__ref = docRef;
        IS_DEBUG && console.log('... got snapshot from firebase', data);
          __setFirebaseState(data as FirebaseState);
          onSetState && onSetState();
        } else if (first) {
        IS_DEBUG && console.log('... no data on firebase, uploading.');
          // no previous data exists. upload our data.
          const data = cleanState ? cleanState(store.getState() as Model) : store.getState();
        IS_DEBUG && console.log(data);
          docRef?.set(data);
          // store.dispatch(firebaseSnapshotAction(defaultState as unknown as S));
        }
        first = false;
      });
    } else {
      // new user state is signed out. delete data.
      __setFirebaseState(defaultState as unknown as FirebaseState);
      onSetState && onSetState();
    }
  });
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
      updates[path] = patch.op === 'remove' ? null : (patch.value ?? null);
    }
    
  IS_DEBUG && console.log("patches", patches);
  IS_DEBUG && console.log("update", updates);
    // @ts-ignore
  IS_DEBUG && console.log(s.__ref);
    // debugger;

    if (Object.keys(updates)) {
      // @ts-ignore
      await (s.__ref as FirebaseModel['__ref'])?.update(updates);
    }
  });
};

export type FirebaseThunk<
  Model extends object = {},
  Payload = void,
  Injections = any,
  StoreModel extends object = {},
  Result = any
> = Thunk<Model & FirebaseModel, Payload, Injections, StoreModel, Result>;