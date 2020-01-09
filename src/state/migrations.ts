import { TimetableState } from "./types";
import { StateMetadata, PersistState } from "./schema";
import { UserState } from "./ducks/user";



type Schema0 = {
    timetables: {
        [name: string]: TimetableState,
    },
    current: string,
}

type Schema10 = {
    timetables: {
        [name: string]: TimetableState,
    },
    current: string,
} & StateMetadata;

type Schema11 = {
    timetables: {
        [name: string]: TimetableState,
    },
    current: string,
    user: UserState,
} & StateMetadata;


const migrate0To10 = (state: Schema0): Schema10 => {
    return { ...state, _meta: { version: 10 } };
}

const migrate10to11 = (state: Schema10): Schema11 => {
    return { ...state, user: null, _meta: {...state._meta, version: 11} };
}


export type AllSchemas = Schema0 | Schema10 | Schema11;

const MIGRATIONS: {[prev: number]: (a: AllSchemas) => AllSchemas} = {
    0: migrate0To10,
    10: migrate10to11,
}

const getStateSchemaVersion = (state: StateMetadata) => {
    return state?._meta?.version ?? 0;
}

export const migratePeristState = (state: AllSchemas, latest: number): PersistState | null => {
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