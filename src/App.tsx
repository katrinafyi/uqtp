import React from 'react';
import './App.scss';

import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';

const App: React.FC = () => {
  return <div className="container">
      <StateErrorBoundary><Main></Main></StateErrorBoundary>
    </div>;
  ;
}

export default App;
