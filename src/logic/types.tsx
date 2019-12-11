export enum DayOfWeek {
    Monday = 0, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}

export type CourseSession = {
    day: DayOfWeek,
    time: number, 
    campus: string,
    location: string, 
    /** Duration of activity is in minutes. */
    duration: number
}

export type CourseActivity = {
    course: string,
    description: string, 
    activity: string, 
    group: number,

    sessions: CourseSession[],
    dates_raw: string,
}

export type TimetableState = {
    allActivities: CourseActivity[],
    enabledActivities: CourseActivity[]
}