import React, { memo, useMemo, useCallback } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES, DEFAULT_COURSE_COLOUR } from '../state/types';
import { computeDayTimeArrays, makeActivitySessionKey, getCourseCode, isHighlighted, formatTime, sessionEndTime, isInWeek, CUSTOM_COURSE, toCSSColour } from '../logic/functions';

import { FaLock } from 'react-icons/fa';

import './Timetable.scss';
import { UIStore } from '../state/uiState';
import { useStoreState, useStoreActions } from '../state/persistState';

import useLongPress from 'react-use/lib/useLongPress';

const START_HOUR = 8;
const END_HOUR = 19;

const HOURS = _.range(START_HOUR, END_HOUR + 1);
const DAYS = _.range(5);

type TimetableSessionProps = {
  session: CourseEvent,
  clash?: boolean,
  numInHour: number
}

const ACTIVITY_CLASSES: { [type: string]: string } = {
  'LEC': 'has-text-info',
  'TUT': 'has-text-success',
  'PRA': 'has-text-danger',
  'STU': 'has-text-primary',
  'WKS': 'has-text-danger-dark',
};

const TimetableSession = memo(({ session, clash, numInHour }: TimetableSessionProps) => {

  const colour = useStoreState(s => s.currentTimetable.courseColours?.[session.course]) ?? DEFAULT_COURSE_COLOUR;
  const deleteSession = useStoreActions(s => s.deleteActivitySession);

  const highlight = UIStore.useStoreState(s => s.highlight);
  const thisHighlighted = UIStore.useStoreState(s => s.isHighlighted(session));
  const selectHighlightedGroup = UIStore.useStoreState(s => s.selectHighlightedGroup);
  const setHighlight = UIStore.useStoreActions(s => s.setHighlight);

  const s = session;
  const isCustom = session.course === CUSTOM_COURSE
  const customHelp = isCustom ? '\n(control + click to delete)' : '';
  const text = `${s.course}
${s.activity} ${s.group}
${DAY_NAMES[session.day]} ${formatTime(s.time)} - ${formatTime(sessionEndTime(s))} (${s.duration} minutes)
${s.location}${customHelp}`;

  const onLongPress = useCallback(() => alert(text), [text]);
  const longPressProps = useLongPress(onLongPress, { isPreventDefault: false });

  const locked = (session.numGroups ?? 10) <= 1;
  let highlightClass = locked ? 'locked ' : '';
  highlightClass += clash ? 'clash ' : '';
  highlightClass += thisHighlighted ? 'highlighted ' : '';

  const activityClass = ACTIVITY_CLASSES[session.activityType!] ?? 'has-text-dark';

  const startMinute = session.time.minute;
  const minutes = Math.min(60 * (END_HOUR + 1 - session.time.hour), session.duration);

  const styles = useMemo(() => ({
    // left: `${100*index/numInHour}%`,
    width: `${100 / numInHour}%`,
    height: `${minutes * 100 / 60}%`,
    top: `${startMinute * 100 / 60}%`,
    backgroundColor: toCSSColour(colour),
  }), [minutes, numInHour, startMinute, colour]);


  const onClick = useCallback((ev: React.MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (isCustom && ev.ctrlKey) {
      deleteSession(session);
      return;
    }

    if (highlight && thisHighlighted) {
      selectHighlightedGroup(session.group);
      setHighlight(null);
    } else {
      setHighlight(session);
    }
  }, [deleteSession, highlight, isCustom, selectHighlightedGroup, session, setHighlight, thisHighlighted]);


  return (
    <div className={highlightClass + "session cell"} onClick={onClick}
      style={styles} title={text} {...longPressProps}>

      <span className="has-text-weight-medium">
        {getCourseCode(session.course)}
      </span>
      {" "}
      <span className="is-no-wrap">
        <span className={"has-text-weight-semibold " + activityClass}>{session.activity}</span>
              &thinsp;
              <span className={locked ? 'has-text-grey' : ''}>{locked ? <FaLock size="12px"></FaLock> : session.group}</span>
      </span>
      <br />
      <span className="is-no-wrap">{session.location.split(' - ')[0]}</span>

    </div>
  );
});

const makeHeaderCells = () => {
  return [
    <div key="ht" className={"th thead has-text-right col-time cell"}></div>,
    ...DAY_NAMES.slice(0, 5).map(d => <div key={d} className="th col-day cell"><b>{d}</b></div>)
  ];
}

const makeTimeElements = () => HOURS.map(
  h => <div key={"t" + h} className={`th cell has-text-right col-time`}><b>{h}</b></div>
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
              style={{ width: `${100 / daySessions[h].length}%` }}></div>
            : <TimetableSession key={makeActivitySessionKey(s)}
              session={s} clash={daySessions[h].length > 1}
              numInHour={daySessions[h].length} />
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
      .map(x => ({ ...x, numGroups: Object.keys(activities?.[x.course]?.[x.activity] ?? {}).length }));
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