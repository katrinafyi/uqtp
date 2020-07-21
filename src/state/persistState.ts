import { action, computed, Computed, Action, createTypedHooks, Actions, memo, State } from 'easy-peasy';
import { PersistState, BLANK_PERSIST } from './schema';
import { Timetable, CourseEvent, CourseActivity, EMPTY_TIMETABLE, CourseActivityGroup, CourseVisibility, SelectedActivities, Course } from './types';
import { v4 as uuidv4 } from 'uuid';
import { coerceToArray, makeActivityKey, makeCustomSession, CUSTOM_COURSE, makeActivitySessionKey } from '../logic/functions';
import _ from 'lodash';

export type ActivitiesNested = {[course: string]: {[activity: string]: {[group: string]: CourseEvent[]}}};
export type SelectedNested = {[course: string]: {[activity: string]: string[]}};

export type PersistModel = PersistState & {
  setState: Action<PersistModel, PersistState>,

  setUser: Action<PersistModel, firebase.User | null>,

  currentTimetable: Computed<PersistModel, Timetable>,
  activities: Computed<PersistModel, ActivitiesNested>,
  selected: Computed<PersistModel, SelectedNested>,

  new: Action<PersistModel, string | undefined | void>,
  select: Action<PersistModel, string>,
  delete: Action<PersistModel, string>,
  rename: Action<PersistModel, string>,
  copy: Action<PersistModel>,

  updateCourseSessions: Action<PersistModel, CourseEvent[]>,
  updateActivitySessions: Action<PersistModel, CourseEvent[]>,
  deleteCourse: Action<PersistModel, string>,
  deleteActivitySession: Action<PersistModel, CourseEvent>,
  setCourseVisibility: Action<PersistModel, Course & { visible: boolean }>,
  setSelectedGroups: Action<PersistModel, CourseActivity & { group: string[] }>,
  setOneSelectedGroup: Action<PersistModel, CourseActivityGroup & { selected: boolean }>,
  replaceOneSelectedGroup: Action<PersistModel, CourseActivity & { old: string, new: string }>,

  addCustomEvent: Action<PersistModel, { day: number, hour: number, duration: number, label: string }>,

  isSessionVisible: Computed<PersistModel, (c: CourseEvent) => boolean>
};


export const model: PersistModel = {
  ...BLANK_PERSIST,

  setState: action((_, s) => {
    return s as any;
  }),

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

  currentTimetable: computed(memo((s: State<PersistModel>) => {
   //console.log('timetable', s);
   //console.log(s.currentTimetable);
    // debugger;
    return s.timetables[s.current];
  }, 2)),

  activities: computed(
    [s => s.timetables[s.current]!.allSessions],
    memo((sessions: CourseEvent[]) => {
      // console.error("recomputing activities");
      
      const activities: ActivitiesNested = {};
      for (const s of sessions) {
        if (activities?.[s.course]?.[s.activity]?.[s.group] == null) {
          _.set(activities, [s.course, s.activity, s.group], []);
        }
        activities[s.course][s.activity][s.group].push(s);
      }
      return activities;
    }, 2)
  ),

  selected: computed([
    s => s.currentTimetable.selectedGroups,
    s => s.activities,
  ], memo((selected: SelectedActivities, activities: ActivitiesNested) => {

    const out: SelectedNested = {};

    for (const c of Object.keys(activities)) {
      out[c] = {};
      for (const a of Object.keys(activities[c])) {
        // get selected groups for this course+activity, then filter groups to
        // those which actually have activities.
        out[c][a] = coerceToArray(selected?.[c]?.[a])
          .filter(g => activities?.[c]?.[a]?.[g]?.length);
      }
    }

    return out;
  }, 1)),

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


  updateCourseSessions: action((s, sessions) => {
    const newCourses = new Set(sessions.map(x => x.course));
    //console.log('newActivities', newActivities);
    const oldSessions = s.timetables[s.current]!.allSessions;
    s.timetables[s.current]!.allSessions = [
      ...sessions,
      ...oldSessions.filter(x => !newCourses.has(x.course))
    ];

    for (const x of sessions) {
      if (s.timetables[s.current]!.selectedGroups?.[x.course]?.[x.activity] == null) {
        _.set(s.timetables[s.current]!.selectedGroups, [x.course, x.activity], [x.group]);
      }
    }
  }),

  updateActivitySessions: action((s, sessions) => {
    const newActivities = new Set(sessions.map(makeActivityKey));
    //console.log('newActivities', newActivities);
    const oldSessions = s.timetables[s.current]!.allSessions;
    s.timetables[s.current]!.allSessions = [
      ...sessions,
      ...oldSessions.filter(x => !newActivities.has(makeActivityKey(x)))
    ];

    for (const x of sessions) {
      if (s.timetables[s.current]!.selectedGroups?.[x.course]?.[x.activity] == null) {
        _.set(s.timetables[s.current]!.selectedGroups, [x.course, x.activity], [x.group]);
      }
    }
  }),

  deleteActivitySession: action((s, c) => {
    const key = makeActivitySessionKey(c);
    s.timetables[s.current]!.allSessions = s.currentTimetable.allSessions
      .filter(x => makeActivitySessionKey(x) !== key);
  }),

  addCustomEvent: action((s, { day, hour, label, duration }) => {
    const sessions = Object.keys(s.activities[CUSTOM_COURSE]?.[label] ?? []);
    if (sessions.length === 0)
      sessions.push('0');
    const max = Math.max(...sessions.map(x => parseInt(x)));

    const newGroup = `${max+1}`;
    s.timetables[s.current]!.allSessions.push(
      makeCustomSession(label, day, hour, duration, newGroup));

    if (s.timetables[s.current]!.selectedGroups?.[CUSTOM_COURSE]?.[label] == null) {
      _.set(s.timetables[s.current]!.selectedGroups, [CUSTOM_COURSE, label], []);
    }

    if (!s.timetables[s.current]!.selectedGroups[CUSTOM_COURSE]![label]!.includes(newGroup)) {
      // @ts-ignore
      s.timetables[s.current]!.selectedGroups[CUSTOM_COURSE]![label]!.push(newGroup);
    }
  }),

  deleteCourse: action((s, course) => {
    s.timetables[s.current]!.allSessions = s.timetables[s.current]!.allSessions.filter(
      x => x.course !== course
    );
    // s.timetables[s.current]!.selectedGroups[course] = {};
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
  }),

  isSessionVisible: computed([
    s => s.currentTimetable.selectedGroups,
    s => s.currentTimetable.courseVisibility,
  ], memo((selected: SelectedActivities, visibilities?: CourseVisibility) => (c: CourseEvent) => {

      return coerceToArray(selected?.[c.course]?.[c.activity] ?? null).includes(c.group) 
        && (visibilities?.[c.course] ?? true);
        
    }, 1)
  ),
};

const typedHooks = createTypedHooks<PersistModel>();

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
  updateSessions: a.updateCourseSessions,
  deleteCourse: a.deleteCourse,
  setCourseVisibility: a.setCourseVisibility,
  setSelectedGroups: a.setSelectedGroups,
  replaceOneSelectedGroup: a.replaceOneSelectedGroup,
});

export const cleanState = (s: PersistModel) => {
  delete s.isSessionVisible;
  delete s.currentTimetable;
  delete s.activities;
  return s;
}