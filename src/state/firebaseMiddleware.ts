import { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { PersistState } from "./schema";
import { RootAction, rootReducer } from "./store";
import { firestore } from "./firebase";


export const firebaseMiddleware: Middleware = (api: MiddlewareAPI<Dispatch<RootAction>, PersistState>) =>
    (next: Dispatch<RootAction>) => <A extends RootAction>(action: A): any => {
        const state = api.getState();
        if (state.user?.uid && action.type !== 'setPersistState') {
            console.log('connected. redirecting via firebase.');

            const newState = rootReducer(api.getState(), action);

            firestore.collection('users').doc(state.user.uid).set(newState);
            return;
        }
        return next(action);
    };