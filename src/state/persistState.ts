import { action, computed, Computed, Action, createTypedHooks, Actions, memo, State, actionOn, ActionOn, Thunk, thunk } from 'easy-peasy';
import { PersistState, BLANK_PERSIST } from './schema';
import { Timetable, CourseEvent, CourseActivity, EMPTY_TIMETABLE, CourseActivityGroup, CourseVisibility, SelectionsByGroup, Course, RGBAColour, SessionsByGroup, CourseMap, CourseActivityGroupMap } from './types';
import { v4 as uuidv4 } from 'uuid';
import { makeActivityKey, makeCustomSession, CUSTOM_COURSE, makeActivitySessionKey, coerceToObject } from '../logic/functions';
import _ from 'lodash';
import { userFirestoreDocRef, auth } from './firebase';
import { firebaseAction, FirebaseModel, FirebaseThunk } from './firebaseEnhancer';


export type ActivitiesNested = CourseActivityGroupMap<CourseEvent[]>;
export type SelectedNested = SelectionsByGroup;


const ensureSelectionExists = (s: PersistState, x: CourseEvent, force?: true) => {
  if (s.timetables[s.current]!.selections?.[x.course]?.[x.activity] == null) {
    _.setWith(s.timetables[s.current].selections, [x.course, x.activity, x.group], true, Object);
  }
  if (force ?? false) {
    s.timetables[s.current].selections[x.course][x.activity][x.group] = true;
  }
}


export type PersistModel = PersistState & {
  onSetState: ActionOn<PersistModel & FirebaseModel>,

  setUser: Thunk<PersistModel, firebase.User | null>,

  currentTimetable: Computed<PersistModel, Timetable>,
  activities: Computed<PersistModel, ActivitiesNested>,
  sessions: Computed<PersistModel, SessionsByGroup>,
  selected: Computed<PersistModel, SelectedNested>,

  new: Thunk<PersistModel, string | undefined | void>,
  select: Thunk<PersistModel, string>,
  delete: Thunk<PersistModel, string>,
  rename: Thunk<PersistModel, string>,
  copy: Thunk<PersistModel>,

  updateCourseSessions: Thunk<PersistModel, CourseEvent[]>,
  updateActivitySessions: Thunk<PersistModel, CourseEvent[]>,

  deleteCourse: Thunk<PersistModel, string>,
  deleteActivitySession: Thunk<PersistModel, CourseEvent>,

  setSelectedGroups: Thunk<PersistModel, CourseActivity & { group: string[] }>,
  setOneSelectedGroup: Thunk<PersistModel, CourseActivityGroup & { selected: boolean }>,
  replaceOneSelectedGroup: Thunk<PersistModel, CourseActivity & { old: string, new: string }>,

  addCustomEvent: Thunk<PersistModel, { day: number, hour: number, duration: number, label: string }>,

  setCourseVisibility: Thunk<PersistModel, Course & { visible: boolean }>,
  isSessionVisible: Computed<PersistModel, (c: CourseEvent) => boolean>,

  setCourseColour: Thunk<PersistModel, Course & { colour?: RGBAColour }>,
};


