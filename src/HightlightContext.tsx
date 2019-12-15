import React from 'react';
import { CourseGroup, CourseActivity } from './logic/types';

export type HightlightContextType = {
    highlight: CourseActivity | null,
    setHighlight: (highlight: CourseActivity | null) => any,

    setSelectedGroup: (group: string | null) => any,
}

export const HighlightContext = React.createContext({} as HightlightContextType);