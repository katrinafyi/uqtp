import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { DEFAULT_PERSIST, CURRENT_VERSION, PersistState } from './state/schema';
import { migratePeristState } from './state/migrations';
import { model } from './state/easy-peasy';
import { createStore, StoreProvider } from 'easy-peasy';
import { makeFirebaseModel, attachFirebaseListeners, FIREBASE_META_DEFAULT } from './state/firebaseSync';
import { makeFirestorePersistEnhancer } from './state/firebaseEnhancer';
import { userFirestoreDocRef, auth } from './state/firebase';
import { setUser } from './state/ducks/user';

const LOCALSTORAGE_KEY = 'timetableState';

const previousJSON = localStorage.getItem(LOCALSTORAGE_KEY);

let previousState = DEFAULT_PERSIST;
try {
  if (previousJSON != null) {
    const parsed = JSON.parse(previousJSON);
    if (parsed)
      previousState = parsed;
  }
} catch (e) {
  console.error("failed to load state from local storage", e);
}

const migratedState = migratePeristState(previousState, CURRENT_VERSION);

const saveLocalStorage = (s: PersistState) => {
  // console.log('saving to localStorage');
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(s));
}

if (migratedState) {
  saveLocalStorage(migratedState);
}

const initialState = migratedState ?? previousState;

const firestoreEnhancer = makeFirestorePersistEnhancer(
  // @ts-ignore
  auth, userFirestoreDocRef, '@action.setState', ['@action.setUser'],
  DEFAULT_PERSIST, migratePeristState);

const rootStore = createStore(
  model,
  { initialState, enhancers: [firestoreEnhancer] }
);

// attachFirebaseListeners(rootStore);

rootStore.subscribe(() => {
  saveLocalStorage(rootStore.getState());
})

ReactDOM.render(
  <StoreProvider store={rootStore}>
    <App />
  </StoreProvider>,
  document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
