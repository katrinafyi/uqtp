import React, { memo, useState, useContext } from 'react';
import { CourseGroup, CourseActivity } from './state/types';
import _ from 'lodash';
import { FaCross, FaTimes, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { HighlightContext } from './HightlightContext';
import { cursorTo } from 'readline';

interface CourseSessionSelectorProps {
    activities: CourseGroup[],
    selected: {[activity: string]: string},
    setSelected: (activity: string, group: string | null) => any,
    deleteCourse: () => any,
}

export interface Props {
    allActivities: CourseGroup[],
    selected: {[course: string]: {[activity: string]: string}},
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
        return <div key={actType} className="field is-horizontal">
            <div className="field-label is-normal">
                <label className="label" style={{width: '3em', cursor: unlocked ? 'pointer' : ''}}
                    onClick={() => unlocked && setHighlight(activity)}>{actType}</label>
            </div>
            <div className="field-body"><div className="field is-narrow">
                <div className="control"><div className="select">
                    <select className="" value={selected[actType] ?? nullString}
                        onChange={makeOnChange(actType)}>
                        <option value={nullString}>(none)</option>
                        {groups.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div></div>
            </div></div>
        </div>;
    };

    return <div className="card">
        <header className="card-header">
            <p className="card-header-title is-no-wrap" title={activities[0].course}>
                {activities[0].course}
            </p>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="card-header-icon" type="button" onClick={deleteCourse}>
                <span className="icon">
                    <FaTimes></FaTimes>
                </span>
            </a>
        </header>
        <div className="card-content">
            {Object.entries(actTypes).map(([type, options]) => 
                makeActivitySelector(options[0], type, options.map(x => x.group)))}
        </div>
        
    </div>;
}

const MemoCourseSessionSelector = memo(CourseSessionSelector);

const SessionSelectors = ({ allActivities, selected, setSelected, deleteCourse }: Props) => {
    const byCourse = _.groupBy(allActivities, (x) => x.course);
    
    const courses = _(allActivities).map(x => x.course).uniq().value();

    return <>
        <div className="columns is-multiline is-mobile">
            {courses.map(c => <div key={c} className="column is-6-mobile is-narrow">
                <MemoCourseSessionSelector activities={byCourse[c]} 
                    selected={selected[c] || {}} setSelected={(...args) => setSelected(c, ...args)}
                    deleteCourse={() => deleteCourse(c)}></MemoCourseSessionSelector>
            </div>)}
            <div className="column is-3 is-hidden-touch"></div>
        </div>
    </>;
}

export default memo(SessionSelectors);