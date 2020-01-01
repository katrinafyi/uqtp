import { TimetableState } from "./types";
import { StateMetadata, PersistState } from "./schema";



type Schema0 = {
    timetables: {
        [name: string]: TimetableState,
    },
    current: string,
}

type Schema10 = PersistState;


const migrate0To10 = (state: Schema0): Schema10 => {
    return { ...state, _meta: { version: 10 } };
}


export type AllSchemas = Schema0 | Schema10;

const MIGRATIONS: {[prev: number]: (a: AllSchemas) => AllSchemas} = {
    0: migrate0To10
}


const getStateSchemaVersion = (state: StateMetadata) => {
    return state?._meta?.version ?? 0;
}

export const migratePeristState = (state: AllSchemas, latest: number) => {
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
    return state;    
}