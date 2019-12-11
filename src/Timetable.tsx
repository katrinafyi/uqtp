import React from 'react';
import _ from 'lodash';

const Timetable: React.FC = () => {
    const makeTimes = () => [
        <th className=" col-time has-text-centered is-hidden-tablet">Time</th>,
        ..._.range(15).map(i =>
            <th className=" col-time has-text-centered is-hidden-tablet">{i + 8}</th>)
    ];

    const makeDay = (d: number) => [
        <th className="">Monday {d}</th>,
        ..._.range(15).map((i) =>
            <td className=""><button className="button">Course 1</button><button className="button">Course 2</button></td>)
    ];

    return <div className="table timetable">
        <th className="has-text-centered is-hidden-mobile">Time</th>
        {Array.from(Array(15).keys())
            .map((i) => <th className="has-text-centered is-hidden-mobile">{i + 8}</th>)}


        {_.zip(makeTimes(), makeDay(0))}
        <div className="rtable-spacer"></div>
        {(_.zip(makeTimes(), makeDay(1)))}
        <div className="rtable-spacer"></div>
        {(_.zip(makeTimes(), makeDay(2)))}
        <div className="rtable-spacer"></div>
        {(_.zip(makeTimes(), makeDay(3)))}
        <div className="rtable-spacer"></div>
        {(_.zip(makeTimes(), makeDay(4)))}
        <div className="rtable-spacer"></div>
        {(_.zip(makeTimes(), makeDay(5)))}
        <div className="rtable-spacer"></div>
        {(_.zip(makeTimes(), makeDay(6)))}
    </div>;
};

export default Timetable;