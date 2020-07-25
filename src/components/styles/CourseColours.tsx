import React, { memo, useState } from "react";
import { useStoreState } from "../../state/persistState"
import { useEffect, useMemo } from "react";

import jss, { StyleSheet } from 'jss';
import preset from 'jss-preset-default';
import tinycolor from "tinycolor2";

import { createContainer } from 'unstated-next';
import { Helmet } from "react-helmet";
import { CourseColours } from "../../state/types";
import { toCSSColour } from "../../logic/functions";

jss.setup(preset());

const hoverAmount = 3;
const borderAmount = 9;

const makeStylesForColour = (c: string) => {

  const colour = tinycolor(c);
  const text = tinycolor.mostReadable(colour, ['#fff', '#363636']).toRgbString();

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
      background: toCSSColour(c),
    },
    '& .hover:hover, &.hover:hover': {
      background: hover,
    }
  };
};

const createCourseColoursState = (colours?: CourseColours) => {
  const styles: any = {
    'default': makeStylesForColour('#fafafa'),
  };
  const isDark: {[c: string]: boolean} = {};
  for (const course of Object.keys(colours ?? {})) {
    styles[course] = makeStylesForColour(colours![course]);
    isDark[course] = tinycolor(colours![course]).isDark();
  }

  const sheet = jss.createStyleSheet(styles);
  return { sheet: sheet, classes: sheet.classes, isDark };
}

export const useCourseColours = () => {

  const colours = useStoreState(s => s.currentTimetable.courseColours);

  const [data, setData] = useState(() => createCourseColoursState(colours));

  useEffect(() => {
    setData(createCourseColoursState(colours));
  }, [colours]);

  return data;
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
