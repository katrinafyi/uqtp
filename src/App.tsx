import React, { useState } from 'react';
import logo from './logo.svg';
import './App.scss';
import _ from 'lodash';


import DayColumn from './DayColumn';
import TimeColumn from './TimeColumn';
import Timetable from './Timetable';

import FileInput from './FileInput';
import { parseExcelFile, parseSheetRows } from './logic/importer';
import { TimetableState, defaultState } from './logic/types';
import { SessionPicker } from './SessionPicker';

const App: React.FC = () => {
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();

  const [persistState, setPersistState] = useState<TimetableState>(defaultState);

  const onClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    try {
      const rows = await parseExcelFile(file!);
      const parsed = parseSheetRows(rows);
      if (!parsed) {
        setFileError("invalid timetable.");
        return;
      }

      console.log(JSON.stringify(parsed));
      setFileError(undefined);
      setPersistState({ ...persistState, allSessions: parsed });
    } catch (e) {
      setFileError("error while importing: " + e.toString());
      return;
    }

    setFileError(undefined);
  };

  const courses = _.sortedUniqBy(persistState.allSessions, (x) => x.course);

  return (
    <div className="container">
      <div className="section">
        <h1 className="title">UQ Toilet Paper 🧻</h1>
        <p className="block">So you can plan your timetable in peace. Responsive!</p>


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
        
        <div className="columns is-multiline is-mobile">
          {courses.map(c => <div className="column is-2-desktop">
            <SessionPicker code={c.course}></SessionPicker>
          </div>)}
        </div>

        <hr></hr>

        <h4 className="title is-4">Timetable</h4>

        <Timetable></Timetable>

      </div>
    </div>
  );
}

export default App;
