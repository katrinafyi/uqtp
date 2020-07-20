import React, { useMemo, useCallback, memo } from "react";
import { endOfWeek } from "date-fns";
import classNames from "classnames";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { UIStore, WEEK_START_MONDAY } from "../state/uiState";

export const WeekSelector = memo(() => {

  const start = UIStore.useStoreState(s => s.weekStart);
  const shiftWeek = UIStore.useStoreActions(s => s.shiftWeek);

  const end = endOfWeek(start, WEEK_START_MONDAY);

  const allWeeks = UIStore.useStoreState(s => s.allWeeks);
  const setAllWeeks = UIStore.useStoreActions(s => s.setAllWeeks);


  const [prevWeek, nextWeek] = useMemo(() => {
    const callback = (n: number) => () => {
      setAllWeeks(false);
      shiftWeek(n);
    };
    return [callback(-1), callback(1)];
  }, [setAllWeeks, shiftWeek]);

  const selectAllWeeks = useCallback(() => setAllWeeks(true), [setAllWeeks]);
  const selectOneWeek = useCallback(() => setAllWeeks(false), [setAllWeeks]);

  const weekButtonClass = classNames("button", {'is-active': !allWeeks});

  return <div className="field is-grouped is-grouped-multiline">
    <div className="control">
      <button className={classNames("button", {'is-active': allWeeks})} onClick={selectAllWeeks}>
        All Weeks
      </button>
    </div>
    <div className="control">
      <div className="buttons has-addons">
        <button className={weekButtonClass} onClick={prevWeek}><FaChevronLeft></FaChevronLeft></button>
        <button className={weekButtonClass} onClick={selectOneWeek}>
          {start.toLocaleDateString()} &ndash; {end.toLocaleDateString()}
        </button>
        <button className={weekButtonClass} onClick={nextWeek}><FaChevronRight></FaChevronRight></button>
      </div>
    </div>
  </div>;
});