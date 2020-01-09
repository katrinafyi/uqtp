import { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { PersistState } from "./schema";
import { RootAction } from "./store";


export const firebaseMiddleware: Middleware = (api: MiddlewareAPI<Dispatch<RootAction>, PersistState>) =>
    (next: Dispatch<RootAction>) => <A extends RootAction>(action: A): any => {
        if (api.getState().user) {
            console.log('connected');
            switch (action.type) {
                default: throw new Error('unknown firebase action type: ' + action.type);
            }
            return;
        }
        return next(action);
    };