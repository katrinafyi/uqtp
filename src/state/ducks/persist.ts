import { PersistState } from "../schema";
import produce from "immer";
import { EMPTY_TIMETABLE } from "../types";
import uuidv4 from 'uuid/v4';

export type PersistStateAction = {
    type: 'renameTimetable',
    id: string,
    new: string,
} | {
    type: 'copyTimetable',
    id: string, 
} | {
    type: 'deleteTimetable',
    id: string,
} | {
    type: 'selectTimetable',
    id: string,
} | {
    type: 'newTimetable',
} | {
    type: 'setPersistState',
    state: PersistState,
    localOnly: true,
};

export const renameTimetable = (id: string, newName: string): PersistStateAction  =>
    ({ type: 'renameTimetable', id, new: newName });
export const copyTimetable = (id: string): PersistStateAction => 
    ({ type: 'copyTimetable', id: id });
export const deleteTimetable = (id: string): PersistStateAction => 
    ({ type: 'deleteTimetable', id: id })
export const selectTimetable = (id: string): PersistStateAction => 
    ({ type: 'selectTimetable', id: id });
export const newTimetable = (): PersistStateAction => 
    ({ type: 'newTimetable' });
export const setPersistState = (state: PersistState): PersistStateAction => 
    ({ type: 'setPersistState', state, localOnly: true });

const persistReducer = (state: PersistState, action: PersistStateAction) => produce(state, (draft) => {


    const selectTimetable = (id: string) => {
        draft.current = id;
    };
    const addNewTimetable = (name: string) => {
        const newID = uuidv4();
        draft.timetables[newID] = EMPTY_TIMETABLE;
        draft.timetables[newID].name = name;
        selectTimetable(newID);
        return newID;
    };
    const deleteTimetable = (id: string) => {
        delete draft.timetables[id];
        if (id === draft.current) {
            const newCurrent = Object.keys(draft.timetables)[0];
            if (newCurrent === undefined)
                addNewTimetable('new timetable');
            else 
                selectTimetable(newCurrent);
        }
    };
    const dupeTimetable = (id: string) => {
        const newID = uuidv4();
        draft.timetables[newID] = draft.timetables[id];
        selectTimetable(newID);
    };

    switch (action.type) {
        case 'deleteTimetable':
            deleteTimetable(action.id);
            break;
        case 'newTimetable':
            addNewTimetable('new timetable');
            break;
        case 'copyTimetable':
            dupeTimetable(action.id);
            break;
        case 'renameTimetable':
            draft.timetables[action.id].name = action.new;
            break;
        case 'selectTimetable':
            selectTimetable(action.id);
            break;
        case 'setPersistState':
            draft.timetables = action.state.timetables;
            draft.current = action.state.current;
            draft._meta = action.state._meta;
            break;
        default:
            return;
    }
});

// export type PersistStateReducer = typeof persistStateReducer;
export default persistReducer;