import React, { useState, useCallback, useMemo } from 'react';
// @ts-ignore
import TwitterPicker from 'react-color/lib/Twitter';
import { RGBAColour } from '../state/types';
import { FaSquare } from 'react-icons/fa';
import { toCSSColour } from '../logic/functions';

const popover = {
  position: 'absolute',
  zIndex: 20,
} as const;

const cover = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
} as const;

const colours = [
  '#ff6663', '#feb144', '#fdfd97', '#9ee09e', '#9ec1cf', '#cc99c9',  '#dbdbdb',
  '#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea',  '#fafafa',
  ...['#fbedff', '#d8e6ff', '#eef6fc', '#ebfffc', '#effaf3', '#fffbeb', '#feecf0',].reverse()
];

export type ColourPickerProps = {
  colour: RGBAColour,
  setColour: (c: RGBAColour) => any
}

export const ColourPickerButton = ({ colour, setColour }: ColourPickerProps) => {

  const [show, setShow] = useState(false);
  // const [tempColour, setTempColour] = useState<RGBAColour>(colour);

  const clickButton = useCallback(() => !show && setShow(true), [show]);
  const colourStyle = useMemo(() => ({ color: toCSSColour(colour) }), [colour]);

  const close = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    // setColour(tempColour);
    setShow(false);
  };

  return <>
    <button className="button is-small is-dark" onClick={clickButton}>
      <span className="icon is-small" style={colourStyle}><FaSquare></FaSquare></span>
    </button>
    {show && <div style={popover}>
      <div style={cover} onClick={close} />
      <TwitterPicker color={colour} colors={colours} triangle="hide"
        onChange={(c: any) => setColour(c.rgb)} 
        styles={{default: {card: {left: '-154px', top: '94px'}}}}></TwitterPicker>
    </div>}
  </>;
}