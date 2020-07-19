import React from 'react';
import { CourseActivityGroup } from '../state/types';

export type HightlightContextType = {
    highlight: CourseActivityGroup | null,
    setHighlight: (highlight: CourseActivityGroup | null) => any,

    setSelectedGroup: (group: string | null) => any,
}

export const HighlightContext = React.createContext({} as HightlightContextType);