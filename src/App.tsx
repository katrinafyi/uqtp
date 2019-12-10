import React from 'react';
import logo from './logo.svg';
import './App.scss';

import DayColumn from './DayColumn';
import TimeColumn from './TimeColumn';

const App: React.FC = () => {
  return (
    <div className="container">
      <div className="section">
        <h1 className="title">UQ Toilet Paper 🧻</h1>
        <p className="block">So you can plan your timetable in peace. Responsive!</p>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          <th style={{order: 0, width: '4em'}} className="has-text-centered">Time</th>
          {Array.from(Array(15).keys())
            .map((i) => <th style={{order: i+1, width: '4em'}} className="has-text-centered">{i+8}</th>)}
          
          <th style={{order: 0}}>Monday</th>
          {Array.from(Array(15).keys())
            .map((i) => <td style={{order: i+1}}>{"Course "+i}</td>)}

          <th style={{order: 0}}>Tuesday</th>
          {Array.from(Array(15).keys())
            .map((i) => <td style={{order: i+1}}>{"Course "+i}</td>)}

          {Array.from(Array(16).keys())
            .map((i) => <div style={{order: i, height: 0, flexBasis: '100%'}}></div>)}
        </div>
        <div className="columns is-gapless">
          <div className="column is-hidden-mobile is-1">
            <TimeColumn></TimeColumn>
          </div>
          {Array.from(Array(5).keys()).map(i => 
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