export const model: PersistModel = {
  ...BLANK_PERSIST,

  onSetState: actionOn(
    a => a.__setFirebaseState,
    (s) => {
      const current = s.timetables[s.current]!;

      if (!current.sessions) {
        // @ts-ignore
        current.sessions = current.session ?? {};
      }
      // @ts-ignore
      delete current.session;

      if (!current.selections)
        current.selections = {};
    }
  ),

  setUser: firebaseAction((s, user) => {
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
    [s => s.sessions],
    memo((sessions: SessionsByGroup) => {
      // console.error("recomputing activities");

      const activities: ActivitiesNested = {};

      for (const c of Object.keys(sessions)) {
        activities[c] = {};
        for (const a of Object.keys(sessions[c])) {
          activities[c][a] = {};
          for (const g of Object.keys(sessions[c][a])) {
            if (!sessions[c][a][g]) continue;
            activities[c][a][g] = Object.values(sessions[c][a][g]);
          }
        }
      }

      return activities;
    }, 1)
  ),

  sessions: computed(
    [s => s.timetables[s.current]!.sessions],
    memo((sessions: SessionsByGroup) => {
      // console.error("recomputing activities");

      const out: SessionsByGroup = {};

      for (const c of Object.keys(coerceToObject(sessions))) {
        out[c] = {};
        for (const a of Object.keys(coerceToObject(sessions[c]))) {
          out[c][a] = {};
          for (const g of Object.keys(coerceToObject(sessions[c][a]))) {
            if (!sessions[c][a][g]) continue;
            out[c][a][g] = coerceToObject(sessions[c][a][g]);
          }
        }
      }

      return out;
    }, 1)
  ),

  selected: computed([
    s => s.currentTimetable.selections,
    s => s.sessions,
  ], memo((selections: SelectionsByGroup, sessions: SessionsByGroup) => {
    
    const selected: SelectionsByGroup = {};

    for (const c of Object.keys(coerceToObject(selections))) {
      selected[c] = {};
      for (const a of Object.keys(coerceToObject(selections[c]))) {
        selected[c][a] = {};
        for (const g of Object.keys(coerceToObject(selections[c][a]))) {
          if (selections[c][a][g] && sessions?.[c]?.[a]?.[g] != null)
            selected[c][a][g] = true;
        }
      }
    }

    return selected;
  }, 1)),

  new: firebaseAction((s, name) => {
    const id = uuidv4();
    s.timetables[id] = EMPTY_TIMETABLE;
    s.timetables[id].name = name ? name : "new timetable";
    s.current = id;
  }),

  select: firebaseAction((s, id) => {
    s.current = id;
  }),

  delete: firebaseAction((s, id) => {
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

  rename: firebaseAction((s, name) => {
    s.timetables[s.current]!.name = name;
  }),

  copy: firebaseAction(s => {
    const old = s.currentTimetable;
    const newID = uuidv4();
    s.timetables[newID] = { ...old };
    s.timetables[newID].name = old.name.trimRight() + ' (copy)';
    s.current = newID;
  }),


  updateCourseSessions: firebaseAction((s, sessions) => {
    const courses = new Set(sessions.map(x => x.course));
    console.assert(courses.size === 1);

    const x = sessions[0];
    _.setWith(s.timetables[s.current]!.sessions, [x.course], {}, Object);

    for (const x of sessions) {
      _.setWith(s.timetables[s.current].sessions[x.course],
        [x.activity, x.group, makeActivitySessionKey(x)], x, Object);

      ensureSelectionExists(s, x);
    }
  }),

  updateActivitySessions: firebaseAction((s, sessions) => {
    const newActivities = new Set(sessions.map(makeActivityKey));
    console.assert(newActivities.size === 1);


    const x = sessions[0];
    _.setWith(s.timetables[s.current]!.sessions, [x.course, x.activity], {}, Object);

    for (const x of sessions) {
      _.setWith(s.timetables[s.current].sessions[x.course][x.activity],
        [x.group, makeActivitySessionKey(x)], x, Object);

      ensureSelectionExists(s, x);
    }

  }),

  deleteActivitySession: firebaseAction((s, c) => {
    // i am sorry for the length
    if (s.timetables[s.current]?.sessions?.[c.course]?.[c.activity]?.[c.group]?.[makeActivitySessionKey(c)] != null) {
      delete s.timetables[s.current].sessions[c.course][c.activity][c.group][makeActivitySessionKey(c)];
    }
  }),

  addCustomEvent: firebaseAction((s, { day, hour, label, duration }) => {
    const customGroups = Object.keys(s.activities?.[CUSTOM_COURSE]?.[label] ?? []);
    if (customGroups.length === 0) {
      customGroups.push('0');
    }
    const max = Math.max(...customGroups.map(x => parseInt(x)));

    const newGroup = `${max + 1}`.padStart(2, '0');
    const newEvent = makeCustomSession(label, day, hour, duration, newGroup);
    const key = makeActivitySessionKey(newEvent);
    _.setWith(s.timetables[s.current]!.sessions, 
      [CUSTOM_COURSE, label, newGroup, key], newEvent, Object);

    ensureSelectionExists(s, newEvent, true);
  }),

  deleteCourse: firebaseAction((s, course) => {
    _.unset(s.timetables[s.current]!.sessions, [course]);
  }),

  setCourseVisibility: firebaseAction((s, { course, visible }) => {
    if (s.timetables[s.current]!.courseVisibility == null)
      s.timetables[s.current]!.courseVisibility = {};
    s.timetables[s.current]!.courseVisibility![course] = visible;
  }),

  setSelectedGroups: firebaseAction((s, { course, activity, group }) => {
    for (const g of group) {
      _.setWith(s.timetables[s.current]!.selections, [course, activity, g], true, Object);
    }
  }),

  setOneSelectedGroup: firebaseAction((s, { course, activity, group, selected }) => {
    _.setWith(s.timetables[s.current]!.selections, [course, activity, group], selected, Object);
  }),

  replaceOneSelectedGroup: firebaseAction((s, payload) => {
    const {course, activity, old, new: new_} = payload;
    if (old === new_) return;

    _.unset(s.timetables[s.current]!.selections, [course, activity, old]);
    _.setWith(s.timetables[s.current]!.selections, [course, activity, new_], true, Object);
  }),

  isSessionVisible: computed([
    s => s.currentTimetable.selections,
    s => s.currentTimetable.courseVisibility,
  ], memo((selected: SelectionsByGroup, visibilities?: CourseVisibility) => (c: CourseEvent) => {
    return (selected?.[c.course]?.[c.activity]?.[c.group] ?? false) 
      && (visibilities?.[c.course] ?? true);
  }, 1)
  ),

  setCourseColour: firebaseAction((s, { course, colour }) => {
    if (s.timetables[s.current]!.courseColours == null)
      s.timetables[s.current]!.courseColours = {};
    if (colour)
      s.timetables[s.current]!.courseColours![course] = colour;
    else
      delete s.timetables[s.current]!.courseColours![course];
  }),
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
  return {
    timetables: s.timetables, user: s.user, current: s.current, _meta: s._meta
  };
}