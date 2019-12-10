import React from 'react';
import logo from './logo.svg';
import './App.scss';
import _ from 'lodash';


import DayColumn from './DayColumn';
import TimeColumn from './TimeColumn';

const App: React.FC = () => {
  const makeTimes = () => [
    <th className="col-time has-text-centered is-hidden-tablet">Time</th>,
    ..._.range(15).map(i => 
      <th className="col-time has-text-centered is-hidden-tablet">{i+8}</th>)
  ];
  
  const makeDay = (d: number) => [
    <th>Monday {d}</th>,
    ..._.range(15).map((i) => 
      <td >{"jio emieov mfweio mveiow mvefmqvio qemvioqwm oiCourse "+i}</td>)
  ];

  return (
    <div className="container">
      <div className="section">
        <h1 className="title">UQ Toilet Paper 🧻</h1>
        <p className="block">So you can plan your timetable in peace. Responsive!</p>
        <div className="table timetable is-bordered">
          <th className="has-text-centered is-hidden-mobile">Time</th>
          {Array.from(Array(15).keys())
            .map((i) => <th className="has-text-centered is-hidden-mobile">{i+8}</th>)}

          
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
        </div>
        <div className="block">Below is the Bulma columns implementation.</div>
        <div className="columns is-gapless">
          <div className="column is-hidden-mobile is-1" style={{width: '4rem'}}>
            <TimeColumn></TimeColumn>
          </div>
          {Array.from(Array(7).keys()).map(i => 
            <div className="column"><DayColumn></DayColumn></div>)}
        </div>
        <div className="table-container">
        <table className="table is-narrow table-container">
          <thead>
            <tr>
              <th>Time</th>
              <th>Monday</th>
              <th>Monday</th>
              <th>Monday</th>
              <th>Monday</th>
              <th>Monday</th>
              <th>Monday</th>
              <th>Monday</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(Array(15).keys()).map((i) => <tr><th>{i+8}</th><td></td>
            <td>CSSE2002 TUT1</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td></tr>)}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default App;
