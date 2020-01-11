import { Timetable, CourseEvent, SelectedActivities } from "./types";
import { StateMetadata, PersistState, CURRENT_VERSION } from "./schema";
import { UserState } from "./ducks/user";
import _ from "lodash";
import uuidv4 from 'uuid/v4';

type OldTimetableState = {
    allSessions: CourseEvent[],
    selectedGroups: SelectedActivities,
}

type Schema0 = {
    timetables: {
        [name: string]: OldTimetableState,
    },
    current: string,
}

type Schema10 = {
    timetables: {
        [name: string]: OldTimetableState,
    },
    current: string,
} & StateMetadata<10>;

type Schema11 = {
    timetables: {
        [name: string]: OldTimetableState,
    },
    current: string,
    user: UserState,
} & StateMetadata<11>;

type Schema12 = {
    timetables: {
        [id: string]: Timetable,
    },
    current: string,
    user: UserState,
} & StateMetadata<12>;


const migrate0To10 = (state: Schema0): Schema10 => {
    return { ...state, _meta: { version: 10 } };
}

const migrate10to11 = (state: Schema10): Schema11 => {
    return { ...state, user: null, _meta: {...state._meta, version: 11} };
}

const migrate11To12 = (state: Schema11): Schema12 => {
    const newState = _.cloneDeep(state);
    const currentID = uuidv4();
    const newEntries = Object.entries(newState.timetables)
        .map(([name, timetable]) => 
            [name === state.current ? currentID : uuidv4(), {...timetable, name}] as const);
    const newTimetables = Object.fromEntries(newEntries);
    return { ...state, timetables: newTimetables, current: currentID, 
        _meta: {...state._meta, version: 12} };
}


export type AllSchemas = Schema0 | Schema10 | Schema11 | Schema12;

// any type o.O
const MIGRATIONS: {[prev: number]: (a: any) => AllSchemas} = {
    0: migrate0To10,
    10: migrate10to11,
    11: migrate11To12,
}

const getStateSchemaVersion = (state: StateMetadata) => {
    return state?._meta?.version ?? 0;
}

export const migratePeristState = (state: AllSchemas, latest: number = CURRENT_VERSION): PersistState | null => {
    let stateVer = getStateSchemaVersion(state as StateMetadata);
    if (stateVer === latest) return null;
    
    while (stateVer < latest) {
        if (MIGRATIONS[stateVer] === undefined)
            throw new Error("No migration from " + stateVer);
        console.log("Applying migration from state " + stateVer);
        state = MIGRATIONS[stateVer](state);
        stateVer = getStateSchemaVersion(state as StateMetadata);
    }
    if (stateVer > latest)
        throw new Error("State has version greater than expected. Latest is "
        +latest+" but current state is "+stateVer);
    // @ts-ignore
    return state; 
}