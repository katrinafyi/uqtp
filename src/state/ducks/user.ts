import { User } from "firebase";

export type UserState = {
    uid: string,
    name: string | null,
    email: string | null,
    photo: string | null,
    phone: string | null,
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
                phone: action.user.phoneNumber,
                providers: action.user.providerData?.map(x => x?.providerId ?? JSON.stringify(x)),
                isAnon: action.user.isAnonymous,
            };
        default: 
            return state;
    }
};

// export type PersistStateReducer = typeof persistStateReducer;
export default userReducer;