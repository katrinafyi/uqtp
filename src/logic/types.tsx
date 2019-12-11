export type ClockTime = {
    hour: number, minute: number,
};

export enum DayOfWeek {
    Monday = 0, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}

export type CourseSession = {
    course: string,
    description: string, 
    activity: string, 
    activityType: string,
    group: number,

    sessions: CourseSession[],
    dates: string,

    day: DayOfWeek,
    time: ClockTime, 
    campus: string,
    location: string, 
    /** Duration of activity is in minutes. */
    duration: number,
}

export type TimetableState = {
    allSessions: CourseSession[],
    //enabledActivities: CourseActivity[]
}

export const defaultState: TimetableState = {
    allSessions: []
}