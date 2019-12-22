import { CourseEvent, CourseActivity, CourseGroup } from "../state/types";
import _ from "lodash";

export const computeDayTimeArrays = (sessions: CourseEvent[]) => {
    const byDayTime = _.range(7)
        .map(() => _.range(24).map(() => [] as CourseEvent[]));

    sessions.forEach(session => {
        // we know the event starts somewhere in this hour.
        byDayTime[session.day][session.time.hour].push(session);
        // start time of event, in minutes past midnight
        const startTime = session.time.hour * 60;
        // compute ending time of event
        const endHour = session.time.hour * 60 + session.time.minute + session.duration;
        for (let i = session.time.hour + 1; i * 60 < endHour; i++) {
            if (i >= 24) throw new Error('event has continued into next day. unsupported!');
            // console.log(session);
            // console.log('continued into hour ' + i);
            
            byDayTime[session.day][i].push(session);
        }
    });
    return byDayTime;
};

export const makeSessionKey = (session: CourseEvent) => 
    [session.course, session.activity, session.group, session.day, session.time.hour].join('|');

export const getCourseCode = (longCode: string) => longCode.split('_')[0];

export const isHighlighted = (session: CourseGroup, highlight: CourseActivity | null) => 
    session.course === highlight?.course && session.activity === highlight.activity;