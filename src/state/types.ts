export type ClockTime = {
    hour: number, minute: number,
};

export enum DayOfWeek {
    Monday = 0, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}


export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export type DayNames = typeof DAY_NAMES;

export const DEFAULT_WEEK_PATTERN = '1'.repeat(65);

export const DEFAULT_COURSE_COLOUR: RGBAColour = '#FAFAFA';


export type Course = {
    course: string,
}

export type CourseActivity = Course & {
    activity: string,
    activityType?: string,
    // numGroups?: number
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

export type RGBAColour = string;
// export type RGBAColour = {r: number, g: number, b: number, a?: number};

// helper classes for various levels of data structures.
export type CourseMap<V> = { [course: string]: V };
export type CourseActivityMap<V> = CourseMap<{ [activity: string]: V }>
export type CourseActivityGroupMap<V> = CourseActivityMap<{ [group: string]: V }>

export type SelectionsByGroup = CourseActivityGroupMap<boolean>;
export type SessionsByGroup = CourseActivityGroupMap<{ [sessionId: string]: CourseEvent }>

export type CourseVisibility = CourseMap<boolean>;
export type CourseColours = CourseMap<RGBAColour>;


export type Timetable = {
    name: string,
    sessions: SessionsByGroup,
    selections: SelectionsByGroup,
    courseVisibility?: CourseVisibility,
    courseColours?: CourseColours
}

export const EMPTY_TIMETABLE: Timetable = {
    name: 'empty timetable',
    sessions: {},
    selections: {},
    courseVisibility: {},
    courseColours: {},
}

export type TimetablesState = {
    [id: string]: Timetable,
}