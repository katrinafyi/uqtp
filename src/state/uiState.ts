import { action, computed, Computed, Action, createContextStore } from 'easy-peasy';
import { CourseActivity, CourseActivityGroup } from './types';
import _ from 'lodash';
import { PersistModel } from './persistState';

export type UIState = {
  highlight: CourseActivityGroup | null,
  
  replaceActivityGroup: (payload: PersistModel['replaceOneSelectedGroup']['payload']) => any
};

export type UIModel = UIState & {
  setHighlight: Action<UIModel, CourseActivityGroup | null>,
  isHighlighted: Computed<UIModel, (c: CourseActivity) => boolean>,

  selectHighlightedGroup: Computed<UIModel, (group: string) => any>
};


const initialState = {
  highlight: null,
  setSelectedGroup: () => null,
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