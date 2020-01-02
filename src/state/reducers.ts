import { TimetableState, CourseEvent, SelectedActivities, EMPTY_TIMETABLE } from "./types";
import produce from 'immer';
import _ from "lodash";
import { PersistState } from "./schema";

export type TimetableStateAction = {
    type: 'setAllSessions',
    sessions: CourseEvent[]
} | {
    type: 'setActivityGroup',
    course: string,
    activity: string,
    group: string | null,
}

export const setDefaultGroupsForSessions = (selectedGroups: SelectedActivities, sessions: CourseEvent[]) => 
    sessions.forEach(sess => {
        if (selectedGroups?.[sess.course]?.[sess.activity] === undefined) {
            _.set(selectedGroups, [sess.course, sess.activity], sess.group);
        }
    });

export const timetableStateReducer = (state: TimetableState, action: TimetableStateAction) => produce(state, (draft) => {
    console.log('producing new state for action:');
    console.log(action);
    
    switch (action.type) {
        case 'setAllSessions':
            draft.allSessions = action.sessions;
            setDefaultGroupsForSessions(draft.selectedGroups, action.sessions);
            break;
        case 'setActivityGroup':
            if (action.group === null) {
                _.unset(draft.selectedGroups, [action.course, action.activity]);
            } else {
                _.set(draft.selectedGroups, [action.course, action.activity], action.group);
            }
            break;
        default:
            throw new Error('invalid dispatched action type');
    }
});

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
}

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

export const persistStateReducer = (state: PersistState, action: PersistStateAction) => produce(state, (draft) => {

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
            throw new Error();
    }
});

export type PersistStateReducer = typeof persistStateReducer;