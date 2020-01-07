import { createStore, combineReducers } from 'redux'
import persistReducer from './ducks/persist'
import currentTimetableReducer, { TimetableStateAction } from './ducks/timetables'
import { PersistStateAction } from './ducks/persist'
import { PersistState, DEFAULT_PERSIST } from './schema'
import produce from 'immer'

export type RootAction = PersistStateAction | TimetableStateAction;

export const rootReducer = (state: PersistState = DEFAULT_PERSIST, action: RootAction): PersistState => produce(state, draft => {
    switch (action.type) {
        case 'setActivityGroup':
        case 'setAllSessions':
            draft.timetables[draft.current] = currentTimetableReducer(draft.timetables[draft.current], action);
            break;
        case 'copyTimetable':
        case 'deleteTimetable':
        case 'renameTimetable':
        case 'newTimetable':
        case 'selectTimetable':
            return persistReducer(draft, action);
        default:
            return draft;
    }
});

// const store = createStore(rootReducer, DEFAULT_PERSIST);