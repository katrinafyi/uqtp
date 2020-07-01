import React, { memo, useContext } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES } from './state/types';
import { computeDayTimeArrays, makeSessionKey, getCourseCode, isHighlighted } from './logic/functions';

import {css} from 'emotion';
import { HighlightContext } from './HightlightContext';
import { FaLock } from 'react-icons/fa';

export type Props = {
    selectedSessions: CourseEvent[],
}

const START_HOUR = 8;
const END_HOUR = 18;

const typeTagStyle = css({
    flexWrap: 'nowrap',
});

const sessionStyle = css({
    padding: '0.5em 0',

    flexGrow: 1,
    flexBasis: 0,
    wordBreak: 'keep-all',

    // paddingTop: '0.5em',
    //lineHeight: 1,

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    flexWrap: 'wrap',


    // marginLeft: '2px',
    // marginRight: '2px' ,
    marginRight: '-1px',

    borderRadius: '0px',
    borderLeft: '1px solid #dbdbdb',
    borderRight: '1px solid #dbdbdb',
    
    backgroundColor: 'hsl(0, 0%, 98%)',
    '&.highlighted': {
        background: 'none', //'hsl(0, 0%, 99.9%)',
    },
    '&.clash': {
        background: 'hsl(48, 100%, 96%)',
    },
    color: 'black',
});

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

    return <a className={highlightClass + sessionStyle} onClick={onClick}>
        <span className={!thisHighlighted ? "has-text-weight-bold" : 'is-italic	'}>
            {getCourseCode(session.course)}
        </span>
        <span>
            <span className={"has-text-weight-semibold " + activityClass}>{session.activity}</span>
            &thinsp;
            <span className={locked ? 'has-text-grey' : ''}>{locked ? <FaLock size="12px"></FaLock> : session.group}</span>
        </span>
    </a>;
});

const timeStyle = css({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
})

const makeTimeElements = (desktop: boolean) => [
    <div key="ht" className={"th thead has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}></div>,
    ..._.range(START_HOUR, END_HOUR+1).map(h =>
        <div key={"t"+h} className={"th has-text-right is-size-5 " + timeStyle + ' ' + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>{h}</div>)
];

const hourStyle = css({
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 1,

    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    // marginLeft: '-2px',
    // marginRight: '-2px',

    // height: '3.9rem',
});

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
                <div className={"td has-text-centered " + hourStyle}>
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