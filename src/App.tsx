import React, { useState, useEffect, createRef } from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import { setPersistState } from './state/ducks/persist';
import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';
import { PersistState, DEFAULT_PERSIST } from './state/schema';
import { connect } from 'react-redux';
import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaUser } from 'react-icons/fa';
import { auth } from './state/firebase';
import * as firebaseui from 'firebaseui';
import { useCopyToClipboard } from 'react-use';
import { FirebaseSignIn, firebaseUIConfig } from './FirebaseSignIn';
import { Modal, ModalCard } from './components/Modal';
import { UserInfoView } from './UserInfoView';

type Props = ReturnType<typeof mapStateToProps>
  & typeof dispatchProps;

const App = ({ uid, name, email, photo, phone, isAnon, setPersistState }: Props) => {
  const [signInError, setSignInError] = useState<firebaseui.auth.AuthUIError | null>(null);

  const [showSignIn, setShowSignIn] = useState(false);

  const [showUserInfo, setShowUserInfo] = useState(false);

  const signOut = () => {
    setShowUserInfo(false);
    setShowSignIn(false);
    auth.signOut();
  }

  const displayName = name ?? email ?? phone;

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
    <ModalCard visible={showUserInfo} setVisible={setShowUserInfo}
      title={"User Info"}
      footer={<div className="level" style={{width: '100%'}}>
        <div className="level-left is-hidden-mobile"><div className="level-item">
          <button className="button" onClick={() => setShowUserInfo(false)}>Close</button>
        </div></div>
        <div className="level-right">
          {isAnon && <div className="level-item has-text-danger">Anonymous data is deleted on log out.</div>}
          <div className="level-item">
            <button className="button is-danger" onClick={signOut}>
            <span className="icon"><FaSignOutAlt></FaSignOutAlt></span> <span>Log out</span></button>
          </div>
        </div>
      </div>}>
      <UserInfoView></UserInfoView>
    </ModalCard>
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
                <div className="button" title="Click to view user details" onClick={() => setShowUserInfo(true)}>
                  <span className="icon">
                    {(photo && displayName)
                      ? <img src={photo} alt={displayName} />
                      : <FaUser></FaUser>}
                  </span>
                  <span>{displayName ?? <>(anonymous <span className="is-family-monospace">{uid?.substr(0, 4)}</span>)</>}</span>
                </div>
                {isAnon && <button className="button is-link" type="button" onClick={() => setShowSignIn(true)}>
                  <span className="icon"><FaSignInAlt></FaSignInAlt></span><span> Log in</span>
                </button>}
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
    phone: state.user?.phone,
  }
}

const dispatchProps = ({
  setPersistState,
});

export default connect(mapStateToProps, dispatchProps)(App);
