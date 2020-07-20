import React, { memo, useMemo } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES } from '../state/types';
import { computeDayTimeArrays, makeSessionKey, getCourseCode, isHighlighted, formatTime, sessionEndTime, isInWeek } from '../logic/functions';

import { FaLock } from 'react-icons/fa';

// @ts-ignore
import LongPress from 'react-long';

import './Timetable.scss';
import { UIStore } from '../state/uiState';
import { useStoreState, useStoreActions } from '../state/persistState';

const START_HOUR = 8;
const END_HOUR = 19;

const HOURS = _.range(START_HOUR, END_HOUR+1);
const DAYS = _.range(5);

type TimetableSessionProps = {
    session: CourseEvent,
    clash?: boolean,
    numInHour: number
}

const TimetableSession = memo(({session, clash, numInHour}: TimetableSessionProps) => {
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
    const onClick = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();

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
    
    const hours = Math.min(END_HOUR + 1 - session.time.hour, session.duration / 60);

    const positionStyle = {
        // left: `${100*index/numInHour}%`,
        width: `${100/numInHour}%`,
        height: `${hours * 100}%`, 
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

const makeTimeElements = () => HOURS.map(
    h => <div key={"t"+h} className={`th cell has-text-right col-time`}><b>{h}</b></div>
);

type CustomEvent = { day: number, hour: number, duration: number, label: string };
type AddCustomEvent = (arg: CustomEvent) => any;


const makeDayCells = (day: number, daySessions: (CourseEvent | null)[][], addCustomEvent: AddCustomEvent) => {
    const onClickEmpty = (hour: number) => () => {
        const input = prompt('Enter label and (optional) duration for custom activity (e.g. "Work 60"):')?.trim();
        if (!input) return;

        let durationInput = NaN;
        let label = input;
        const match = /(\d+)$/.exec(input);
        if (match) {
            durationInput = parseInt(match[1]);
            label = input.slice(0, -match[1].length).trimRight();
        }
        const duration = isNaN(durationInput) ? 60 : durationInput;
        
        addCustomEvent({ day, hour, label: label || 'activity', duration });
    };

    return HOURS.map((h) =>
    <div className={"td py-0 col-day"} key={`day:${day},hour:${h}`}>
        <div className="hour" onClick={onClickEmpty(h)} title="Click to add a custom event here">
        {daySessions[h].map((s, i) => 
            (s == null || s.time.hour !== h)
            ? <div className="session cell empty" key={"empty-" + i}
                style={{width: `${100/daySessions[h].length}%`}}></div>
            : <TimetableSession key={makeSessionKey(s)} 
                    session={s} clash={daySessions[h].length > 1}
                    numInHour={daySessions[h].length}/>
        )}
        </div>
    </div>);
};

const Timetable = () => {

    const timetable = useStoreState(s => s.currentTimetable);
    const activities = useStoreState(s => s.activities);
    const isSessionVisible = useStoreState(s => s.isSessionVisible);
    const addCustomEvent = useStoreActions(s => s.addCustomEvent);
    
    const highlight = UIStore.useStoreState(s => s.highlight);
    const weekStart = UIStore.useStoreState(s => s.weekStart);
    const allWeeks = UIStore.useStoreState(s => s.allWeeks);

    const visibleSessions = useMemo(() => {
        return timetable.allSessions
        .filter(x => (isSessionVisible(x) || isHighlighted(x, highlight))
            && (allWeeks || isInWeek(weekStart, x)))
        .map(x => ({...x, numGroups: Object.keys(activities?.[x.course]?.[x.activity] ?? {}).length}));
    }, [timetable.allSessions, isSessionVisible, highlight, allWeeks, weekStart, activities]);

    const byDayTime = useMemo(() => computeDayTimeArrays(visibleSessions), 
        [visibleSessions]); 

    const timeCells = useMemo(makeTimeElements, []);
    // dayCells[d][h]
    const dayCells = useMemo(
        () => DAYS.map(i => makeDayCells(i, byDayTime[i], addCustomEvent)), 
        [addCustomEvent, byDayTime]);

    return <div className="timetable">
        {makeHeaderCells()}
        {HOURS.map((h, i) => 
        <React.Fragment key={h}>
            {timeCells[i]}
            {dayCells.map(day => day[i])}
        </React.Fragment>)}
    </div>;
};

export default memo(Timetable);