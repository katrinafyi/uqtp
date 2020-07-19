import React, { useMemo, useCallback, useState } from 'react';
import { CourseActivityGroup, CourseActivity, Course } from '../state/types';
import { coerceToArray } from '../logic/functions';
import { useStoreActions, useStoreState } from '../state/easy-peasy';
import { searchCourses } from '../logic/api';
import { FaSyncAlt, FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import classNames from 'classnames';

import './SessionSelectors.scss';

const ActivityGroupCheckbox = ({ course, activity, group, selected }: CourseActivityGroup & { selected: boolean }) => {
  const setOneSelectedGroup = useStoreActions(s => s.setOneSelectedGroup);
  
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => 
    setOneSelectedGroup({ course, activity, group, selected: ev.target.checked})

  return <label style={{ margin: '0 0.25rem' }} className="checkbox" key={group} htmlFor={group}>
    <input type="checkbox" id={group} value={group}
      checked={selected} onChange={onChange}
    /> {group}
  </label>;
};

// component for selecting groups of a particular activity, e.g. LEC1 01 02 03...
const ActivityGroupSelector = ({ course, activity }: CourseActivity) => {
  const selected = coerceToArray(useStoreState(s => s.currentTimetable.selectedGroups?.[course]?.[activity]));
  const groups = useStoreState(s => s.activities?.[course]?.[activity] ?? {});

  const groupKeys = Object.keys(groups);

  const numSelected = selected.length;

  let countClass = 'has-text-success-dark	has-text-weight-medium ';
  if (numSelected === 0)
    countClass = 'has-text-danger-dark has-text-weight-medium ';
  else if (numSelected === 1 && groupKeys.length === 1)
    countClass = 'has-text-grey ';

  return (
    <div className="column is-narrow py-0" key={activity}>
      <details>

        <summary style={{ cursor: 'pointer' }}>
          <span className="has-text-weight-medium">{activity}</span>
          &nbsp;
          <span className={countClass}>({numSelected}/{groupKeys.length})</span>
        </summary>

        <div style={{ margin: '0 -0.25rem' }}>
          {groupKeys.map(group => <ActivityGroupCheckbox key={group} course={course} 
            activity={activity} group={group} selected={selected.includes(group)}/>)}
        </div>

      </details>
    </div>
  );
};

enum UpdatingState {
  IDLE, UPDATING, DONE, ERROR
}


const CourseSessionSelector = ({ course }: Course) => {

  const activities = useStoreState(s => s.activities[course]);
  const visible = useStoreState(s => s.currentTimetable.courseVisibility?.[course]) ?? true;

  const setCourseVisibility = useStoreActions(s => s.setCourseVisibility);
  const deleteCourse = useStoreActions(s => s.deleteCourse);
  const updateSessions = useStoreActions(s => s.updateSessions);
  
  const setVisibleCallback = useCallback(() => {
    setCourseVisibility({ course, visible: !visible });
  }, [setCourseVisibility, course, visible]);

  const deleteCourseCallback = useCallback(() => {
    deleteCourse(course);
  }, [deleteCourse, course]);

 //console.log(activities);
  const activityTypes = useMemo(() => Object.keys(activities), [activities]);


  const [updating, setUpdating] = useState<UpdatingState>(UpdatingState.IDLE);
  const [updateError, setUpdateError] = useState('');

  const update = async () => {
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
  }

  let icon = null;
  let iconClass = null;
  switch (updating) {
    case UpdatingState.IDLE:
      icon = <FaSyncAlt></FaSyncAlt>;
      break;
    case UpdatingState.UPDATING:
      iconClass = 'is-loading';
      break;
    case UpdatingState.DONE:
      icon = <FaCheck></FaCheck>;
      break;
    case UpdatingState.ERROR:
      icon = <FaExclamationTriangle></FaExclamationTriangle>;
      iconClass = 'is-danger';
  }

  return (
    <div className="message session-selector">
      <div className="message-header">
        <label className="mr-4 has-text-weight-normal is-clickable">
          <input type="checkbox" checked={visible}
            onChange={setVisibleCallback}
          ></input> {course}
        </label>
        <p className="buttons">
          <button className={classNames('button is-small is-dark', iconClass)} type="button"
            title={updateError || "Update this course"} onClick={update}>
            <span className="icon is-small">
              {icon}
            </span>
          </button>
          <button className="button is-small is-dark" type="button"
            title="Delete this course" onClick={deleteCourseCallback}>
            <span className="icon is-small">
              <FaTimes></FaTimes>
            </span>
          </button>
        </p>
      </div>

      <div className="message-body">
        <div className="columns is-multiline is-mobile">
          {activityTypes.map((activity) => 
            <ActivityGroupSelector key={activity} course={course} activity={activity}/>)}
        </div>
      </div>

    </div>);
}

const SessionSelectors = () => {

  const activitiesByCourse = useStoreState(s => s.activities);
  const courses = useMemo(() => Object.keys(activitiesByCourse).sort(), [activitiesByCourse]);

  return <div className="columns is-multiline">
    {courses.map(c => <div key={c} className="column is-narrow">
      <CourseSessionSelector course={c}/>
    </div>)}
  </div>;
}

export default SessionSelectors;