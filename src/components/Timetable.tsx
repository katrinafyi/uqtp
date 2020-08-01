import React, { memo, useMemo, useCallback } from 'react';
import _ from 'lodash';
import { CourseEvent, DAY_NAMES } from '../state/types';
import { computeDayTimeArrays, makeActivitySessionKey, getCourseCode, formatTime, sessionEndTime, CUSTOM_COURSE, coerceToObject } from '../logic/functions';

import { FaLock } from 'react-icons/fa';

import './Timetable.scss';
import { UIStore, TimetableMode } from '../state/uiState';
import { useStoreState, useStoreActions } from '../state/persistState';

import useLongPress from 'react-use/lib/useLongPress';
import { CourseColoursContainer } from './styles/CourseColours';
import classNames from 'classnames';


const START_HOUR = 8;
const END_HOUR = 19;

const HOURS = _.range(START_HOUR, END_HOUR + 1);
const DAYS = _.range(5);

const EMPTY_SESSION: CourseEvent = {
  course: '(empty)',
  activity: '',
  group: '',
  time: { hour: -1, minute: 0 },
  description: '',
  dates: '',
  day: 0,
  campus: '',
  location: '',
  duration: 60,
};


type TimetableSessionProps = {
  session: CourseEvent,
  clash?: boolean,
  numInHour: number
}

const TimetableSession = memo(({ session, clash, numInHour }: TimetableSessionProps) => {

  const deleteSession = useStoreActions(s => s.deleteActivitySession);
  const numGroups = useStoreState(s => Object.keys(s.sessions[session.course]?.[session.activity] ?? {}).length);

  const highlight = UIStore.useStoreState(s => s.highlight);
  const thisHighlighted = UIStore.useStoreState(s => s.isHighlighted(session));
  const selectHighlightedGroup = UIStore.useStoreState(s => s.selectHighlightedGroup);
  const setHighlight = UIStore.useStoreActions(s => s.setHighlight);
  const mode = UIStore.useStoreState(s => s.timetableMode);

  const colourClass = CourseColoursContainer.useContainer().classes[session.course] ?? '';

  const s = session;
  const isCustom = s.course === CUSTOM_COURSE;
  const isEmpty = session.course === EMPTY_SESSION.course;

  const courseClass = isEmpty ? 'empty' : colourClass;


  const text = `${s.activity} ${s.group}
${s.course}
${DAY_NAMES[session.day]} ${formatTime(s.time)} - ${formatTime(sessionEndTime(s))} (${s.duration} minutes)
${s.location}`;

  const locked = numGroups <= 1;
  let highlightClass = locked ? 'locked ' : '';
  highlightClass += clash ? 'clash ' : '';
  highlightClass += thisHighlighted ? 'highlighted ' : '';

  const startMinute = session.time.minute;
  const minutes = Math.min(60 * (END_HOUR + 1 - session.time.hour), session.duration);

  const styles = useMemo(() => {
    return {
      // left: `${100*index/numInHour}%`,
      width: `${100 / numInHour}%`,
      height: `${minutes * 100 / 60}%`,
      top: `${startMinute * 100 / 60}%`,
      // visibility: isEmpty ? 'hidden' : 'unset',
    } as const;
  }, [minutes, numInHour, startMinute]);


  const onClick = useCallback((ev: React.MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (isEmpty) return;

    switch (mode) {
      case TimetableMode.VIEW:
        alert(text);
        break;
      case TimetableMode.CUSTOM:
        if (isCustom) {
          if (window.confirm('Delete this custom activity?\n\n' + text)) {
            deleteSession(session);
          }
          break;
        }
      // eslint-disable-next-line no-fallthrough
      case TimetableMode.EDIT:
        if (highlight && thisHighlighted) {
          selectHighlightedGroup(session.group);
          setHighlight(null);
        } else {
          setHighlight(session);
        }
        break;
    }
  }, [deleteSession, highlight, isCustom, isEmpty, mode, selectHighlightedGroup, session, setHighlight, text, thisHighlighted]);

  return (
    <div className={highlightClass + "session cell border background hover " + courseClass} onClick={onClick}
      style={styles} title={text}>
      
      {!isEmpty && <>
        <span className="is-no-wrap mr-2 text" style={{ fontSize: '125%' }}>
          <span className={"has-text-weight-semibold"}>{session.activity}</span>
                &thinsp;
                <span>{locked ? <FaLock size="0.7em"></FaLock> : session.group}</span>
        </span>

        <br />
        <span className="is-no-wrap text">
          {getCourseCode(session.course)}
        </span>

        <br />
        <span className="is-no-wrap text">{session.location.split(' - ')[0]}</span>
      </>}
    </div>
  );
});

