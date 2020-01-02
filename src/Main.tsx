import React, { useState, useEffect } from 'react';
import './App.scss';
import _ from 'lodash';
import {useLocalStorage} from 'react-use';


import Timetable from './Timetable';

import FileInput from './FileInput';
import { parseExcelFile, parseSheetRows } from './logic/importer';
import { CourseEvent, CourseGroup, CourseActivity, EMPTY_TIMETABLE } from './state/types';
import SessionSelectors from './SessionSelectors';
import { timetableStateReducer, TimetableStateAction, PersistStateAction, persistStateReducer } from './state/reducers';
import { HighlightContext } from './HightlightContext';
import { isHighlighted } from './logic/functions';
import produce from 'immer';
import TimetableSelector from './TimetableSelector';
import { PersistState, DEFAULT_PERSIST, CURRENT_VERSION } from './state/schema';
import { migratePeristState } from './state/migrations';

const Main: React.FC = () => {
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();

  const [persistState, setPersistState] = useLocalStorage<PersistState>('timetableState', DEFAULT_PERSIST);
  
  useEffect(() => {
    const migratedState = migratePeristState(persistState, CURRENT_VERSION);
    if (migratedState !== null)
      setPersistState(migratedState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const savedTimetable = persistState?.timetables?.[persistState?.current];
  const timetable = savedTimetable ?? EMPTY_TIMETABLE;
  const dispatchTimetable = (action: TimetableStateAction) => {
    setPersistState(produce(persistState, (draft) => {
      draft.timetables[draft.current] = timetableStateReducer(timetable, action);
    }));
  };

  const dispatchPersist = (action: PersistStateAction) => {
    setPersistState(persistStateReducer(persistState, action));
  };

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
      dispatchTimetable({type: 'setAllSessions', sessions: parsed});
    } catch (e) {
      setFileError("error while importing: " + e.toString());
      return;
    }

    setFileError(undefined);
  };

  const activities = _(timetable.allSessions)
    .map(({course, activity, activityType, group}) => ({course, activity, activityType, group}) as CourseGroup)
    .uniqWith(_.isEqual).value();

  const setSelected = (course: string, activity: string, group: string | null) => {
    dispatchTimetable({type: 'setActivityGroup', course, activity, group});
  };

  const isSessionSelected = (x: CourseEvent) => 
    _.get(timetable.selectedGroups, [x.course, x.activity], null) === x.group;
    
  const [highlight, setHighlight] = useState<CourseActivity | null>(null);
  const setSelectedGroup = (group: string | null) => {
    if (highlight == null) throw new Error('setting highlight group but nothing is highlighted.');
    setSelected(highlight.course, highlight.activity, group);
  }

  const selectedSessions = timetable.allSessions
    .filter(x => isSessionSelected(x) || isHighlighted(x, highlight));


  const timetableNames = Object.keys(persistState.timetables).sort();

  return <>
      <div className="container">
        {/* <div className="message is-warning is-small"><div className="message-body">
            Managing multiple timetables is currently <strong>not supported</strong>. The buttons below do nothing.
        </div></div> */}
        <TimetableSelector {...{timetableNames}} current={persistState.current}
          dispatch={dispatchPersist}></TimetableSelector>
        <hr></hr>

        <div className="title is-4">Data</div>
        <form className="form block">
          <div className="field">
            <label className="label">Import Excel Timetable</label>
            <FileInput className="control" fileName={file && file.name} setFile={setFile}></FileInput>
            <p className="help">
              Select your courses using the official <a href="https://timetable.my.uq.edu.au/even/student" target="_blank" rel="noopener noreferrer">My Timetable</a> then export as Excel and load it here.
            </p>
            {fileError && <p className="help is-danger">Error: {fileError}</p>}

          </div>
          <div className="field">
            <div className="control">
              <button disabled={!file} className="button is-link" onClick={onClick}>Import</button>
            </div>
          </div>
        </form>
        <hr/>


        <h4 className="title is-4">Courses and Timetable</h4>
        <div className="message is-info is-small"><div className="message-body">
            Changes to your selected classes are saved automatically.
        </div></div>
        <SessionSelectors allActivities={activities} 
          selected={timetable.selectedGroups} 
          setSelected={setSelected}></SessionSelectors>


        {/* <h4 className="title is-4">Timetable</h4> */}
        <HighlightContext.Provider value={{highlight, setHighlight, setSelectedGroup}}>
          <Timetable selectedSessions={selectedSessions}></Timetable>
        </HighlightContext.Provider>
      </div>
    </>;
  ;
}

export default Main;
