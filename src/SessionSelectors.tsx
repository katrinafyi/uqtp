import React, { useMemo, useCallback } from 'react';
import { CourseActivityGroup, CourseActivity, Course } from './state/types';
import _ from 'lodash';
import { coerceToArray } from './logic/functions';
import { useStoreActions, useStoreState } from './state/easy-peasy';

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
  const groups = useStoreState(s => s.activities?.[course]?.[activity]);

  const groupKeys = Object.keys(groups);

  const numSelected = selected.length;

  let countClass = 'has-text-success-dark	has-text-weight-medium ';
  if (numSelected === 0)
    countClass = 'has-text-danger-dark has-text-weight-medium ';
  else if (numSelected === 1 && groupKeys.length === 1)
    countClass = 'has-text-grey ';

  return (
    <div className="column is-narrow py-0" key={activity} style={{ maxWidth: '100%' }}>
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


const CourseSessionSelector = ({ course }: Course) => {

  const activities = useStoreState(s => s.activities[course]);
  const visible = useStoreState(s => s.currentTimetable.courseVisibility?.[course]) ?? true;

  const setCourseVisibility = useStoreActions(s => s.setCourseVisibility);
  const deleteCourse = useStoreActions(s => s.deleteCourse);
  
  const setVisibleCallback = useCallback(() => {
    setCourseVisibility({ course, visible: !visible });
  }, [setCourseVisibility, course, visible]);

  const deleteCourseCallback = useCallback(() => {
    deleteCourse(course);
  }, [deleteCourse, course]);

  // console.log(activities);
  const activityTypes = useMemo(() => Object.keys(activities), [activities]);

  return (
    <div className="message session-selector">

      <div className="message-header">
        <label className="mr-2 has-text-weight-normal is-clickable">
          <input type="checkbox" checked={visible}
            onChange={setVisibleCallback}
          ></input> {course}
        </label>
        <button className="delete" type="button" onClick={deleteCourseCallback}></button>
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
  const courses = useMemo(() => Object.keys(activitiesByCourse), [activitiesByCourse]);

  return <div className="columns is-multiline">
    {courses.map(c => <div key={c} className="column is-narrow" style={{ maxWidth: '25rem' }}>
      <CourseSessionSelector course={c}/>
    </div>)}
  </div>;
}

export default SessionSelectors;