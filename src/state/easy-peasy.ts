import { createStore, action, thunk, computed, Computed, Action, Actions, Thunk, Dispatch, State } from 'easy-peasy';
import { DEFAULT_PERSIST, PersistState } from './schema';
import { Timetable } from './types';
import produce from 'immer';

type Model = PersistState & {
  currentTimetable: Computed<Model, Timetable>,
  renameTimetable: Thunk<Model, string>,
  copyTimetable: Thunk<Model>
};

const firebaseAction = <T>(f: (m: State<Model>, payload: T) => T | undefined) => {
  return (
    actions: Actions<Model>,
    payload: T,
    helpers: {
      dispatch: Dispatch<Model>;
      getState: () => State<Model>;
      getStoreActions: () => Actions<Model>;
      getStoreState: () => State<Model>;
    }
  ) => {
    const newState = produce(helpers.getState(), draft => f(draft, payload));
    console.log("produced new state??", newState);
    return 'a';
  }
}

const model: Model = {
  ...DEFAULT_PERSIST,
  currentTimetable: computed(s => s.timetables[s.current]),
  renameTimetable: thunk(firebaseAction((s, name) => {
      s.currentTimetable.name = name;
  })),
  copyTimetable: action(s => {
    const old = s.currentTimetable;
    const newID = uuidv4();
    s.timetables[newID] = {...old};
    s.timetables[newID].name = old.name.trimRight() + ' (copy)';
  }),

}

const store = createStore(DEFAULT_PERSIST);


export type PersistStateAction = {
    type: 'renameTimetable',
    id: string,
    new: string,
} | {
    type: 'copyTimetable',
    id: string, 
} | {
    type: 'deleteTimetable',
    id: string,
} | {
    type: 'selectTimetable',
    id: string,
} | {
    type: 'newTimetable',
} | {
    type: 'setPersistState',
    state: PersistState,
    localOnly: true,
};

export const renameTimetable = (id: string, newName: string): PersistStateAction  =>
    ({ type: 'renameTimetable', id, new: newName });
export const copyTimetable = (id: string): PersistStateAction => 
    ({ type: 'copyTimetable', id: id });
export const deleteTimetable = (id: string): PersistStateAction => 
    ({ type: 'deleteTimetable', id: id })
export const selectTimetable = (id: string): PersistStateAction => 
    ({ type: 'selectTimetable', id: id });
export const newTimetable = (): PersistStateAction => 
    ({ type: 'newTimetable' });
export const setPersistState = (state: PersistState): PersistStateAction => 
    ({ type: 'setPersistState', state, localOnly: true });

const persistReducer = (state: PersistState, action: PersistStateAction) => produce(state, (draft) => {


    const selectTimetable = (id: string) => {
        draft.current = id;
    };
    const addNewTimetable = (name: string) => {
        const newID = uuidv4();
        draft.timetables[newID] = EMPTY_TIMETABLE;
        draft.timetables[newID].name = name;
        selectTimetable(newID);
        return newID;
    };
    const deleteTimetable = (id: string) => {
        delete draft.timetables[id];
        if (id === draft.current) {
            const newCurrent = Object.keys(draft.timetables)[0];
            if (newCurrent === undefined)
                addNewTimetable('new timetable');
            else 
                selectTimetable(newCurrent);
        }
    };
    const dupeTimetable = (id: string) => {
        const old = state.timetables[id];
        const newID = uuidv4();
        draft.timetables[newID] = {...old};
        draft.timetables[newID].name = old.name.trimRight() + ' (copy)';
        selectTimetable(newID);
    };

    switch (action.type) {
        case 'deleteTimetable':
            deleteTimetable(action.id);
            break;
        case 'newTimetable':
            addNewTimetable('new timetable');
            break;
        case 'copyTimetable':
            dupeTimetable(action.id);
            break;
        case 'renameTimetable':
            draft.timetables[action.id].name = action.new;
            break;
        case 'selectTimetable':
            selectTimetable(action.id);
            break;
        case 'setPersistState':
            draft.timetables = action.state.timetables;
            draft.current = action.state.current;
            draft._meta = action.state._meta;
            break;
        default:
            return;
    }
});

// export type PersistStateReducer = typeof persistStateReducer;
export default persistReducer;