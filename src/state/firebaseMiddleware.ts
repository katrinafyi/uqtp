import { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { PersistState } from "./schema";
import { RootAction, rootReducer } from "./store";
import { firestore } from "./firebase";


export const firebaseMiddleware: Middleware = (api: MiddlewareAPI<Dispatch<RootAction>, PersistState>) =>
    (next: Dispatch<RootAction>) => <A extends RootAction>(action: A): any => {
        // console.log(action);

        const state = api.getState();
        if (state.user?.uid && action.type !== 'setPersistState' && action.type !== 'setUser') {
            console.log('connected. redirecting via firebase.');
            // console.log(action);

            const newState = rootReducer(api.getState(), action);

            firestore.collection('users').doc(state.user.uid).set(newState);
            return;
        }
        return next(action);
    };