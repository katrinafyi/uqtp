import React, { useState, useEffect, Dispatch, createRef } from 'react';
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
import { FirebaseSignIn, firebaseUIConfig } from './FirebaseSignIn';
import { Modal } from './components/Modal';

type Props = ReturnType<typeof mapStateToProps>
  & typeof dispatchProps;

const App = ({ uid, name, email, photo, isAnon, setPersistState }: Props) => {
  const [signInError, setSignInError] = useState<firebaseui.auth.AuthUIError | null>(null);

  const [showSignIn, setShowSignIn] = useState(false);

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

  const signOut = () => {
    

    auth.signOut();
  }

  const displayName = name ?? email;

  const isEmailLink = auth.isSignInWithEmailLink(window.location.href);
  const firebaseRef = createRef<HTMLDivElement>();
  useEffect(() => {
    if (isEmailLink)
      new firebaseui.auth.AuthUI(auth).start(firebaseRef.current!, firebaseUIConfig(true));
  // We only want to run this once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>
    <Modal visible={showSignIn} setVisible={setShowSignIn}>
      {showSignIn && !isEmailLink && <FirebaseSignIn allowAnonymous={false}></FirebaseSignIn>}
    </Modal>
    <div className="hero" style={{ backgroundColor: '#fafafa' }}>
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title "><span className="is-size-1"><Emoji symbol="🧻"></Emoji></span> UQ Toilet Paper <span className="tag is-link is-light">{process.env.REACT_APP_VERSION}</span> <span className="tag is-danger is-light">Unofficial</span></h1>
              <p className="block">Plan your timetable where Allocate+®™ can't hurt you. Works on mobile!</p>
            </div>
            <div className="column is-narrow">
              {uid && <div className="buttons">
                <div className="button" title="Click to copy user ID" onClick={copyUID}>
                  <span className="icon">
                    {photo && displayName
                      ? <img src={photo} alt={displayName} />
                      : <FaUser></FaUser>}
                  </span>
                  <span>{copied ? 'Copied!' 
                    : (displayName ?? <>(anonymous <span className="is-family-monospace">{uid?.substr(0, 4)}</span>)</>)}</span>
                </div>
                {isAnon && <button className="button is-link" type="button" onClick={() => setShowSignIn(true)}>
                  <span className="icon"><FaSignInAlt></FaSignInAlt></span><span> Log in</span>
                </button>}
                <div className="button is-danger is-outlined" title="Sign out" onClick={signOut}>
                  <span className="icon"><FaSignOutAlt></FaSignOutAlt></span>
                </div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
    <section className="section">
      <StateErrorBoundary>
        <div id="firebaseui-email" ref={firebaseRef}></div>
        {uid ? <Main></Main>
          : (!showSignIn && !isEmailLink && <FirebaseSignIn allowAnonymous={true}></FirebaseSignIn>)}
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
    isAnon: state.user?.isAnon,
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
