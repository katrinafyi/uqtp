export type ClockTime = {
    hour: number, minute: number,
};

export enum DayOfWeek {
    Monday = 0, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}


export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export type DayNames = typeof DAY_NAMES;

export const DEFAULT_WEEK_PATTERN = '1'.repeat(65);

export const DEFAULT_COURSE_COLOUR: RGBAColour = '#fafafa';


export type Course = {
    course: string,
}

export type CourseActivity = Course & {
    activity: string,
    activityType?: string,
    numGroups?: number
}

export type CourseActivityGroup = CourseActivity & {
    group: string,
}

export type CourseEvent = CourseActivityGroup & {
    description: string, 

    dates: string,

    day: DayOfWeek,
    time: ClockTime, 
    campus: string,
    location: string, 
    /** Duration of activity is in minutes. */
    duration: number,

    startDate?: string,
    weekPattern?: string,
}

export type SelectedActivities = {
    [course: string]: { [activity: string]: string[] | string }
}

export type CourseVisibility = {[course: string]: boolean};

// export type RGBAColour = {r: number, g: number, b: number, a?: number};
export type RGBAColour = string;
export type CourseColours = {[course: string]: RGBAColour};

export type Timetable = {
    name: string,
    allSessions: CourseEvent[],
    selectedGroups: SelectedActivities,
    courseVisibility?: CourseVisibility,
    courseColours?: CourseColours
}

export const EMPTY_TIMETABLE: Timetable = {
    name: 'empty timetable',
    allSessions: [],
    selectedGroups: {},
    courseVisibility: {},
    courseColours: {},
}

export type TimetablesState = {
    [id: string]: Timetable,
}