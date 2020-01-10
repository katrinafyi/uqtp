import { createStore, combineReducers } from 'redux'
import persistReducer from './ducks/persist'
import currentTimetableReducer, { TimetableStateAction } from './ducks/timetables'
import { PersistStateAction } from './ducks/persist'
import { PersistState, DEFAULT_PERSIST } from './schema'
import produce from 'immer'
import userReducer, { UserStateAction } from './ducks/user'

export type RootAction = (PersistStateAction | TimetableStateAction | UserStateAction) & {
    localOnly?: boolean,
};

export const rootReducer = (state: PersistState = DEFAULT_PERSIST, action: RootAction): PersistState => produce(state, draft => {
    switch (action.type) {
        case 'setActivityGroup':
        case 'setAllSessions':
            draft.timetables[draft.current] = currentTimetableReducer(draft.timetables[draft.current], action);
            break;
        case 'setUser':
            draft.user = userReducer(draft.user, action);
            break;
        default:
            return persistReducer(draft, action);
    }
});

// const store = createStore(rootReducer, DEFAULT_PERSIST);