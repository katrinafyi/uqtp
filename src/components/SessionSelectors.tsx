import React, { useMemo, useCallback, useState, memo } from 'react';
import { CourseActivityGroup, CourseActivity, Course, RGBAColour, DEFAULT_COURSE_COLOUR } from '../state/types';
import { CUSTOM_COURSE } from '../logic/functions';
import { useStoreActions, useStoreState } from '../state/persistState';
import { searchCourses } from '../logic/api';
import { FaSyncAlt, FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import classNames from 'classnames';

import './SessionSelectors.scss';
import { ColourPickerButton } from './ColourPickerButton';
import { CourseColoursContainer } from './styles/CourseColours';

const ActivityGroupCheckbox = ({ course, activity, group, selected }: CourseActivityGroup & { selected: boolean }) => {
  const setOneSelectedGroup = useStoreActions(s => s.setOneSelectedGroup);

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setOneSelectedGroup({ course, activity, group, selected: ev.target.checked });

  const id = `${course}-${activity}-${group}`;

  return <label style={{ margin: '0 0.25rem' }} className="checkbox" key={group} htmlFor={id}>
    <input type="checkbox" id={id} value={group}
      checked={selected} onChange={onChange}
    /> {group}
  </label>;
};

// component for selecting groups of a particular activity, e.g. LEC1 01 02 03...
const ActivityGroupSelector = memo(({ course, activity }: CourseActivity) => {
  const selected = useStoreState(s => s.selected?.[course]?.[activity]) ?? {};
  const groups = useStoreState(s => s.currentTimetable.sessions?.[course]?.[activity]) ?? {};

  const numSelected = Object.keys(selected).length;
  const groupKeys = useMemo(() => Object.keys(groups), [groups]);

  let countClass = 'has-text-success-dark	has-text-weight-medium ';
  if (numSelected === 0)
    countClass = 'has-text-danger-dark has-text-weight-medium ';
  else if (numSelected === 1 && groupKeys.length === 1)
    countClass = 'has-text-grey ';

  const countText = `(${numSelected}/${groupKeys.length})`;

  return (
    <div className="column is-narrow py-0" key={activity}>
      <details>

        <summary style={{ cursor: 'pointer' }}>
          <span className="has-text-weight-medium">{activity}</span>
          &nbsp;
          <span className={countClass}>{countText}</span>
        </summary>

        <div style={{ margin: '0 -0.25rem' }}>
          {groupKeys.sort().map(group => <ActivityGroupCheckbox key={group} course={course}
            activity={activity} group={group} selected={selected[group] != null} />)}
        </div>

      </details>
    </div>
  );
});

enum UpdatingState {
  IDLE, UPDATING, DONE, ERROR
}

const CourseSessionSelector = memo(({ course }: Course) => {

  const activities = useStoreState(s => s.activities[course]) ?? {};
  const visible = useStoreState(s => s.currentTimetable.courseVisibility?.[course]) ?? true;

  const setCourseVisibility = useStoreActions(s => s.setCourseVisibility);
  const deleteCourse = useStoreActions(s => s.deleteCourse);
  const updateSessions = useStoreActions(s => s.updateCourseSessions);

  const colour = useStoreState(s => s.currentTimetable.courseColours?.[course]) ?? DEFAULT_COURSE_COLOUR;
  const setCourseColour = useStoreActions(s => s.setCourseColour);

  const setColour = useCallback((colour: RGBAColour) => setCourseColour({ course, colour }), [course, setCourseColour]);

  const setVisibleCallback = useCallback(() => {
    setCourseVisibility({ course, visible: !visible });
  }, [setCourseVisibility, course, visible]);

  const deleteCourseCallback = useCallback(() => {
    deleteCourse(course);
  }, [deleteCourse, course]);

  //console.log(activities);
  const activityTypes = useMemo(() => Object.keys(activities).sort(), [activities]);


  const [updating, setUpdating] = useState<UpdatingState>(UpdatingState.IDLE);
  const [updateError, setUpdateError] = useState('');

  const update = useCallback(async () => {
    try {
      setUpdating(UpdatingState.UPDATING);
      setUpdateError('');
      const results = Object.values(await searchCourses(course));
      if (results.length !== 1) {
        throw new Error(`Found ${results.length} courses matching ${course}.`);
      }
      updateSessions(results[0].activities);
      setUpdating(UpdatingState.DONE);
    } catch (e) {
      setUpdateError(e.toString());
      setUpdating(UpdatingState.ERROR);
      console.error(e);
    }
  }, [course, updateSessions]);

  const [icon, iconClass] = useMemo(() => {
    switch (updating) {
      case UpdatingState.IDLE:
        return [<FaSyncAlt></FaSyncAlt>, null];
      case UpdatingState.UPDATING:
        return [null, 'is-loading'];
      case UpdatingState.DONE:
        return [<FaCheck></FaCheck>, null];
      case UpdatingState.ERROR:
        return [<FaExclamationTriangle></FaExclamationTriangle>, 'is-danger'];
    }
  }, [updating]);

  return (
    <div className="message session-selector">
      <div className="message-header">
        <label className="mr-4 has-text-weight-normal is-clickable">
          <input type="checkbox" checked={visible}
            onChange={setVisibleCallback}
          ></input> {course}
        </label>
        <div className="buttons">
          {<button className={classNames('button is-small is-dark', iconClass)}
            type="button" disabled={course === CUSTOM_COURSE}
            title={updateError || "Update this course"} onClick={update}>
            <span className="icon is-small">
              {icon}
            </span>
          </button>}
          <ColourPickerButton colour={colour} setColour={setColour}></ColourPickerButton>
          <button className="button is-small is-dark" type="button"
            title="Delete this course" onClick={deleteCourseCallback}>
            <span className="icon is-small">
              <FaTimes></FaTimes>
            </span>
          </button>
        </div>
      </div>

      <div className="message-body">
        <div className="columns is-multiline is-mobile">
          {activityTypes.map((activity) =>
            <ActivityGroupSelector key={activity} course={course} activity={activity} />)}
        </div>
      </div>

    </div>);
});

const SessionSelectors = memo(() => {

  const activitiesByCourse = useStoreState(s => s.activities);
  const courses = useMemo(() => Object.keys(activitiesByCourse).sort(), [activitiesByCourse]);

  return <div className="columns is-multiline">
    {courses.map(c => <div key={c} className="column is-narrow" style={{ maxWidth: '100%' }}>
      <CourseSessionSelector course={c} />
    </div>)}
  </div>;
});

export default SessionSelectors;