type HourCellProps = {
  day: number,
  hour: number,

  sessions: (CourseEvent | null)[],
}

const HourCell = memo(({ day, hour, sessions }: HourCellProps) => {

  const mode = UIStore.useStoreState(s => s.timetableMode);
  const addCustomEvent = useStoreActions(s => s.addCustomEvent);

  const onClickEmpty = useCallback(() => {
    if (mode !== TimetableMode.CUSTOM) return;
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
  }, [addCustomEvent, day, hour, mode]);

  const hourEmpty = sessions.length === 0;

  return <div className={"td py-0 col-day"}>
    <div className={"hour" + (hourEmpty ? ' empty' : '')} onClick={onClickEmpty}>
      {sessions.map((s, i) => {
        const empty = s == null || s.time.hour !== hour;
        const session = empty ? EMPTY_SESSION : s!;
        const key = empty ? `empty-${i}` : makeActivitySessionKey(session);
        return <TimetableSession key={key}
            session={session} clash={sessions.length > 1}
            numInHour={sessions.length} />
      })}
    </div>
  </div>;
});

type CustomEvent = { day: number, hour: number, duration: number, label: string };
type AddCustomEvent = (arg: CustomEvent) => any;

const Timetable = () => {

  const sessions = useStoreState(s => s.sessions);
  const isSessionVisible = useStoreState(s => s.isSessionVisible);

  const isHighlighted = UIStore.useStoreState(s => s.isHighlighted);
  const highlight = UIStore.useStoreState(s => s.highlight);
  const isWeekVisible = UIStore.useStoreState(s => s.isWeekVisible);
  const mode = UIStore.useStoreState(s => s.timetableMode);

  const visibleSessions = useMemo(() => {
    const visible = [];

    for (const c of Object.keys(sessions)) {
      for (const a of Object.keys(sessions[c])) {
        for (const g of Object.keys(sessions[c][a])) {

          const vals = Object.values(sessions[c][a][g]);
          if (vals.length === 0) continue;

          const first = vals[0];
          if (isSessionVisible(first) || isHighlighted(first)) {
            for (const session of vals) {
              if (isWeekVisible(session))
                visible.push(session);
            }
          }
        }
      }
    }
    return visible;
  }, [sessions, isSessionVisible, isHighlighted, isWeekVisible]);

  const byDayTime = useMemo(() => computeDayTimeArrays(visibleSessions),
    [visibleSessions]);


  const classes = classNames("timetable", {
    highlighting: highlight, 
    editing: mode === TimetableMode.CUSTOM,
  });
  return <div className={classes}>
    <div className={"th thead has-text-right col-time cell"}></div>
    {DAY_NAMES.slice(0, 5).map(d => 
      <div key={d} className="th col-day cell"><b>{d}</b></div>
    )}

    {HOURS.map((h, i) =>
      <React.Fragment key={h}>
        <div className={`th cell has-text-right col-time`}><b>{h}</b></div>
        {DAYS.map(d => 
          <HourCell key={d} day={d} hour={h} sessions={byDayTime[d][h]}></HourCell>
        )}
      </React.Fragment>)}
  </div>;
};

export default memo(Timetable);