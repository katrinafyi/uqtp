import { PersistState } from "../schema";
import produce from "immer";
import { EMPTY_TIMETABLE } from "../types";
import { RootAction } from "../store";
import { Dispatch } from "redux";
import { User } from "firebase";

export type UserState = {
    uid: string,
    name: string | null,
    email: string | null,
    photo: string | null,
    providers: string[] | null,
    isAnon: boolean,
} | null;

export type UserStateAction = {
    type: 'setUser',
    user: User | null,
    localOnly: true,
};

export const setUser = (user: User | null): UserStateAction  =>
    ({ type: 'setUser', user , localOnly: true });

const userReducer = (state: UserState, action: UserStateAction): UserState => {
    switch (action.type) {
        case 'setUser':
            if (!action.user) return null;
            return {
                uid: action.user.uid,
                name: action.user.displayName,
                email: action.user.email,
                photo: action.user.photoURL,
                providers: action.user.providerData?.map(x => x?.providerId ?? JSON.stringify(x)),
                isAnon: action.user.isAnonymous,
            };
        default: 
            return state;
    }
};

// export type PersistStateReducer = typeof persistStateReducer;
export default userReducer;