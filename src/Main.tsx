import _ from 'lodash';
import React, { Dispatch, useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import './App.scss';
import FileInput from './FileInput';
import { HighlightContext } from './HightlightContext';
import { isHighlighted, coerceToArray } from './logic/functions';
import { parseExcelFile, parseSheetRows } from './logic/importer';
import { MyTimetableHelp } from './MyTimetableHelp';
import SessionSelectors from './SessionSelectors';
import { setActivityGroup, setAllSessions, deleteCourse, replaceActivityGroup, setCourseVisibility } from './state/ducks/timetables';
import { PersistState } from './state/schema';
import { RootAction } from './state/store';
import { CourseEvent, CourseGroup, EMPTY_TIMETABLE } from './state/types';
import Timetable from './Timetable';
import TimetableSelector from './TimetableSelector';
import CourseSearcher from './CourseSearcher';


type Props = ReturnType<typeof mapStateToProps>
  & ReturnType<typeof mapDispatchToProps>;

const Main: React.FC<Props> = ({timetable, activities, current, timetables, dispatch}) => {
  const [, setFileError] = useState<string>();
  
  const importFile = async (file: File | undefined) => {
    // ev.preventDefault();
    try {
      const rows = await parseExcelFile(file!); 
      const parsed = parseSheetRows(rows);
      if (!parsed) {
        setFileError("invalid timetable.");
        return;
      }

      //console.log(JSON.stringify(parsed));
      dispatch(setAllSessions(parsed));
    } catch (e) {
      setFileError("error while importing: " + e.toString());
      return;
    }
    setFileError(undefined);
  };

  const setSelected = useCallback((course: string, activity: string, group: string[]) => {
    dispatch(setActivityGroup(course, activity, group));
  }, [dispatch]);

  const [highlight, setHighlight] = useState<CourseGroup | null>(null);
  const [visibleSessions, setVisibleSessions] = useState<CourseEvent[]>([]);
  const [activityGroups, setActivityGroups] = useState<{[s: string]: CourseEvent[]}>({});

  useEffect(() => {
    setActivityGroups(_.groupBy(timetable.allSessions, getActivityKey));
  }, [timetable.allSessions]);

  useEffect(() => {
    const isSessionSelected = (x: CourseEvent) => 
      coerceToArray(_.get(timetable.selectedGroups, [x.course, x.activity], null)).includes(x.group);

    setVisibleSessions(timetable.allSessions
    .filter(x => (isSessionSelected(x) && (timetable.courseVisibility?.[x.course] ?? true))
      || isHighlighted(x, highlight))
    .map(x => ({...x, numGroups: activityGroups[getActivityKey(x)]?.length ?? 0})));

  }, [highlight, activityGroups, timetable.selectedGroups, timetable.allSessions, timetable.courseVisibility]);

  const setSelectedGroup = useCallback((group: string | null) => {
    if (highlight == null) throw new Error('setting highlight group but nothing is highlighted.');
    if (group != null)
      dispatch(replaceActivityGroup(highlight.course, highlight.activity, highlight.group, group));
  }, [highlight, dispatch]);

  const setVisibility = useCallback((c: string, v: boolean) => {
    dispatch(setCourseVisibility(c, v));
  }, [dispatch])

  // returns a string like CSSE2310|PRA1
  const getActivityKey = (s: CourseEvent) => s.course + '|' + s.activity;

  // console.log(visibleSessions);


  return <>
      <div className="container">
        {/* <div className="message is-warning is-small"><div className="message-body">
            Managing multiple timetables is currently <strong>not supported</strong>. The buttons below do nothing.
        </div></div> */}
        <TimetableSelector timetables={timetables} current={current}
          dispatch={dispatch}></TimetableSelector>
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

        <HighlightContext.Provider value={{highlight, setHighlight, setSelectedGroup}}>
          {/* <h4 className="title is-4">Selected Classes</h4> */}
          <SessionSelectors allActivities={activities} visibility={timetable.courseVisibility}
            selected={timetable.selectedGroups} setSelected={setSelected}
            deleteCourse={(c) => dispatch(deleteCourse(c))}
            setVisible={setVisibility}></SessionSelectors>

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

const mapStateToProps = (state: PersistState) => {
  const timetable = state.timetables[state.current] ?? EMPTY_TIMETABLE;

  return {
    timetable,
    current: state.current,
    timetables: state.timetables,
    activities: _(timetable.allSessions)
      .map(({course, activity, activityType, group}) => ({course, activity, activityType, group}) as CourseGroup)
      .uniqWith(_.isEqual).value(),
  }
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Main);