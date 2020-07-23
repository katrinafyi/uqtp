import React, { memo, useState } from "react";
import { useStoreState } from "../../state/persistState"
import { useEffect, useMemo } from "react";

import jss, { StyleSheet } from 'jss';
import preset from 'jss-preset-default';
import tinycolor from "tinycolor2";

import { createContainer } from 'unstated-next';
import { Helmet } from "react-helmet";
import { CourseColours } from "../../state/types";

jss.setup(preset());

const hoverAmount = 4;
const borderAmount = 20;

const makeStylesForColour = (c: string) => {

  const colour = tinycolor(c);
  const text = tinycolor.mostReadable(colour, ['#fff', '#363636']).toRgbString();

  if (colour.isDark())
    colour.brighten(hoverAmount);
  else
    colour.darken(hoverAmount);
  const hover = colour.toRgbString();

  colour.darken(borderAmount);
  const border = colour.toRgbString();

  return {
    '& .text, &.text': {
      color: text,
    },
    '& .border, &.border': {
      borderColor: border,
    },
    '& .background, &.background': {
      background: c,
    },
    '& .hover:hover, &.hover:hover': {
      background: hover,
    }
  };
};

const createStyleSheetForCourses = (colours?: CourseColours) => {
  const styles: any = {
    'default': makeStylesForColour('#fafafa'),
  };
  for (const course of Object.keys(colours ?? {})) {
    styles[course] = makeStylesForColour(colours![course]);
  }

  return jss.createStyleSheet(styles);
}

export const useCourseColours = () => {

  const colours = useStoreState(s => s.currentTimetable.courseColours);

  const [sheet, setSheet] = useState(() => createStyleSheetForCourses(colours));

  useEffect(() => {
    setSheet(createStyleSheetForCourses(colours));
  }, [colours]);

  return { sheet, classes: sheet.classes };
}

export const CourseColoursContainer = createContainer(useCourseColours);

export const CourseColoursStylesheet = memo(() => {
  const { sheet } = CourseColoursContainer.useContainer();
  return <Helmet>
    <style type="text/css">
      {sheet.toString()}
    </style>
  </Helmet>;
});
