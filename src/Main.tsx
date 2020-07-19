import _ from 'lodash';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.scss';
import FileInput from './components/FileInput';
import { HighlightContext } from './components/HightlightContext';
import { isHighlighted, coerceToArray, makeActivityKey } from './logic/functions';
import { parseExcelFile, parseSheetRows } from './logic/importer';
import { MyTimetableHelp } from './components/MyTimetableHelp';
import SessionSelectors from './components/SessionSelectors';
import { CourseEvent, CourseActivityGroup } from './state/types';
import Timetable from './components/Timetable';
import TimetableSelector from './components/TimetableSelector';
import CourseSearcher from './components/CourseSearcher';
import { useStoreState, useStoreActions } from './state/easy-peasy';


const Main = () => {
  const timetable = useStoreState(s => s.currentTimetable);

  const replaceActivityGroup = useStoreActions(s => s.replaceOneSelectedGroup);
  const updateSessions = useStoreActions(s => s.updateSessions);
  
  const [importError, setImportError] = useState<string | null>(null);
  
  const importFile = async (file: File | undefined) => {
    // ev.preventDefault();
    try {
      const rows = await parseExcelFile(file!); 
      const parsed = parseSheetRows(rows);

      if (!parsed) {
        setImportError("invalid timetable.");
        return;
      }

      //console.log(JSON.stringify(parsed));
      updateSessions(parsed);
    } catch (e) {
      setImportError("error while importing: " + e.toString());
      return;
    }
    setImportError(null);
  };

  const [highlight, setHighlight] = useState<CourseActivityGroup | null>(null);
  const [visibleSessions, setVisibleSessions] = useState<CourseEvent[]>([]);
  
  const activitiesByGroup = useMemo(
    () => _.groupBy(timetable.allSessions, makeActivityKey), 
    [timetable.allSessions]);

  useEffect(() => {
    const isSessionSelected = (x: CourseEvent) => 
      coerceToArray(_.get(timetable.selectedGroups, [x.course, x.activity], null)).includes(x.group);

    setVisibleSessions(timetable.allSessions
    .filter(x => (isSessionSelected(x) && (timetable.courseVisibility?.[x.course] ?? true))
      || isHighlighted(x, highlight))
    .map(x => ({...x, numGroups: activitiesByGroup[makeActivityKey(x)]?.length ?? 0})));

  }, [highlight, timetable.selectedGroups, timetable.allSessions, timetable.courseVisibility, activitiesByGroup]);

  const selectHighlightedGroup = useCallback((group: string | null) => {
    if (highlight == null) {
      throw new Error('setting highlight group but nothing is highlighted.');
    }

    const {course, activity, group: old} = highlight;
    if (group != null) {
      replaceActivityGroup({course, activity, old, new: group});
    }
  }, [highlight, replaceActivityGroup]);

  

 //console.log(visibleSessions);


  return <>
      <div className="container">
        {/* <div className="message is-warning is-small"><div className="message-body">
            Managing multiple timetables is currently <strong>not supported</strong>. The buttons below do nothing.
        </div></div> */}
        <TimetableSelector></TimetableSelector>
        <hr></hr>

        <h4 className="title is-4">Search Courses</h4>
        <CourseSearcher></CourseSearcher>

        <details>
          <summary className="is-clickable has-text-weight-medium">Manual import from Allocate+</summary>
          {/* <div className="title is-4">Data</div> */}
          <form className="form my-2">
            <div className="field">
              <FileInput className="control" fileName={""} setFile={importFile}></FileInput>
            </div>
          </form>
          {importError && <div className="has-text-weight-bold my-2 has-text-danger-dark">{importError}</div>}
          <p className="mb-2">
            If you can't find your courses by searching, you can manually import specific classes from the
            <a href="https://timetable.my.uq.edu.au/even/timetable/#subjects" target="_blank" rel="noopener noreferrer"> UQ Public Timetable</a>.
          </p>
          <MyTimetableHelp></MyTimetableHelp>
        </details>
        <hr/>

        
        {/* <div className="message is-info is-small"><div className="message-body">
            Changes to your selected classes are saved automatically. 
        </div></div> */}

        <HighlightContext.Provider value={{highlight, setHighlight, setSelectedGroup: selectHighlightedGroup}}>
          {/* <h4 className="title is-4">Selected Classes</h4> */}
          <SessionSelectors></SessionSelectors>

          <h4 className="title is-4">Timetable</h4>
          <Timetable selectedSessions={visibleSessions}></Timetable>
          <div className="content">
            <ul>
              <li>Changes to your timetable and classes are saved automatically.</li>
              <li>Be careful not to mix up semester 1 and semester 2!</li>
              <li>Some classes do not run every week. Always double check with your personal timetable.</li>
              <li>Sometimes, timetables for a course are updated or changed by UQ. To update a course in UQTP, just search and add the course again.</li>
            </ul>
          </div>
        </HighlightContext.Provider>
      </div>
    </>;
  ;
}

export default Main;