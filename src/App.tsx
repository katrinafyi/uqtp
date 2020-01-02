import React from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';

const App: React.FC = () => {
  return <>
    <div className="hero is-light">
      <div className="hero-body">
        <div className="container">
          <h1 className="title has-text-black"><span className="is-size-1"><Emoji symbol="🧻"></Emoji></span> UQ Toilet Paper <span className="tag is-link is-light">Beta</span> <span className="tag is-danger is-light">Unofficial</span></h1>
          <p className="block">Plan your timetable in peace, away from UQ's bureaucracy. Works on mobile!</p>
        </div>
      </div>
    </div>
    <section className="section">
      <StateErrorBoundary><Main></Main></StateErrorBoundary>
    </section>
    <footer className="footer">
      <div className="content has-text-centered">
        <strong>UQ Toilet Paper</strong> is a (unofficial) timetable planner for UQ, built by&nbsp;
          <a href="https://kentonlam.xyz">Kenton Lam</a>.
          The source code is available on <a href="https://github.com/kentonlam/uqtp">GitHub</a>.
        </div>
    </footer></>;
  ;
}

export default App;
