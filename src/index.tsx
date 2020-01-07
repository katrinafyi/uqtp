import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { rootReducer } from './state/store';
import { DEFAULT_PERSIST, CURRENT_VERSION, PersistState } from './state/schema';
import { createStore } from 'redux';
import { Provider } from 'react-redux'
import { migratePeristState } from './state/migrations';

const LOCALSTORAGE_KEY = 'timetableState';

const previousJSON = localStorage.getItem(LOCALSTORAGE_KEY);

const previousState = previousJSON !== null ? JSON.parse(previousJSON) : DEFAULT_PERSIST;
const migratedState = migratePeristState(previousState, CURRENT_VERSION);

const saveState = (s: PersistState) =>
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(s));

if (migratedState) {
    saveState(migratedState);
}

const rootStore = createStore(rootReducer, migratedState ?? previousState);
rootStore.subscribe(() => {
    saveState(rootStore.getState());
});

ReactDOM.render(
    <Provider store={rootStore}><App/></Provider>, 
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
