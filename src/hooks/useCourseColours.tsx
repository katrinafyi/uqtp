import { useStoreState } from "../state/persistState"
import { useEffect } from "react";

import jss, { StyleSheet } from 'jss';
import preset from 'jss-preset-default';
import tinycolor from "tinycolor2";

jss.setup(preset());

const hoverAmount = 4;
const borderAmount = 6;

const makeStylesForColour = (c: string) => {

  const colour = tinycolor(c);
  const text = tinycolor.mostReadable(colour, ['#fff', '#363636']).toRgbString();

  if (colour.isDark())
    colour.brighten(hoverAmount);
  else
    colour.darken(hoverAmount);
  const hover = colour.toRgbString();

  if (colour.isDark())
    colour.brighten(borderAmount);
  else
    colour.darken(borderAmount);
  const border = colour.toRgbString();

  return {
    '& .text, &.text': {
      color: text,
    },
    '& .border:hover, &.border:hover': {
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

let sheet: StyleSheet<string | number | symbol> | null = null;

export const useCourseColours = () => {
  const colours = useStoreState(s => s.currentTimetable.courseColours) ?? {};
  
  useEffect(() => {
    if (sheet) return;

    const styles: any = {};
    for (const course of Object.keys(colours)) {
      styles[course] = makeStylesForColour(colours[course]);
    }

    sheet = jss.createStyleSheet(styles).attach();

    return () => {
      sheet!.detach();
      sheet = null;
    }
  }, [colours]);

  return sheet?.classes ?? {};
}