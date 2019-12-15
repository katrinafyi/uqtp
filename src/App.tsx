import React, { useState, useReducer, useContext } from 'react';
import logo from './logo.svg';
import './App.scss';
import _ from 'lodash';


import DayColumn from './DayColumn';
import TimeColumn from './TimeColumn';
import Timetable from './Timetable';

import FileInput from './FileInput';
import { parseExcelFile, parseSheetRows } from './logic/importer';
import { TimetableState, DEFAULT_PERSIST, CourseEvent, CourseGroup, CourseActivity } from './logic/types';
import SessionSelectors from './SessionSelectors';
import { timetableStateReducer } from './logic/reducers';
import { HighlightContext } from './HightlightContext';
import { isHighlighted } from './logic/functions';

const App: React.FC = () => {
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();

  const [persistState, dispatch] = useReducer(timetableStateReducer, DEFAULT_PERSIST);
  console.log(persistState);
  const onClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    try {
      const rows = await parseExcelFile(file!); 
      const parsed = parseSheetRows(rows);
      if (!parsed) {
        setFileError("invalid timetable.");
        return;
      }

      //console.log(JSON.stringify(parsed));
      dispatch({type: 'setAllSessions', sessions: parsed});
    } catch (e) {
      setFileError("error while importing: " + e.toString());
      return;
    }

    setFileError(undefined);
  };

  console.log(persistState.allSessions);
  
  const activities = _(persistState.allSessions)
    .map(({course, activity, activityType, group}) => ({course, activity, activityType, group}) as CourseGroup)
    .uniqWith(_.isEqual).value();

  const setSelected = (course: string, activity: string, group: string | null) => {
    dispatch({type: 'setActivityGroup', course, activity, group});
  };

  const isSessionSelected = (x: CourseEvent) => 
    _.get(persistState.selectedGroups, [x.course, x.activity], null) === x.group;
    
  const [highlight, setHighlight] = useState<CourseActivity | null>(null);
  const setSelectedGroup = (group: string | null) => {
    if (highlight == null) throw new Error('setting highlight group but nothing is highlighted.');
    setSelected(highlight.course, highlight.activity, group);
  }

  const selectedSessions = persistState.allSessions
    .filter(x => isSessionSelected(x) || isHighlighted(x, highlight));

  return <div className="container">
      <div className="section">
        <h1 className="title">UQ Toilet Paper 🧻</h1>
        <p className="block">Plan your timetable in peace, away from UQ's bureaucracy. Works on mobile!</p>


        <div className="title is-4">Data</div>
        <form className="form block">
          <div className="field">
            <label className="label">Import Excel Timetable</label>
            <FileInput className="control" fileName={file && file.name} setFile={setFile}></FileInput>
            {fileError && <p className="help is-danger">Error: {fileError}</p>}
          </div>
          <div className="field">
            <div className="control">
              <button disabled={!file} className="button is-link" onClick={onClick}>Import</button>
            </div>
          </div>
        </form>

        <hr></hr>

        <h4 className="title is-4">Courses</h4>
        <SessionSelectors allActivities={activities} 
          selected={persistState.selectedGroups} 
          setSelected={setSelected}></SessionSelectors>

        <hr></hr>

        <h4 className="title is-4">Timetable</h4>
        <HighlightContext.Provider value={{highlight, setHighlight, setSelectedGroup}}>
          <Timetable selectedSessions={selectedSessions}></Timetable>
        </HighlightContext.Provider>
      </div>
    </div>;
  ;
}

export default App;
