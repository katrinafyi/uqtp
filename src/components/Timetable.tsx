import React, { memo, useMemo } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES } from '../state/types';
import { computeDayTimeArrays, makeSessionKey, getCourseCode, isHighlighted, formatTime, sessionEndTime } from '../logic/functions';

import { FaLock } from 'react-icons/fa';

// @ts-ignore
import LongPress from 'react-long';

import './Timetable.scss';
import { UIStore } from '../state/uiState';
import { useStoreState } from '../state/persistState';

const START_HOUR = 8;
const END_HOUR = 19;

type TimetableSessionProps = {
    hour: number,
    session: CourseEvent,
    clash?: boolean,
    left: boolean,
    right: boolean,
    index: number,
    numInHour: number
}

const TimetableSession = (({session, clash, numInHour}: TimetableSessionProps) => {
    const activityCSS: {[type: string]: string} = {
        'LEC': 'has-text-info',
        'TUT': 'has-text-success',
        'PRA': 'has-text-danger',
        'STU': 'has-text-primary',
        'WKS': 'has-text-danger-dark',
    };
    const defaultCSS = 'has-text-dark';
    const activityClass = (activityCSS[session.activityType!]) ?? defaultCSS;


    const highlight = UIStore.useStoreState(s => s.highlight);
    const selectHighlightedGroup = UIStore.useStoreState(s => s.selectHighlightedGroup);
    const setHighlight = UIStore.useStoreActions(s => s.setHighlight);

    const thisHighlighted = isHighlighted(session, highlight);
    const onClick = () => {
        if (highlight && thisHighlighted) {
            selectHighlightedGroup(session.group);
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
    const text = `${s.course}\n${s.activity} ${s.group}\n${DAY_NAMES[session.day]} ${formatTime(s.time)} - ${formatTime(sessionEndTime(s))} (${s.duration} minutes)\n${s.location}`;

    return <LongPress time={500} onLongPress={() => alert(text)}>
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
    </div>
    </LongPress>;
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
    return _.range(START_HOUR, END_HOUR+1).map((h) =>
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

const Timetable = () => {

    const timetable = useStoreState(s => s.currentTimetable);
    const activities = useStoreState(s => s.activities);
    const isSessionVisible = useStoreState(s => s.isSessionVisible);
    
    const highlight = UIStore.useStoreState(s => s.highlight);

    const visibleSessions = useMemo(() => {
        return timetable.allSessions
          .filter(x => isSessionVisible(x) || isHighlighted(x, highlight))
          .map(x => ({...x, numGroups: Object.keys(activities?.[x.course]?.[x.activity] ?? {}).length}));
      }, [timetable.allSessions, isSessionVisible, highlight, activities]);

    const byDayTime = useMemo(() => computeDayTimeArrays(visibleSessions), 
        [visibleSessions]); 

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