import { TimetableState, CourseSession } from "./types";
import produce from 'immer';
import _ from "lodash";

export type TimetableStateAction = {
    type: 'setAllSessions',
    sessions: CourseSession[]
} | {
    type: 'setActivityGroup',
    course: string,
    activity: string,
    group: string | null,
}

export const timetableStateReducer = (state: TimetableState, action: TimetableStateAction) => produce(state, (draft) => {
    console.log('producing new state for action:');
    console.log(action);
    
    switch (action.type) {
        case 'setAllSessions':
            draft.allSessions = action.sessions;
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