import { PersistState } from "../schema";
import produce from "immer";
import { EMPTY_TIMETABLE } from "../types";
import { RootAction } from "../store";
import { Dispatch } from "redux";
import { database } from "firebase";

export type PersistStateAction = {
    type: 'renameTimetable',
    old: string,
    new: string,
} | {
    type: 'copyTimetable',
    old: string, 
    new: string,
} | {
    type: 'deleteTimetable',
    name: string,
} | {
    type: 'selectTimetable',
    name: string,
} | {
    type: 'newTimetable',
};

export const renameTimetable = (oldName: string, newName: string): PersistStateAction  =>
    ({ type: 'renameTimetable', old: oldName, new: newName });
export const copyTimetable = (oldName: string, newName: string): PersistStateAction => 
    ({ type: 'copyTimetable', old: oldName, new: newName });
export const deleteTimetable = (name: string): PersistStateAction => 
    ({ type: 'deleteTimetable', name })
export const selectTimetable = (name: string): PersistStateAction => 
    ({ type: 'selectTimetable', name });
export const newTimetable = (): PersistStateAction => 
    ({ type: 'newTimetable' })

const newUniqueName = (name: string, existing: string[]) => {
    if (!existing.includes(name))
        return name;
    const match = / \((\d+)\)$/.exec(name);
    let i = 1;
    if (match) {
        i = parseInt(match[1]);
        name = name.slice(0, -match[0].length);
    }
    while (true) {
        const newName = `${name} (${i})`;
        if (!existing.includes(newName)) 
            return newName;
        i++;
    }
}

const persistReducer = (state: PersistState, action: PersistStateAction) => produce(state, (draft) => {

    const selectTimetable = (name: string) => {
        draft.current = name;
    };
    const newTimetable = (name: string) => {
        const newName = newUniqueName(name, Object.keys(draft.timetables));
        draft.timetables[newName] = EMPTY_TIMETABLE;
        selectTimetable(newName);
        return newName;
    };
    const deleteTimetable = (name: string) => {
        delete draft.timetables[name];
        if (name === draft.current) {
            const newCurrent = Object.keys(draft.timetables)[0];
            if (newCurrent === undefined)
                newTimetable('new timetable');
            else 
                selectTimetable(newCurrent);
        }
    };
    const copyTimetable = (newName: string, oldName: string) => {
        const uniqName = newTimetable(newName);
        draft.timetables[uniqName] = draft.timetables[oldName];
        selectTimetable(uniqName);
    };

    switch (action.type) {
        case 'deleteTimetable':
            deleteTimetable(action.name);
            break;
        case 'newTimetable':
            newTimetable('new timetable');
            break;
        case 'copyTimetable':
            copyTimetable(action.new, action.old);
            break;
        case 'renameTimetable':
            if (action.new === action.old) break;
            copyTimetable(action.new, action.old);
            deleteTimetable(action.old);
            break;
        case 'selectTimetable':
            selectTimetable(action.name)
            break;
        default:
            return;
    }
});

// export type PersistStateReducer = typeof persistStateReducer;
export default persistReducer;