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
    session: CourseEvent,
    clash?: boolean
}

const TimetableSession = (({session, clash}: TimetableSessionProps) => {
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

    return <a className={highlightClass + " session"} onClick={onClick}>
        <span className={!thisHighlighted ? "has-text-weight-bold" : ''}>
            {getCourseCode(session.course)}
        </span>
        <span>
            <span className={"has-text-weight-semibold " + activityClass}>{session.activity}</span>
            &thinsp;
            <span className={locked ? 'has-text-grey' : ''}>{locked ? <FaLock size="12px"></FaLock> : session.group}</span>
        </span>
    </a>;
});

const makeTimeElements = (desktop: boolean) => [
    <div key="ht" className={"th thead has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}></div>,
    ..._.range(START_HOUR, END_HOUR+1).map(h =>
        <div key={"t"+h} className={`th has-text-right is-size-5 time ${!desktop ? "is-hidden-tablet" : "is-hidden-mobile"}`}>{h}</div>)
];

type DayColumnProps = {
    day: number,
    daySessions: CourseEvent[][]
}

const DayColumn = (({day, daySessions}: DayColumnProps) => {
    const [timeHeader, ...timeColumn] = makeTimeElements(false);
    return <>
        {timeHeader}
        <div className="th thead has-text-centered is-size-5 ">{DAY_NAMES[day]}</div>
        {_.range(START_HOUR, END_HOUR+1).map((h, i) =>
            <React.Fragment key={h}>
                {timeColumn[i]}
                <div className={"td has-text-centered hour"}>
                    {daySessions[h].map(s => 
                        <TimetableSession key={makeSessionKey(s)} session={s} clash={daySessions[h].length > 1}></TimetableSession>
                    )}
                </div>
            </React.Fragment>)
        }
    </>;
});

const Timetable: React.FC<Props> = ({selectedSessions}) => {

    const byDayTime = computeDayTimeArrays(selectedSessions); 

    return <div className="table timetable">
        {makeTimeElements(true)}
        {_.range(5).map(i => <React.Fragment key={i}>
            <DayColumn day={i} daySessions={byDayTime[i]}></DayColumn>
            <div className="rtable-spacer"></div>
        </React.Fragment>)}
    </div>;
};

export default Timetable;