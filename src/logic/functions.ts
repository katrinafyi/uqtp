import { CourseEvent, CourseActivity, CourseActivityGroup, ClockTime } from "../state/types";
import _ from "lodash";
import { memo } from "easy-peasy";

export const computeDayTimeArrays = (sessions: CourseEvent[]) => {
    const byDayTime = _.range(7)
        .map(() => _.range(24).map(() => [] as (CourseEvent | null)[]));

        
    sessions.sort(compareCourseEvents);
    
    let currentDay = 0;
    let currentHour = 0;
    let matrix: (CourseEvent | null)[][] = [];
    let matrixColumns = 0;
    // last hour in matrix is currentHour + currentMatrix.length - 1

    const checkFinishedMatrix = (next: CourseEvent | null) => {
        if (next == null || next.day > currentDay 
                || next.time.hour > currentHour + matrix.length - 1) {
            for (let r = 0; r < matrix.length; r++) {
                for (let c = 0; c < matrixColumns; c++) {
                    byDayTime[currentDay][r + currentHour][c] = matrix[r][c]; //c === 0 ? matrix[r][c] : null;
                }
            }
            // console.log('flushed matrix', matrix);

            if (next != null) {
                currentDay = next.day;
                currentHour = next.time.hour;
                matrix = [];
                matrixColumns = 0;
            }
        }
    }

    const validInsertPosition = (event: CourseEvent, row: number, col: number) => {
        const hours = Math.ceil(event.duration / 60);
        for (let i = 0; i < hours; i++) {
            if (matrix[row+i][col] != null)
                return false;
        }
        return true;
    };

    const insertIntoMatrix = (event: CourseEvent) => {
        const startRow = event.time.hour - currentHour;
        const hours = Math.ceil(event.duration / 60);

        // add rows as necessary
        while (startRow + hours > matrix.length) {
            matrix.push([]);
        }
        
        // find first available position from the left
        let col;
        for (col = 0; col < matrixColumns; col++) {
            if (validInsertPosition(event, startRow, col)) {
                break;
            }
        }

        if (col + 1 > matrixColumns)
            matrixColumns = col + 1;

        // place into this position
        for (let i = 0; i < hours; i++) {
            matrix[startRow + i][col] = event;
        }

    }

    
    for (const event of sessions) {
        checkFinishedMatrix(event);
        insertIntoMatrix(event);
    }
    checkFinishedMatrix(null);



    // sessions.forEach(session => {
    //     console.log(session);
    //     // we know the event starts somewhere in this hour.
    //     byDayTime[session.day][session.time.hour].push(session);
    //     // start time of event, in minutes past midnight
    //     const startTime = session.time.hour * 60;
    //     // compute ending time of event
    //     const endHour = session.time.hour * 60 + session.time.minute + session.duration;
    //     for (let i = session.time.hour + 1; i * 60 < endHour; i++) {
    //         if (i >= 24) throw new Error('event has continued into next day. unsupported!');
    //         // console.log(session);
    //         // console.log('continued into hour ' + i);
            
    //         byDayTime[session.day][i].push(session);
    //     }
    // });
    return byDayTime;
};

export const compareCourseEvents = (a: CourseEvent, b: CourseEvent) => {
    if (a.day !== b.day)
        return a.day - b.day;
    if (a.time.hour !== b.time.hour)
        return a.time.hour - b.time.hour;
    if (a.time.minute !== b.time.minute)
        return a.time.minute - b.time.minute;
    return 0;
};

export const getCourseGroups = memo((events: CourseEvent[]) => {
    console.log("computing getCourseGroups for ", events);
    return _(events)
        .map(({course, activity, activityType, group}) => ({course, activity, activityType, group}) as CourseActivityGroup)
        .uniqWith(_.isEqual).value();
}, 10);

// returns a string like CSSE2310|PRA1
export const makeActivityKey = (session: CourseEvent) => 
    session.course + '|' + session.activity;

export const sessionEndTime = (e: CourseEvent) => {
    const endMinutes = e.time.hour * 60 + e.time.minute + e.duration;
    return { 
        hour: Math.floor(endMinutes / 60),
        minute: endMinutes % 60,
    };
}

export const formatTime = (t: ClockTime) => {
    const d = new Date(2020, 1, 1, t.hour, t.minute);
    return d.toLocaleTimeString(undefined, {hour: 'numeric', minute: 'numeric'});
}

export const makeActivityGroupKey = (session: CourseEvent) =>
    [session.course, session.activity, session.group].join('|');

export const makeSessionKey = (session: CourseEvent) => 
    [session.course, session.activity, session.group, session.day, session.time.hour].join('|');

export const getCourseCode = (longCode: string) => longCode.split('_')[0];

export const isHighlighted = (session: CourseActivityGroup, highlight: CourseActivity | null) => 
    session.course === highlight?.course && session.activity === highlight.activity;

export const coerceToArray = <T>(arg?: T | T[]) => 
    arg === undefined ? [] : (Array.isArray(arg) ? arg : [arg]);