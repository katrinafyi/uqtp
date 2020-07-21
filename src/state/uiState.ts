import { action, computed, Computed, Action, createContextStore } from 'easy-peasy';
import { CourseActivity, CourseActivityGroup } from './types';
import { PersistModel } from './persistState';
import { addWeeks, startOfWeek } from 'date-fns';

export const WEEK_START_MONDAY = { weekStartsOn: 1 } as const;

export type UIState = {
  highlight: CourseActivityGroup | null,
  weekStart: Date,
  allWeeks: boolean,
  
  replaceActivityGroup: (payload: PersistModel['replaceOneSelectedGroup']['payload']) => any
};

export type UIModel = UIState & {
  setHighlight: Action<UIModel, CourseActivityGroup | null>,
  isHighlighted: Computed<UIModel, (c: CourseActivity) => boolean>,

  setAllWeeks: Action<UIModel, boolean>,
  setWeek: Action<UIModel, Date | null>,
  shiftWeek: Action<UIModel, number>,
  reset: Action<UIModel>,

  selectHighlightedGroup: Computed<UIModel, (group: string) => any>
};

const DEFAULT_WEEK_START = startOfWeek(new Date(), WEEK_START_MONDAY);

const initialState = {
  highlight: null,
  weekStart: DEFAULT_WEEK_START,
  allWeeks: true,
}

export type UIModelParams = {
  replaceActivityGroup: UIState['replaceActivityGroup']
}

export const model = ({ replaceActivityGroup }: UIModelParams): UIModel => ({
  ...initialState,
  replaceActivityGroup,

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

  reset: action(s => {
    s.weekStart = DEFAULT_WEEK_START;
    s.allWeeks = true;
    s.highlight = null;
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