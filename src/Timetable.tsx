import React from 'react';
import _ from 'lodash';

const Timetable: React.FC = () => {
    const makeTimes = () => [
        <th className=" col-time has-text-centered is-hidden-tablet">Time</th>,
        ..._.range(15).map(i =>
            <th className=" col-time has-text-centered is-hidden-tablet">{i + 8}</th>)
    ];

    const makeDay = (d: number) => [
        <th className="has-text-centered">Monday {d}</th>,
        ..._.range(15).map((i) => <td className="has-text-centered">
                <span className="is-info is-medium is-fullwidth">Course 1</span><br></br>
                <span className="is-success is-medium">Course 1</span>
        </td>)
    ];

    return <div className="table timetable">
        <th className="has-text-centered is-hidden-mobile">Time</th>
        {Array.from(Array(15).keys())
            .map((i) => <th className="has-text-centered is-hidden-mobile">{i + 8}</th>)}
        {_.range(5).map(i => <>
            {_.zip(makeTimes(), makeDay(i))}
            <div className="rtable-spacer"></div></>
        )}
    </div>;
};

export default Timetable;