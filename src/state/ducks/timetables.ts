import { CourseEvent, SelectedActivities, Timetable } from "../types";
import produce from "immer";
import _ from "lodash";
import { makeActivityKey, coerceToArray } from "../../logic/functions";

export type TimetableStateAction = {
    type: 'setAllSessions',
    sessions: CourseEvent[]
} | {
    type: 'setActivityGroup',
    course: string,
    activity: string,
    group: string | null | string[],
} | {
    type: 'deleteCourse',
    course: string
} | {
    type: 'replaceActivityGroup',
    course: string,
    activity: string,
    oldGroup: string,
    newGroup: string
};

export const setAllSessions = (sessions: CourseEvent[]): TimetableStateAction => 
    ({ type: 'setAllSessions', sessions });

export const setActivityGroup = (course: string, activity: string, group: string[]): TimetableStateAction =>
    ({ type: 'setActivityGroup', course, activity, group });

export const replaceActivityGroup = (course: string, activity: string, oldGroup: string, newGroup: string): TimetableStateAction =>
    ({ type: 'replaceActivityGroup', course, activity, oldGroup, newGroup });

export const deleteCourse = (course: string): TimetableStateAction =>
    ({ type: 'deleteCourse', course });


const setDefaultGroupsForSessions = (selectedGroups: SelectedActivities, sessions: CourseEvent[]) => 
    sessions.forEach(sess => {
        if (selectedGroups?.[sess.course]?.[sess.activity] === undefined) {
            _.set(selectedGroups, [sess.course, sess.activity], sess.group);
        }
    });

const timetableReducer = (state: Timetable, action: TimetableStateAction) => produce(state, (draft) => {
    // console.log('producing new state for action:');
    // console.log(action);
    
    switch (action.type) {
        case 'setAllSessions':
            const newActivities = new Set(action.sessions.map(makeActivityKey));
            // console.log('newActivities', newActivities);
            const sessions = [...action.sessions,
                ...state.allSessions.filter(x => !newActivities.has(makeActivityKey(x)))];
            draft.allSessions = sessions;
            setDefaultGroupsForSessions(draft.selectedGroups, sessions);
            break;
        case 'setActivityGroup':
            _.set(draft.selectedGroups, [action.course, action.activity], coerceToArray(action.group ?? []));
            break;
        case 'replaceActivityGroup':
            const oldGroups = coerceToArray(state.selectedGroups?.[action.course]?.[action.activity]);
            _.set(draft.selectedGroups, [action.course, action.activity],
                oldGroups.map(x => x === action.oldGroup ? action.newGroup : x));
            break;
        case 'deleteCourse':
            draft.allSessions = state.allSessions.filter(x => x.course !== action.course);
            // delete draft.selectedGroups[action.course];
            break;
        default:
            return;
    }
});

export default timetableReducer;