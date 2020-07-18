import React, { memo, useContext } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES } from './state/types';
import { computeDayTimeArrays, makeSessionKey, getCourseCode, isHighlighted, formatTime, sessionEndTime } from './logic/functions';

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
    clash?: boolean,
    left: boolean,
    right: boolean,
    index: number,
    numInHour: number
}

const TimetableSession = (({hour, session, clash, left, right, index, numInHour}: TimetableSessionProps) => {
    const activityCSS: {[type: string]: string} = {
        'LEC': 'has-text-info',
        'TUT': 'has-text-success',
        'PRA': 'has-text-danger',
        'STU': 'has-text-primary',
        'WKS': 'has-text-danger-dark',
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
    const topPercent = session.time.minute * 100 / 60;
    
    const positionStyle = {
        // left: `${100*index/numInHour}%`,
        width: `${100/numInHour}%`,
        height: `${session.duration * 100 / 60}%`, 
        top: `${topPercent}%`, 
    };

    const s = session;
    const text = `${s.course}\n${s.activity} ${s.group}\n${formatTime(s.time)} - ${formatTime(sessionEndTime(s))} (${s.duration} minutes)\n${s.location}`;

    return (
    <div className={highlightClass + " session cell " + positionClass} onClick={onClick}
            style={positionStyle} title={text}>
        <span className="has-text-weight-medium">
            {getCourseCode(session.course)}
        </span>
        {" "}
        <span className="is-no-wrap">
            <span className={"has-text-weight-semibold " + activityClass}>{session.activity}</span>
            &thinsp;
            <span className={locked ? 'has-text-grey' : ''}>{locked ? <FaLock size="12px"></FaLock> : session.group}</span>
        </span>
        <br/>
        <span className="is-no-wrap">{session.location.split(' - ')[0]}</span>
    </div>);
});

const makeHeaderCells = () => {
    return [
        <div key="ht" className={"th thead has-text-right col-time cell"}></div>,
        ...DAY_NAMES.slice(0, 5).map(d => <div key={d} className="th col-day cell"><b>{d}</b></div>)
    ];
}

const makeTimeElements = () => _.range(START_HOUR, END_HOUR+1).map(
    h => <div key={"t"+h} className={`th cell has-text-right col-time`}><b>{h}</b></div>
);

const makeDayCells = (day: number, daySessions: (CourseEvent | null)[][]) => {
    return _.range(START_HOUR, END_HOUR+1).map((h, i) =>
    <div className={"td py-0 col-day"} key={`day:${day},hour:${h}`}>
        <div className="hour">
        {daySessions[h].map((s, i) => 
            (s == null || s.time.hour !== h)
            ? <div className="session cell empty" key={"empty-" + i}
                style={{width: `${100/daySessions[h].length}%`}}></div>
            : <TimetableSession key={makeSessionKey(s)} 
                    hour={h} session={s} clash={daySessions[h].length > 1}
                    left={daySessions[h][i-1] == null} 
                    right={daySessions[h][i+1] == null}
                    index={i}
                    numInHour={daySessions[h].length}/>
        )}
        </div>
    </div>);
};

const Timetable: React.FC<Props> = ({selectedSessions}) => {

    const byDayTime = computeDayTimeArrays(selectedSessions); 

    const timeCells = makeTimeElements();
    // dayCells[d][h]
    const dayCells = _.range(5).map(i => makeDayCells(i, byDayTime[i]));

    return <div className="timetable">
        {makeHeaderCells()}
        {_.range(START_HOUR, END_HOUR+1).map((h, i) => 
        <React.Fragment key={h}>
            {timeCells[i]}
            {dayCells.map(day => day[i])}
        </React.Fragment>)}
    </div>;
};

export default memo(Timetable);