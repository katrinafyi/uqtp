export type ClockTime = {
    hour: number, minute: number,
};

export enum DayOfWeek {
    Monday = 0, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}


export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export type DayNames = typeof DAY_NAMES;

export type CourseActivity = {
    course: string,
    activity: string,
    activityType?: string,
    numGroups?: number
}

export type CourseGroup = CourseActivity & {
    group: string,
}

export type CourseEvent = CourseGroup & {
    description: string, 

    dates: string,

    day: DayOfWeek,
    time: ClockTime, 
    campus: string,
    location: string, 
    /** Duration of activity is in minutes. */
    duration: number,
}

export type SelectedActivities = {
    [course: string]: { [activity: string]: string | string[] }
}

export type Timetable = {
    name: string,
    allSessions: CourseEvent[],
    selectedGroups: SelectedActivities,
}

export const EMPTY_TIMETABLE: Timetable = {
    name: 'empty timetable',
    allSessions: [],
    selectedGroups: {},
}

export type TimetablesState = {
    [id: string]: Timetable,
}