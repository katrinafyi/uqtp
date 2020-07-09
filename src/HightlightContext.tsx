import React from 'react';
import { CourseGroup } from './state/types';

export type HightlightContextType = {
    highlight: CourseGroup | null,
    setHighlight: (highlight: CourseGroup | null) => any,

    setSelectedGroup: (group: string | null) => any,
}

export const HighlightContext = React.createContext({} as HightlightContextType);