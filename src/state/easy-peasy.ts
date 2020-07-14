import { action, computed, Computed, Action, createTypedHooks, Actions, memo } from 'easy-peasy';
import { DEFAULT_PERSIST, PersistState } from './schema';
import { Timetable, CourseEvent, CourseActivity, EMPTY_TIMETABLE, CourseActivityGroup } from './types';
import { v4 as uuidv4 } from 'uuid';
import { makeActivityGroupKey, coerceToArray, getCourseGroups } from '../logic/functions';
import _ from 'lodash';

export type ActivitiesNested = {[course: string]: {[activity: string]: {[group: string]: CourseEvent[]}}};

export type PersistModel = PersistState & {

  setUser: Action<PersistModel, firebase.User | null>,

  currentTimetable: Computed<PersistModel, Timetable>,
  activities: Computed<PersistModel, ActivitiesNested>,

  new: Action<PersistModel, string | undefined | void>,
  select: Action<PersistModel, string>,
  delete: Action<PersistModel, string>,
  rename: Action<PersistModel, string>,
  copy: Action<PersistModel>,

  updateSessions: Action<PersistModel, CourseEvent[]>,
  deleteCourse: Action<PersistModel, string>,
  setCourseVisibility: Action<PersistModel, { course: string, visible: boolean }>,
  setSelectedGroups: Action<PersistModel, CourseActivity & { group: string[] }>,
  setOneSelectedGroup: Action<PersistModel, CourseActivityGroup & { selected: boolean }>,
  replaceOneSelectedGroup: Action<PersistModel, CourseActivity & { old: string, new: string }>,

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

  currentTimetable: computed(s => {
    // console.log('timetable', s);
    // console.log(s.currentTimetable);
    // debugger;
    return s.timetables[s.current];
  }),

  activities: computed(
    [s => s.timetables[s.current]!.allSessions],
    sessions => {
      const activities: ActivitiesNested = {};
      for (const s of sessions) {
        if (activities?.[s.course]?.[s.activity]?.[s.group] == null) {
          _.set(activities, [s.course, s.activity, s.group], []);
        }
        activities[s.course][s.activity][s.group].push(s);
      }
      return activities;
    }
  ),

  new: action((s, name) => {
    const id = uuidv4();
    s.timetables[id] = EMPTY_TIMETABLE;
    s.timetables[id].name = name ? name : "new timetable";
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
    s.timetables[s.current]!.name = name;
  }),

  copy: action(s => {
    const old = s.currentTimetable;
    const newID = uuidv4();
    s.timetables[newID] = { ...old };
    s.timetables[newID].name = old.name.trimRight() + ' (copy)';
    s.current = newID;
  }),


  updateSessions: action((s, sessions) => {
    const newActivities = new Set(sessions.map(makeActivityGroupKey));
    // console.log('newActivities', newActivities);
    const oldSessions = s.timetables[s.current]!.allSessions;
    s.timetables[s.current]!.allSessions = [
      ...sessions,
      ...oldSessions.filter(x => !newActivities.has(makeActivityGroupKey(x)))
    ];
  }),

  deleteCourse: action((s, course) => {
    s.timetables[s.current]!.allSessions = s.timetables[s.current]!.allSessions.filter(
      x => x.course !== course
    );
  }),

  setCourseVisibility: action((s, {course, visible}) => {
    if (s.timetables[s.current]!.courseVisibility == null)
      s.timetables[s.current]!.courseVisibility = {};
    s.timetables[s.current]!.courseVisibility![course] = visible;
  }),

  setSelectedGroups: action((s, {course, activity, group}) => {
    _.set(s.timetables[s.current]!.selectedGroups, [course, activity], group);
  }),

  setOneSelectedGroup: action((s, {course, activity, group, selected}) => {
    const oldSelected = coerceToArray(s.timetables[s.current]!.selectedGroups?.[course]?.[activity]);

    if (oldSelected.includes(group) !== selected) {
      if (!selected) {
        _.set(s.timetables[s.current]!.selectedGroups, [course, activity], 
          oldSelected.filter(x => x !== group));
      } else {
        _.set(s.timetables[s.current]!.selectedGroups, [course, activity], 
          [...oldSelected, group]);
      }
    }
  }),

  replaceOneSelectedGroup: action((s, payload) => {
    const oldGroups = coerceToArray(s.timetables[s.current]!.selectedGroups?.[payload.course]?.[payload.activity]);
    _.set(
      s.timetables[s.current]!.selectedGroups, 
      [payload.course, payload.activity],
      oldGroups.map(x => x === payload.old ? payload.new : x)
    );
  })
};

// export const store = createStore(model);


const typedHooks = createTypedHooks<PersistModel>();

// 👇 export the typed hooks
export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;

export const useTimetableActions = () => ({ 
  select: useStoreActions(s => s.select),
  new: useStoreActions(s => s.new),
  copy: useStoreActions(s => s.copy),
  delete: useStoreActions(s => s.delete),
  rename: useStoreActions(s => s.rename),
});

export const mapCurrentTimetableActions = (a: Actions<PersistModel>) => ({
  updateSessions: a.updateSessions,
  deleteCourse: a.deleteCourse,
  setCourseVisibility: a.setCourseVisibility,
  setSelectedGroups: a.setSelectedGroups,
  replaceOneSelectedGroup: a.replaceOneSelectedGroup,
});