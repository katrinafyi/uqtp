import React, { useState } from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';
import { SignInModal } from './SignInModal';
import { PersistState } from './state/schema';
import { connect } from 'react-redux';
import { FaSignInAlt, FaSignOutAlt, FaCoffee } from 'react-icons/fa';
import { auth } from './state/firebase';

const App = ({ name, email, photo }: ReturnType<typeof mapStateToProps>) => {
  const [signIn, setSignIn] = useState(false);

  const signOut = () => {
    auth.signOut();
  }

  return <>
    {signIn && <SignInModal visible={signIn} setVisible={setSignIn} success={() => setSignIn(false)}></SignInModal>}
    <div className="hero" style={{ backgroundColor: '#fafafa' }}>
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title "><span className="is-size-1"><Emoji symbol="🧻"></Emoji></span> UQ Toilet Paper <span className="tag is-link is-light">{process.env.REACT_APP_VERSION}</span> <span className="tag is-danger is-light">Unofficial</span></h1>
              <p className="block">Plan your timetable where Allocate+®™ can't hurt you. Works on mobile!</p>
            </div>
            <div className="column is-narrow">
              {name ?
                <div className="buttons">
                  <div className="button">
                    <span className="icon"><img src={photo!} alt={name} /></span> <span>{name}</span>
                  </div>
                  <div className="button is-danger is-outlined" title="Sign out" onClick={signOut}>
                    <span className="icon"><FaSignOutAlt></FaSignOutAlt></span>
                  </div>
                </div>
                :
                <button className="button is-link" type="button" onClick={() => setSignIn(true)}>
                  <span className="icon"><FaSignInAlt></FaSignInAlt></span><span> Log in / Sign up</span>
                </button>}

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
        <p>
          <strong>UQ Toilet Paper</strong> is a (unofficial) timetable planner for UQ, built by&nbsp;
          <a href="https://kentonlam.xyz">Kenton Lam</a>.
          The source code is available on <a href="https://github.com/kentonlam/uqtp">GitHub</a>.
        </p>
        <a href="https://paypal.me/kentonlam" className="button is-text">
          <span className="icon"><FaCoffee></FaCoffee></span> <span>Buy me a coffee!</span>
        </a>
      </div>
    </footer></>;
  ;
}

const mapStateToProps = (state: PersistState) => {
  return {
    email: state.user?.email,
    name: state.user?.name,
    photo: state.user?.photo,
  }
}

export default connect(mapStateToProps)(App);
