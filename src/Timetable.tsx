import React, { memo, useContext } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES } from './state/types';
import { computeDayTimeArrays, makeSessionKey, getCourseCode, isHighlighted } from './logic/functions';

import { HighlightContext } from './HightlightContext';
import { FaLock } from 'react-icons/fa';

export type Props = {
    selectedSessions: CourseEvent[],
}

const START_HOUR = 8;
const END_HOUR = 18;

type TimetableSessionProps = {
    hour: number,
    session: CourseEvent,
    clash?: boolean
}

const TimetableSession = (({hour, session, clash}: TimetableSessionProps) => {
    const activityCSS: {[type: string]: string} = {
        'LEC': 'has-text-info',
        'TUT': 'has-text-success',
        'PRA': 'has-text-danger',
        'STU': 'has-text-primary',
    };
    const defaultCSS = 'has-text-dark';
    const activityClass = (activityCSS[session.activityType!]) ?? defaultCSS;


    const {highlight, setHighlight, setSelectedGroup} = useContext(HighlightContext);
    const thisHighlighted = isHighlighted(session, highlight);
    const onClick = () => {
        if (highlight && thisHighlighted) {
            setSelectedGroup(session.group);
            setHighlight(null);
        } else {
            setHighlight({...session});
        }
    };

    const locked = (session.numGroups ?? 10) <= 1;
    let highlightClass = locked ? 'locked ' : '';
    highlightClass += (clash && !thisHighlighted) ? 'clash ' : '';
    highlightClass += thisHighlighted ? 'highlighted ' : '';

    let positionClass = '';
    if (session.time.hour === hour)
        positionClass += 'start ';
    if ((hour - session.time.hour + 1) * 60 >= session.duration)
        positionClass += 'end ';

    return <div className={highlightClass + " session " + positionClass} onClick={onClick}>
        <span className={!thisHighlighted ? "has-text-weight-bold" : ''}>
            {getCourseCode(session.course)}
        </span>
        <span>
            <span className={"has-text-weight-semibold " + activityClass}>{session.activity}</span>
            &thinsp;
            <span className={locked ? 'has-text-grey' : ''}>{locked ? <FaLock size="12px"></FaLock> : session.group}</span>
        </span>
    </div>;
});

const makeHeaderCells = () => {
    return [
        <th key="ht" className={"th thead has-text-right"}></th>,
        ...DAY_NAMES.slice(0, 5).map(d => <th key={d} className="th thead has-text-centered is-size-5 ">{d}</th>)
    ];
}

const makeTimeElements = () => _.range(START_HOUR, END_HOUR+1).map(
    h => <th key={"t"+h} className={`th has-text-right is-size-5 time`}>{h}</th>
);

const makeDayCells = (day: number, daySessions: CourseEvent[][]) => {
    return _.range(START_HOUR, END_HOUR+1).map((h, i) =>
    <td className={"td has-text-centered py-0"} key={`day:${day},hour:${h}`}>
        <div className="hour">
        {daySessions[h].map(s => 
            <TimetableSession key={makeSessionKey(s)} hour={h} session={s} clash={daySessions[h].length > 1}></TimetableSession>
        )}
        </div>
    </td>);
};

const Timetable: React.FC<Props> = ({selectedSessions}) => {

    const byDayTime = computeDayTimeArrays(selectedSessions); 

    const timeCells = makeTimeElements()
    // dayCells[d][h]
    const dayCells = _.range(5).map(i => makeDayCells(i, byDayTime[i]));

    return <div className="table-container">
        <table className="table timetable">
            <thead>
                <tr>{makeHeaderCells()}</tr>
            </thead>
            <tbody>
                {_.range(START_HOUR, END_HOUR+1).map((h, i) => 
                <tr key={h}>
                    {timeCells[i]}
                    {dayCells.map(day => day[i])}
                </tr>)}
            </tbody>
        </table>
    </div>;
};

export default Timetable;