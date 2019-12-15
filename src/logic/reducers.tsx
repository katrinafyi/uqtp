import { TimetableState, CourseEvent, SelectedActivities } from "./types";
import produce from 'immer';
import _ from "lodash";

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