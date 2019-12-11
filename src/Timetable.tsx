import React from 'react';
import _ from 'lodash';

const Timetable: React.FC = () => {
    const makeTimes = (desktop: boolean) => [
        <th className={"col-time has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>Time</th>,
        ..._.range(15).map(i =>
            <th className={"col-time has-text-right " + (!desktop?"is-hidden-tablet":"is-hidden-mobile")}>{i + 8}</th>)
    ];

    const makeDay = (d: number) => [
        <th className="has-text-centered">Monday {d}</th>,
        ..._.range(15).map((i) => <td className="has-text-centered">
                <span className="is-info is-medium is-fullwidth">Course 1</span><br></br>
                <span className="is-success is-medium">Course 1</span>
        </td>)
    ];

    return <div className="table timetable">
        {makeTimes(true)}
        {_.range(5).map(i => <>
            {_.zip(makeTimes(false), makeDay(i))}
            <div className="rtable-spacer"></div></>
        )}
    </div>;
};

export default Timetable;