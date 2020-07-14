import { createStore, action, thunk, computed, Computed, Action, Actions, Thunk, Dispatch, State, createTypedHooks } from 'easy-peasy';
import { DEFAULT_PERSIST, PersistState } from './schema';
import { Timetable, CourseEvent, CourseActivity, EMPTY_TIMETABLE } from './types';
import { v4 as uuidv4 } from 'uuid';
import { makeActivityKey, coerceToArray } from '../logic/functions';
import _ from 'lodash';

export type PersistModel = PersistState & {

  setUser: Action<PersistModel, firebase.User | null>,

  timetable: {
    current: Computed<PersistModel, Timetable>,
    
    new: Action<PersistModel, string | undefined>,
    select: Action<PersistModel, string>,
    delete: Action<PersistModel, string>,
    rename: Action<PersistModel, string>,
    copy: Action<PersistModel>,

    updateSessions: Action<PersistModel, CourseEvent[]>,
    deleteCourse: Action<PersistModel, string>,
    setCourseVisibility: Action<PersistModel, [string, boolean]>,
    setActivityGroups: Action<PersistModel, CourseActivity & {group: string[]}>,
    replaceActivityGroup: Action<PersistModel, CourseActivity & {old: string, new: string}>,
  },

};


export const model: PersistModel = {
  ...DEFAULT_PERSIST,

  setUser: action((s, user) => {
    if (!user) {
      s.user = null;
      return;
    }
    s.user = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      phone: user.phoneNumber,
      providers: user.providerData?.map(x => x?.providerId ?? JSON.stringify(x)),
      isAnon: user.isAnonymous,
    };
  }),

  timetable: {
    current: computed(s => s.timetables[s.current]),

    new: action((s, name) => {
      const id = uuidv4();
      s.timetables[id] = EMPTY_TIMETABLE;
      s.timetables[id].name = name ?? "new timetable";
      s.current = id;
    }),

    select: action((s, id) => {
      s.current = id;
    }),

    delete: action((s, id) => {
      if (Object.keys(s.timetables).length === 1) {
        console.error("refusing to delete the last timetable");
        return;
      }
      delete s.timetables[id];
      const newID = _.minBy(
        Object.keys(s.timetables), 
        k => s.timetables[k].name
      );
      console.assert(newID != null, "next ID after deleting cannot be null");
      s.current = newID!;
    }),
    
    rename: action((s, name) => {
      s.timetable.current.name = name;
    }),
    copy: action(s => {
      const old = s.timetable.current;
      const newID = uuidv4();
      s.timetables[newID] = { ...old };
      s.timetables[newID].name = old.name.trimRight() + ' (copy)';
      s.current = newID;
    }),

    updateSessions: action((s, sessions) => {
      const newActivities = new Set(sessions.map(makeActivityKey));
      // console.log('newActivities', newActivities);
      const oldSessions = s.timetable.current.allSessions;
      s.timetable.current.allSessions = [
        ...sessions,
        ...oldSessions.filter(x => !newActivities.has(makeActivityKey(x)))
      ];
    }),

    deleteCourse: action((s, course) => {
      s.timetable.current.allSessions = s.timetable.current.allSessions.filter(
        x => x.course !== course
      );
    }),

    setCourseVisibility: action((s, [course, visible]) => {
      if (s.timetable.current.courseVisibility == null)
        s.timetable.current.courseVisibility = {};
      s.timetable.current.courseVisibility[course] = visible;
    }),

    setActivityGroups: action((s, payload) => {
      _.set(
        s.timetable.current.selectedGroups, 
        [payload.course, payload.activity], 
        payload.group
      );
    }),

    replaceActivityGroup: action((s, payload) => {
      const oldGroups = coerceToArray(s.timetable.current.selectedGroups?.[payload.course]?.[payload.activity]);
      _.set(
        s.timetable.current.selectedGroups, 
        [payload.course, payload.activity],
        oldGroups.map(x => x === payload.old ? payload.new : x)
      );
    })
  },
};

// export const store = createStore(model);


const typedHooks = createTypedHooks<PersistModel>();

// 👇 export the typed hooks
export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;