import React, { memo, useState, useContext } from 'react';
import { CourseGroup, CourseActivity } from './state/types';
import _ from 'lodash';
import { FaCross, FaTimes, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { HighlightContext } from './HightlightContext';
import { cursorTo } from 'readline';

interface CourseSessionSelectorProps {
    activities: CourseGroup[],
    selected: {[activity: string]: string | string[]},
    setSelected: (activity: string, group: string | null) => any,
    deleteCourse: () => any,
}

export interface Props {
    allActivities: CourseGroup[],
    selected: {[course: string]: {[activity: string]: string | string[]}},
    setSelected: (course: string, activity: string, group: string | null) => any,
    deleteCourse: (course: string) => any,
};

const CourseSessionSelector = ({activities, selected, setSelected, deleteCourse}: CourseSessionSelectorProps) => {
    const [enabled, setEnabled] = useState(true);

    const {highlight, setHighlight, setSelectedGroup} = useContext(HighlightContext);

    // console.log(activities);
    const actTypes = _.groupBy(activities, x => x.activity);

    const nullString = 'null';

    const makeOnChange = (activity: string) => 
        (ev: React.ChangeEvent<HTMLSelectElement>) => {
        const val = ev.target.value; 
        setSelected(activity, val !== nullString ? val : null);
    }

    const makeActivitySelector = (activity: CourseActivity, actType: string, groups: string[]) => {
        const unlocked = true;
        const makeId = (s: string) => `${activity.course}|${activity.activity}|${s}`;
        return (
        <div className="column is-narrow pb-0">
            <div key={actType} className="field">
                <label className="label" style={{cursor: unlocked ? 'pointer' : ''}}
                    onClick={() => unlocked && setHighlight(activity)}>{actType}</label>
                <div className="control">
                    {groups.map(s => <label className="checkbox" key={makeId(s)} htmlFor={makeId(s)}>
                        <input type="checkbox" id={makeId(s)}/>
                        {" "}{s}
                    </label>)}
                </div>
            </div>
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

    return (
    <div className="message">
        <div className="message-header">
                {/* style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}> */}
            <span className="mr-2 has-text-weight-normal">{activities[0].course}</span>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            {/* <button className="button is-small is-outlined is-danger" type="button" onClick={deleteCourse}
                    title={"Delete " + activities[0].course}>
                <span className="icon is-small">
                    <FaTimes></FaTimes>
                </span>
            </button> */}
            <button className="delete"></button>
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

const SessionSelectors = ({ allActivities, selected, setSelected, deleteCourse }: Props) => {
    const byCourse = _.groupBy(allActivities, (x) => x.course);
    
    const courses = _(allActivities).map(x => x.course).uniq().sort().value();

    return <div style={{display: 'flex', flexWrap: 'wrap', margin: '-1rem', justifyContent: 'space-around'}}>
        {courses.map(c => <div key={c} style={{margin: '1rem', maxWidth: '25rem'}}>
            <MemoCourseSessionSelector activities={byCourse[c]} 
                selected={selected[c] || {}} setSelected={(...args) => setSelected(c, ...args)}
                deleteCourse={() => deleteCourse(c)}></MemoCourseSessionSelector>
        </div>)}
    </div>;
}

export default memo(SessionSelectors);