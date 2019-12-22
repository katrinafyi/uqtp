import React, { memo } from 'react';
import { CourseGroup } from './state/types';
import _ from 'lodash';

interface CourseSessionSelectorProps {
    activities: CourseGroup[],
    selected: {[activity: string]: string},
    setSelected: (activity: string, group: string | null) => any,
}

export interface Props {
    allActivities: CourseGroup[],
    selected: {[course: string]: {[activity: string]: string}},
    setSelected: (course: string, activity: string, group: string | null) => any,
};

const CourseSessionSelector = ({activities, selected, setSelected}: CourseSessionSelectorProps) => {
    // console.log(activities);
    const actTypes = _.groupBy(activities, x => x.activity);

    const nullString = 'null';

    const makeOnChange = (activity: string) => 
        (ev: React.ChangeEvent<HTMLSelectElement>) => {
        const val = ev.target.value; 
        setSelected(activity, val !== nullString ? val : null);
    }

    const makeActivitySelector = (actType: string, groups: string[]) => 
    <div key={actType} className="field is-horizontal">
        <div className="field-label is-normal">
            <a className="label" style={{width: '3em'}}>{actType}</a>
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

    return <div className="box">
        <div className="title is-5 is-no-wrap">{activities[0].course.split('_')[0]}</div>
        {Object.entries(actTypes).map(([type, options]) => 
            makeActivitySelector(type, options.map(x => x.group)))}
    </div>;
}

const MemoCourseSessionSelector = memo(CourseSessionSelector);

const SessionSelectors = ({ allActivities, selected, setSelected }: Props) => {
    const byCourse = _.groupBy(allActivities, (x) => x.course);
    
    const courses = _(allActivities).map(x => x.course).uniq().value();

    return <>
        <div className="columns is-multiline is-mobile">
            {courses.map(c => <div key={c} className="column is-6-mobile is-narrow">
                <MemoCourseSessionSelector activities={byCourse[c]} 
                    selected={selected[c] || {}} setSelected={(...args) => setSelected(c, ...args)}></MemoCourseSessionSelector>
            </div>)}
            <div className="column is-3 is-hidden-touch"></div>
        </div>
    </>;
}

export default memo(SessionSelectors);