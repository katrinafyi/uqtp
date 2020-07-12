import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firestore, auth, userFirestoreDocRef } from './state/firebase';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { rootReducer } from './state/store';
import { DEFAULT_PERSIST, CURRENT_VERSION, PersistState } from './state/schema';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { migratePeristState } from './state/migrations';
import thunk from 'redux-thunk';
import { setUser } from './state/ducks/user';
import { firebaseMiddleware } from './state/firebaseMiddleware';
import { setPersistState } from './state/ducks/persist';
import firebase from 'firebase/app';
import { makeFirestorePersistEnhancer } from './state/firebaseEnhancer';

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

const rootStore = createStore(rootReducer, migratedState ?? previousState,
  makeFirestorePersistEnhancer(auth, userFirestoreDocRef, migratePeristState, DEFAULT_PERSIST, setUser));

rootStore.subscribe(() => {
  const state = rootStore.getState();
  saveLocalStorage(state);
});


ReactDOM.render(
  <Provider store={rootStore}><App /></Provider>,
  document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
