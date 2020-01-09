import React, { useState } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firestore, auth } from './state/firebase';
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

const LOCALSTORAGE_KEY = 'timetableState';

const previousJSON = localStorage.getItem(LOCALSTORAGE_KEY);

const previousState = previousJSON !== null ? JSON.parse(previousJSON) : DEFAULT_PERSIST;
const migratedState = migratePeristState(previousState, CURRENT_VERSION);

const saveState = (s: PersistState) =>
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(s));

if (migratedState) {
    saveState(migratedState);
}

const rootStore = createStore(rootReducer, migratedState ?? previousState,
    applyMiddleware(thunk));

const unsubscribe = rootStore.subscribe(() => {
    const state = rootStore.getState()
    saveState(state);
    
    if (auth.currentUser)
        firestore.collection('users').doc(auth.currentUser.uid).set(state);
});

auth.onAuthStateChanged((user) => {
    rootStore.dispatch(setUser(user));
});

ReactDOM.render(
    <Provider store={rootStore}><App/></Provider>, 
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
