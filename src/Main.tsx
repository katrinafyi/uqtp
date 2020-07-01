import _ from 'lodash';
import React, { Dispatch, useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { connect } from 'react-redux';
import './App.scss';
import FileInput from './FileInput';
import { HighlightContext } from './HightlightContext';
import { isHighlighted } from './logic/functions';
import { parseExcelFile, parseSheetRows } from './logic/importer';
import { MyTimetableHelp } from './MyTimetableHelp';
import SessionSelectors from './SessionSelectors';
import { setActivityGroup, setAllSessions, deleteCourse } from './state/ducks/timetables';
import { PersistState } from './state/schema';
import { RootAction } from './state/store';
import { CourseActivity, CourseEvent, CourseGroup, EMPTY_TIMETABLE } from './state/types';
import Timetable from './Timetable';
import TimetableSelector from './TimetableSelector';
import CourseSearcher from './CourseSearcher';


type Props = ReturnType<typeof mapStateToProps>
  & ReturnType<typeof mapDispatchToProps>;

const Main: React.FC<Props> = ({timetable, activities, current, timetables, dispatch}) => {
  const [fileError, setFileError] = useState<string>();
  const [showHelp, setShowHelp] = useState(false);

  
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

  const setSelected = (course: string, activity: string, group: string | null) => {
    dispatch(setActivityGroup(course, activity, group));
  };

  const [highlight, setHighlight] = useState<CourseActivity | null>(null);
  const setSelectedGroup = (group: string | null) => {
    if (highlight == null) throw new Error('setting highlight group but nothing is highlighted.');
    setSelected(highlight.course, highlight.activity, group);
  }

  const isSessionSelected = (x: CourseEvent) => 
    _.get(timetable.selectedGroups, [x.course, x.activity], null) === x.group;

  // returns a string like CSSE2310|PRA1
  const getActivityKey = (s: CourseEvent) => s.course + '|' + s.activity;
  // @ts-ignore
  const activityGroups = _.groupBy(timetable.allSessions, getActivityKey);

  const visibleSessions = timetable.allSessions
    .filter(x => isSessionSelected(x) || isHighlighted(x, highlight))
    .map(x => ({...x, numGroups: activityGroups[getActivityKey(x)].length}));
    console.log(visibleSessions);

  const onClickCancel = () => setShowHelp(false);

  return <>
      <div className="container">
        {/* <div className="message is-warning is-small"><div className="message-body">
            Managing multiple timetables is currently <strong>not supported</strong>. The buttons below do nothing.
        </div></div> */}
        <TimetableSelector timetables={timetables} current={current}
          dispatch={dispatch}></TimetableSelector>
        <hr></hr>

        {/* <div className="title is-4">Data</div> */}
        <form className="form block">
          <label className="label">Import courses from My Timetable</label>
          <div className="field has-addons">
            <FileInput className="control" fileName={""} setFile={importFile}></FileInput>
            <div className="control">
              <button className="button" type="button" onClick={() => setShowHelp(true)}>
                <span className="icon"><FaQuestionCircle></FaQuestionCircle></span>
              </button>
            </div>
          </div>
          <div className="field">
            <p className="help">
              Export as Excel from <a href="https://timetable.my.uq.edu.au/even/timetable/#subjects" target="_blank" rel="noopener noreferrer">UQ Public Timetable</a>.
            </p>
          </div>
        </form>

        {/* <CourseSearcher></CourseSearcher> */}

        <div className={"modal " + (showHelp ? 'is-active' : '')}>
            <div className="modal-background" onClick={onClickCancel}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Help</p>
                    <button className="delete" aria-label="close" type="button" onClick={onClickCancel}></button>
                </header>
                <section className="modal-card-body">
                    <MyTimetableHelp></MyTimetableHelp>
                </section>
                <footer className="modal-card-foot">
                    <button className="button" type="button" onClick={onClickCancel}>Close</button>
                </footer>
            </div>
        </div>
        <hr/>


        <h4 className="title is-4">Courses and Timetable</h4>
        <div className="message is-info is-small"><div className="message-body">
            Changes to your selected classes are saved automatically. 
            {/* Your timetables are saved in <em>local browser storage</em> and 
            may be lost if you clear your cookies / site data. */}
        </div></div>

        <HighlightContext.Provider value={{highlight, setHighlight, setSelectedGroup}}>
          <SessionSelectors allActivities={activities} 
            selected={timetable.selectedGroups} setSelected={setSelected}
            deleteCourse={(c) => dispatch(deleteCourse(c))}></SessionSelectors>

          {/* <h4 className="title is-4">Timetable</h4> */}
          <Timetable selectedSessions={visibleSessions}></Timetable>
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