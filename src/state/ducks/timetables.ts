import { CourseEvent, SelectedActivities, Timetable } from "../types";
import produce from "immer";
import _ from "lodash";
import { makeActivityKey } from "../../logic/functions";

export type TimetableStateAction = {
    type: 'setAllSessions',
    sessions: CourseEvent[]
} | {
    type: 'setActivityGroup',
    course: string,
    activity: string,
    group: string | null,
} | {
    type: 'deleteCourse',
    course: string
};

export const setAllSessions = (sessions: CourseEvent[]): TimetableStateAction => 
    ({ type: 'setAllSessions', sessions });

export const setActivityGroup = (course: string, activity: string, group: string | null): TimetableStateAction =>
    ({ type: 'setActivityGroup', course, activity, group });

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
            const sessions = [...action.sessions,
                ...state.allSessions.filter(x => !newActivities.has(makeActivityKey(x)))];
            draft.allSessions = sessions;
            setDefaultGroupsForSessions(draft.selectedGroups, sessions);
            break;
        case 'setActivityGroup':
            if (action.group === null) {
                _.unset(draft.selectedGroups, [action.course, action.activity]);
            } else {
                _.set(draft.selectedGroups, [action.course, action.activity], action.group);
            }
            break;
        case 'deleteCourse':
            draft.allSessions = state.allSessions.filter(x => x.course !== action.course);
            delete draft.selectedGroups[action.course];
            break;
        default:
            return;
    }
});

export default timetableReducer;