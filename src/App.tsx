import React from 'react';
import './App.scss';

import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';

const App: React.FC = () => {
  return <>
    <div className="container">
      <StateErrorBoundary><Main></Main></StateErrorBoundary>
    </div>
    <footer className="footer">
        <div className="content has-text-centered">
          <strong>UQ Toilet Paper 🧻</strong> is a (unofficial) timetable planner for UQ, built by&nbsp;
          <a href="https://kentonlam.xyz">Kenton Lam</a>. 
          The source code is available on <a href="https://github.com/kentonlam/uqtp">GitHub</a>.
          Favicon by <a href="https://www.flaticon.com/authors/those-icons" title="Those Icons">Those Icons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>.
        </div>
    </footer></>;
  ;
}

export default App;
