import React, { useRef, useEffect, ReactPropTypes, Props, HTMLProps } from 'react';
import { RGBAColour, DEFAULT_COURSE_COLOUR } from '../state/types';

const inputStyle = {
  width: '30px',
  padding: '1px',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export type ColourPickerProps = {
  colour: RGBAColour,
  setColour: (c: RGBAColour) => any
};

export const ColourPickerButton = ({ colour, setColour, ...rest }: ColourPickerProps) => {
  
  const value = typeof colour == 'string' ? colour : DEFAULT_COURSE_COLOUR;

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onChange = (e: any) => setColour(e.target.value);

    const el = ref.current!;
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [setColour]);

  useEffect(() => {
    ref.current!.value = value;
  }, [value]);

  const onClick = (ev: React.MouseEvent) => {
    if (ev.ctrlKey) {
      ev.stopPropagation();
      ev.preventDefault();
      setColour(DEFAULT_COURSE_COLOUR);
    }
  }

  return <>
    <input type="color" className="button is-small is-dark" ref={ref} style={inputStyle}
      defaultValue={value} title="Choose a colour for this course (ctrl + click to reset)"
      onClick={onClick}
      {...rest} />
    {/* <button type="button" className="button is-small is-dark" onClick={clickButton}>
    {/* {show && <div style={popover}>
      <div style={cover} onClick={close} />
      <TwitterPicker color={colour} colors={colours} triangle="hide"
        onChange={(c: any) => setColour(c.rgb)} 
        styles={{default: {card: {left: '-154px', top: '94px'}}}}></TwitterPicker>
    </div>} */}
  </>;
}