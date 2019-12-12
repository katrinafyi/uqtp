import React from 'react';
import { CourseActivity } from './logic/types';
import _ from 'lodash';

interface CourseProps {
    activities: CourseActivity[]
}

export interface Props {
    allActivities: CourseActivity[]
};

const CourseSessionSelector = ({activities}: CourseProps) => {
    console.log(activities);
    const actTypes = _.groupBy(activities, x => x.activity);

    const makeActivitySelector = (actType: string, groups: string[]) => 
    <><div className="field is-horizontal">
        <div className="field-label is-normal">
            <label className="label" style={{width: '3em'}}>{actType}</label>
        </div>
        <div className="field-body"><div className="field is-narrow">
            <div className="control"><div className="select">
                <select className="" disabled={groups.length <= 1}>
                    {groups.map(s => <option>{s}</option>)}
                </select>
            </div></div>
        </div></div>
    </div></>;

    return <div className="box">
        <div className="title is-5 is-no-wrap">{activities[0].course.split('_')[0]}</div>
        {Object.entries(actTypes).map(([type, options]) => 
            makeActivitySelector(type, options.map(x => x.group)))}
    </div>;
}

export const SessionSelectors = ({ allActivities }: Props) => {
    const byCourse = _.groupBy(allActivities, (x) => x.course);
    
    const courses = _.uniq(allActivities.map(x => x.course));

    return <>
        <div className="columns is-multiline is-mobile">
            {courses.map(c => <div className="column is-6-mobile is-narrow">
                <CourseSessionSelector activities={byCourse[c]}></CourseSessionSelector>
            </div>)}
            <div className="column is-3 is-hidden-touch"></div>
        </div>
    </>;
}