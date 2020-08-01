import { action, computed, Computed, Action, createContextStore, memo } from 'easy-peasy';
import { CourseActivity, CourseActivityGroup, CourseEvent } from './types';
import { PersistModel } from './persistState';
import { addWeeks, startOfWeek, differenceInCalendarDays } from 'date-fns';

export const WEEK_START_MONDAY = { weekStartsOn: 1 } as const;

const parseDate = memo((d: string) => new Date(d), 3);

export enum TimetableMode {
  VIEW, EDIT, CUSTOM
}

export type UIState = {
  timetableMode: TimetableMode,

  highlight: CourseActivityGroup | null,

  weekStart: Date,
  allWeeks: boolean,
  
  replaceActivityGroup: (payload: PersistModel['replaceOneSelectedGroup']['payload']) => any
};

export type UIModel = UIState & {
  setTimetableMode: Action<UIModel, TimetableMode>,

  setHighlight: Action<UIModel, CourseActivityGroup | null>,
  isHighlighted: Computed<UIModel, (c: CourseActivity) => boolean>,
  selectHighlightedGroup: Computed<UIModel, (group: string) => any>

  setAllWeeks: Action<UIModel, boolean>,
  setWeek: Action<UIModel, Date | null>,
  shiftWeek: Action<UIModel, number>,
  isWeekVisible: Computed<UIModel, (session: CourseEvent) => boolean>,

  reset: Action<UIModel>,
};

const DEFAULT_WEEK_START = startOfWeek(new Date(), WEEK_START_MONDAY);

const initialState = {
  highlight: null,
  weekStart: DEFAULT_WEEK_START,
  allWeeks: true,
  timetableMode: TimetableMode.EDIT,
}

export type UIModelParams = {
  replaceActivityGroup: UIState['replaceActivityGroup']
}

export const model = ({ replaceActivityGroup }: UIModelParams): UIModel => ({
  ...initialState,
  replaceActivityGroup,

  setTimetableMode: action((s, mode) => {
    if (mode !== s.timetableMode)
      s.highlight = null;
    s.timetableMode = mode;
  }),

  setHighlight: action((s, group) => {
    s.highlight = group;
  }),

  isHighlighted: computed((s) => (session) => {
    return session.course === s.highlight?.course && session.activity === s.highlight.activity;
  }),

  setAllWeeks: action((s, b) => {
    s.allWeeks = b;
  }),

  setWeek: action((s, week) => {
    s.weekStart = week ?? DEFAULT_WEEK_START;
  }),

  shiftWeek: action((s, n) => {
    if (!s.weekStart) return;
    s.weekStart = addWeeks(s.weekStart, n);
  }),

  isWeekVisible: computed([
      s => s.weekStart, 
      s => s.allWeeks,
  ], memo((start: Date, all: boolean) => (session: CourseEvent) => {
      if (all || !session.startDate || !session.weekPattern) return true;

      const diff = differenceInCalendarDays(start, parseDate(session.startDate));
      const index = Math.floor(diff / 7);
      return (session.weekPattern[index] ?? '1') === '1';
  }, 1)),

  reset: action(s => {
    s.weekStart = DEFAULT_WEEK_START;
    s.allWeeks = true;
    s.highlight = null;
    s.timetableMode = TimetableMode.EDIT;
  }),

  selectHighlightedGroup: computed(s => group => {
    if (!s.highlight) return;

    s.replaceActivityGroup({ 
      course: s.highlight.course, 
      activity: s.highlight.activity, 
      old: s.highlight.group,
      new: group
    });
  }),
});

// @ts-ignore
export const UIStore = createContextStore(model);