import React from 'react';
import _ from 'lodash';
import { CourseSession, DAY_NAMES } from './logic/types';
import { computeDayTimeArrays, makeSessionKey, getCourseCode } from './logic/functions';

import {css} from 'emotion';

export type Props = {
    selectedSessions: CourseSession[],
}

const START_HOUR = 8;
const END_HOUR = 18;

const sessionStyle = css({
    backgroundColor: 'red',
    flexGrow: 1,
    flexBasis: 0,
    wordBreak: 'break-all',

    paddingTop: '0.5em',
    //lineHeight: 1,

    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'flex-start',
    marginLeft: '2px',
    marginRight: '2px' ,

    borderRadius: '0px',
    borderLeft: '1px solid #dbdbdb',
    borderRight: '1px solid #dbdbdb',
});

type TimetableSessionProps = {
    session: CourseSession
}

const TimetableSession = ({session}: TimetableSessionProps) => {
    return <div key={makeSessionKey(session)} className={"has-background-light  " + sessionStyle}>
        <b>{getCourseCode(session.course)}</b><br></br>
        {session.activity} {session.group}
    </div>;
}

const makeTimeElements = (desktop: boolean) => [
    <div key="ht" className={"th thead has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>Time</div>,
    ..._.range(START_HOUR, END_HOUR+1).map(h =>
        <div key={"t"+h} className={"th has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>{h}</div>)
];

const hourStyle = css({
    paddingTop: 0,
    paddingBottom: 0,

    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginLeft: '-2px',
    marginRight: '-2px',

    height: '3.9rem',
});

type DayColumnProps = {
    day: number,
    daySessions: CourseSession[][]
}

const DayColumn = ({day, daySessions}: DayColumnProps) => {
    const timeColumn = makeTimeElements(false);
    return <>
        <div className="th thead has-text-centered">{DAY_NAMES[day]}</div>
        {_.range(START_HOUR, END_HOUR+1).map((h) =>
            <React.Fragment key={h}>
                {timeColumn[h]}
                <div className={"td has-text-centered " + hourStyle}>
                    {daySessions[h].map(s => <TimetableSession session={s}></TimetableSession>)}
                </div>
            </React.Fragment>)}</>;
};

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