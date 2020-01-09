import React, { useState } from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';
import { SignInModal } from './SignInModal';
import firebase from 'firebase';

const App: React.FC = () => {
  const [signIn, setSignIn] = useState(false);

  const onSignIn = (authResult: any) => {
    const auth = firebase.auth();
    console.log(auth);

    firebase.firestore().collection('users').doc(auth.currentUser?.uid).set({
      asdf: 'a',
      d: {xd: {'a': 'b'}},
    }).then(() => console.log('write done')).catch(() => console.error('firebase error'));
  };

  return <>
    {signIn && <SignInModal visible={signIn} setVisible={setSignIn} success={onSignIn}></SignInModal>}
    <div className="hero" style={{backgroundColor: '#fafafa'}}>
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title "><span className="is-size-1"><Emoji symbol="🧻"></Emoji></span> UQ Toilet Paper <span className="tag is-link is-light">Beta</span> <span className="tag is-danger is-light">Unofficial</span></h1>
              <p className="block">Plan your timetable where Allocate+®™ can't hurt you. Works on mobile!</p>
            </div>
            <div className="column is-narrow">
              <button className="button is-link" type="button" onClick={() => setSignIn(true)}>Sign in</button>
            </div>
          </div>
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
