import { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { PersistState } from "./schema";
import { RootAction, rootReducer } from "./store";
import { firestore } from "./firebase";


export const firebaseMiddleware: Middleware = (api: MiddlewareAPI<Dispatch<RootAction>, PersistState>) =>
    (next: Dispatch<RootAction>) => <A extends RootAction>(action: A): any => {
        // console.log(action);

        const state = api.getState();
        if (action.type !== 'setPersistState' && action.type !== 'setUser') {
            if (state.user?.uid) {
                console.log('connected. redirecting via firebase.');
                // console.log(action);

                const newState = rootReducer(state, action);
                if (newState !== state)
                    firestore.collection('users').doc(state.user.uid).set(newState);
                return;
            }
        }
        return next(action);
    };