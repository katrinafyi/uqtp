import React, { useState, useEffect, Dispatch } from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import { setPersistState } from './state/ducks/persist';
import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';
import { PersistState, DEFAULT_PERSIST } from './state/schema';
import { connect } from 'react-redux';
import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaUser } from 'react-icons/fa';
import { auth } from './state/firebase';
import { FirebaseAuth } from 'react-firebaseui';
import firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { useCopyToClipboard } from 'react-use';
import { RootAction } from './state/store';

type Props = ReturnType<typeof mapStateToProps>
  & typeof dispatchProps;

const App = ({ uid, name, email, photo, setPersistState }: Props) => {
  const [copied, setCopied] = useState(false);
  const [clipboardState, copyToClipboard] = useCopyToClipboard();

  const copyUID = () => {
    copyToClipboard(uid ?? '(no uid)');
    setCopied(true);
  }

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [copied]);


  const uiConfig: firebaseui.auth.Config = {
    signInFlow: 'popup',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    callbacks: {
        // Avoid redirects after sign-in.
        // eslint-disable-next-line no-sequences
        signInSuccessWithAuthResult: (authResult: any) => (false),
    }
};

  const signOut = () => {
    setPersistState(DEFAULT_PERSIST);
    auth.signOut();
  }

  const displayName = (name ?? '(anonymous)');

  return <>
    <div className="hero" style={{ backgroundColor: '#fafafa' }}>
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title "><span className="is-size-1"><Emoji symbol="🧻"></Emoji></span> UQ Toilet Paper <span className="tag is-link is-light">{process.env.REACT_APP_VERSION}</span> <span className="tag is-danger is-light">Unofficial</span></h1>
              <p className="block">Plan your timetable where Allocate+®™ can't hurt you. Works on mobile!</p>
            </div>
            <div className="column is-narrow">
              {uid ?
                <div className="buttons">
                  <div className="button" title="Click to copy user ID" onClick={copyUID}>
                    <span className="icon">
                      {photo ? <img src={photo!} alt={displayName} />
                      : <FaUser></FaUser>}
                    </span>
                    <span>{copied ? 'Copied!' : displayName}</span>
                  </div>
                  <div className="button is-danger is-outlined" title="Sign out" onClick={signOut}>
                    <span className="icon"><FaSignOutAlt></FaSignOutAlt></span>
                  </div>
                </div>
                :
                null
                // <button className="button is-link" type="button" onClick={() => setSignIn(true)}>
                //   <span className="icon"><FaSignInAlt></FaSignInAlt></span><span> Log in / Sign up</span>
                // </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
    <section className="section">
      <StateErrorBoundary>
        {uid ? <Main></Main>
        : <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}></FirebaseAuth>}
      </StateErrorBoundary>
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
    uid: state.user?.uid,
    email: state.user?.email,
    name: state.user?.name,
    photo: state.user?.photo,
  }
}

const dispatchProps = ({
  setPersistState,
});

export default connect(mapStateToProps, dispatchProps)(App);
