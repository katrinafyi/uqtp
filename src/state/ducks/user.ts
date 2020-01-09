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
} | null;

export type UserStateAction = {
    type: 'setUser',
    user: User | null
};

export const setUser = (user: User | null): UserStateAction  =>
    ({ type: 'setUser', user });

const userReducer = (state: UserState, action: UserStateAction) => {
    switch (action.type) {
        case 'setUser':
            if (!action.user) return null;
            return {
                uid: action.user.uid,
                name: action.user.displayName,
                email: action.user.email,
                photo: action.user.photoURL
            };
        default: 
            return state;
    }
};

// export type PersistStateReducer = typeof persistStateReducer;
export default userReducer;