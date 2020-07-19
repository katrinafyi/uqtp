import React, { memo, useState } from 'react';
import { CourseGroup, CourseActivity, CourseEvent } from './state/types';
import _ from 'lodash';
import { coerceToArray } from './logic/functions';
import { Timetable } from './state/types';
import { FaSyncAlt, FaTimes, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { searchCourses } from './logic/api';
import { setAllSessions } from './state/ducks/timetables';


interface CourseSessionSelectorProps {
    activities: CourseGroup[],
    selected: {[activity: string]: string | string[]},
    visibility: Timetable['courseVisibility'],
    setVisible: (course: string, visible: boolean) => any, 
    setSelected: (activity: string, group: string[]) => any,
    deleteCourse: () => any,
    setAllSessions: (sessions: CourseEvent[]) => any,
}

export interface Props {
    allActivities: CourseGroup[],
    selected: {[course: string]: {[activity: string]: string | string[]}},
    setSelected: (course: string, activity: string, group: string[]) => any,
    visibility: Timetable['courseVisibility'],
    setVisible: (course: string, visible: boolean) => any, 
    deleteCourse: (course: string) => any,
    setAllSessions: (sessions: CourseEvent[]) => any,
};

enum UpdatingState {
    IDLE, UPDATING, DONE, ERROR
}

const CourseSessionSelector = ({activities, selected, setSelected, deleteCourse, visibility, setVisible}: CourseSessionSelectorProps) => {

    const [updating, setUpdating] = useState<UpdatingState>(UpdatingState.IDLE);
    const [updateError, setUpdateError] = useState('');

    const update = async () => {
        const code = activities[0].course;
        try {
            setUpdating(UpdatingState.UPDATING);
            setUpdateError('');
            const results = Object.values(await searchCourses(code));
            if (results.length !== 1) {
                throw new Error(`Found ${results.length} courses matching ${code}.`);
            }
            setAllSessions(results[0].activities);   
            setUpdating(UpdatingState.DONE);         
        } catch (e) {
            setUpdateError(e.toString());
            setUpdating(UpdatingState.ERROR);
            console.error(e);
        }
    }

    // console.log(activities);
    const actTypes = _.groupBy(activities, x => x.activity);

    const makeOnChange = (activity: string) => (ev: React.ChangeEvent<HTMLInputElement>) => {
        const checked = ev.target.checked; 
        const group = ev.target.value;
        const newSelected = coerceToArray(selected[activity]).filter(x => x !== group);
        if (checked)
            newSelected.push(group);
        setSelected(activity, newSelected);
    };

    const makeActivitySelector = (activity: CourseActivity, actType: string, groups: string[]) => {
        const isSelected = (g: string) => coerceToArray(selected[activity.activity]).includes(g);
        const numSelected = groups.filter(isSelected).length;
        let countClass = 'has-text-success-dark	has-text-weight-medium ';
        if (numSelected === 0)
            countClass = 'has-text-danger-dark has-text-weight-medium ';
        else if (numSelected === 1 && groups.length === 1)
            countClass = 'has-text-grey ';

        const makeId = (s: string) => `${activity.course}|${activity.activity}|${s}`;
        return (
        <div className="column is-narrow py-0" key={actType} style={{maxWidth: '100%'}}>
            <details>
                <summary style={{cursor: 'pointer'}}>
                    <span className="has-text-weight-medium">{actType}</span>
                    &nbsp;
                    <span className={countClass}>({numSelected}/{groups.length})</span>
                </summary>
                <div style={{margin: '0 -0.25rem'}}>
                {groups.map(s => 
                <label style={{margin: '0 0.25rem'}} className="checkbox" key={makeId(s)} htmlFor={makeId(s)}>
                    <input type="checkbox" id={makeId(s)} value={s}
                        checked={isSelected(s)} onChange={makeOnChange(activity.activity)}/>
                    {" "}{s}
                </label>)}
                </div>
            </details>
        </div>);
    };
    /*
    <div className="select">
                <select className="" value={selected[actType] ?? nullString}
                    onChange={makeOnChange(actType)}>
                    <option value={nullString}>(none)</option>
                    {groups.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
    */

    const isVisible = visibility?.[activities[0].course] ?? true;

    return (
    <div className="message session-selector">
        <div className="message-header">
                {/* style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}> */}
            <label className="mr-4 has-text-weight-semibold is-clickable">
                <input type="checkbox" checked={isVisible}
                    onChange={() => setVisible(activities[0].course, !isVisible)}
                ></input> {activities[0].course}
            </label>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            {/* <button className="button is-small is-outlined is-danger" type="button" onClick={deleteCourse}
                    title={"Delete " + activities[0].course}>
                <span className="icon is-small">
                    <FaTimes></FaTimes>
                </span>
            </button> */}
            <p className="buttons">
                <button className={"button is-small is-dark" + (updateError ? ' is-danger' : '') + (updating === UpdatingState.UPDATING ? ' is-loading' : '')} type="button"
                    title={updateError || "Update this course"} onClick={update}>
                    <span className="icon is-small">
                        {!updateError
                            ? (updating === UpdatingState.IDLE ? <FaSyncAlt></FaSyncAlt> : <FaCheck></FaCheck>)
                            : <FaExclamationTriangle></FaExclamationTriangle>}
                    </span>
                </button>
                <button className="button is-small is-dark" type="button"
                    title="Delete this course" onClick={deleteCourse}>
                    <span className="icon is-small">
                        <FaTimes></FaTimes>
                    </span>
                </button>
            </p>
        </div>
        <div className="message-body">
        <div className="columns is-multiline is-mobile">
            {Object.entries(actTypes).map(([type, options]) => 
                makeActivitySelector(options[0], type, options.map(x => x.group)))}
        </div>
        </div>
    </div>);
}

const MemoCourseSessionSelector = memo(CourseSessionSelector);

const SessionSelectors = ({ allActivities, selected, setSelected, deleteCourse, visibility, setVisible, setAllSessions }: Props) => {
    const byCourse = _.groupBy(allActivities, (x) => x.course);
    
    const courses = _(allActivities).map(x => x.course).uniq().sort().value();

    return <div className="columns is-multiline">
        {courses.map(c => <div key={c} className="column is-narrow" style={{maxWidth: '25rem'}}>
            <MemoCourseSessionSelector activities={byCourse[c]} visibility={visibility} setVisible={setVisible}
                selected={selected[c] || {}} setSelected={(...args) => setSelected(c, ...args)}
                deleteCourse={() => deleteCourse(c)} setAllSessions={setAllSessions}></MemoCourseSessionSelector>
        </div>)}
    </div>;
}

export default memo(SessionSelectors);