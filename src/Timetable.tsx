import React from 'react';
import _ from 'lodash';
import { CourseSession } from './logic/types';

export type Props = {
    selectedSessions: CourseSession[],
}

const Timetable: React.FC<Props> = ({selectedSessions}) => {

    const byDay = _.groupBy(selectedSessions, x => x.day);
    const byDayTime = _.range(7).map(() => _.range(24).map(() => [] as CourseSession[]));
    console.log(byDayTime);
    selectedSessions.forEach(session => {
        // we know the event starts somewhere in this hour.
        byDayTime[session.day][session.time.hour].push(session);
        // start time of event, in minutes past midnight
        const startTime = session.time.hour * 60;
        // compute ending time of event
        const endHour = session.time.hour * 60 + session.time.minute + session.duration;
        for (let i = session.time.hour + 1; i * 60 < endHour; i++) {
            if (i >= 24) throw new Error('event has continued into next day. unsupported!');
            console.log(session);
            console.log('continued into hour ' + i);
            
            byDayTime[session.day][i].push(session);
        }
    });

    const makeTimes = (desktop: boolean) => [
        <th className={"col-time has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>Time</th>,
        ..._.range(15).map(i =>
            <th className={"col-time has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>{i + 8}</th>)
    ];

    const makeDay = (d: number) => [
        <th className="has-text-centered">Monday {d}</th>,
        ..._.range(15).map((h) => <td className="has-text-centered">
            {byDayTime[d][8+h].map(s => <div className="is-info is-medium is-fullwidth">{s.course}</div>)}
        </td>)
    ];

    return <div className="table timetable">
        {makeTimes(true)}
        {_.range(5).map(i => <>
            {_.zip(makeTimes(false), makeDay(i))}
            <div className="rtable-spacer"></div></>
        )}
    </div>;
};

export default Timetable;