import React from 'react';
import { FaRegEdit, FaRegEye, FaRegCalendarAlt } from 'react-icons/fa';
import { UIStore, TimetableMode } from '../state/uiState';

export const ModeSelector = () => {
  const mode = UIStore.useStoreState(s => s.timetableMode);
  const setMode = UIStore.useStoreActions(s => s.setTimetableMode);

  const makeSetMode = (m: TimetableMode) => () => setMode(m);
  const makeClass = (m: TimetableMode) => 'button' + (mode === m ? ' is-active' : '');

  return <div className="buttons has-addons">
    <button className={makeClass(TimetableMode.VIEW)} type='button' title="View your timetable, click on events to show detailed information."
      onClick={makeSetMode(TimetableMode.VIEW)}>
      <span className="icon">
        <FaRegEye></FaRegEye>
      </span>
      <span>View</span>
    </button>
    <button className={makeClass(TimetableMode.EDIT)} type='button' title="Edit your timetable, click to select activities."
      onClick={makeSetMode(TimetableMode.EDIT)}>
      <span className="icon">
        <FaRegCalendarAlt></FaRegCalendarAlt>
      </span>
      <span>Plan</span>
    </button>
    <button className={makeClass(TimetableMode.CUSTOM)} type='button' title="Manage custom activities, click to add or delete custom activities."
      onClick={makeSetMode(TimetableMode.CUSTOM)}>
      <span className="icon">
        <FaRegEdit></FaRegEdit>
      </span>
      <span>Custom</span>
    </button>
  </div>;
}