import React, { useState, useEffect, createRef } from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import firebase from 'firebase';
import { setPersistState } from './state/ducks/persist';
import { setUser } from './state/ducks/user';
import StateErrorBoundary from './StateErrorBoundary';
import Main from './Main';
import { PersistState, DEFAULT_PERSIST } from './state/schema';
import { connect } from 'react-redux';
import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaUser } from 'react-icons/fa';
import { auth, firestore } from './state/firebase';
import * as firebaseui from 'firebaseui';
import { useCopyToClipboard } from 'react-use';
import { getFirebaseUIConfig } from './FirebaseSignIn';
import { Modal, ModalCard } from './components/Modal';
import { UserInfoView } from './UserInfoView';
import { FirebaseAuth } from 'react-firebaseui';

type Props = ReturnType<typeof mapStateToProps>
  & typeof dispatchProps;

const App = ({ uid, name, email, photo, phone, isAnon, setPersistState, setUser }: Props) => {
  const [signInError, setSignInError] = useState<firebaseui.auth.AuthUIError | null>(null);

  const [showSignIn, setShowSignIn] = useState(false);

  const [showUserInfo, setShowUserInfo] = useState(false);

  const signOut = () => {
    setShowUserInfo(false);
    setShowSignIn(false);
    auth.signOut();
  }

  const displayName = name ?? email ?? phone;

  const config = getFirebaseUIConfig();
  config.callbacks!.signInSuccessWithAuthResult = (cred: firebase.auth.UserCredential) => {
    console.log('signInSuccessWithAuthResult:');
    console.log(cred);
    setShowUserInfo(false);
    setShowSignIn(false);
    if (cred.operationType === 'link')
      setUser(cred.user);
    return false;
  };
  
  config.callbacks!.signInFailure = (error) => {
    // For merge conflicts, the error.code will be
    // 'firebaseui/anonymous-upgrade-merge-conflict'.
    console.log('error signing in: ' +error.code);
    console.log('error uid: ' + error.credential?.uid);
    if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
      return Promise.resolve(error.credential);
    }
    // The credential the user tried to sign in with.
    const newCred = error.credential;
    // The user currently signed in.
    const oldUser = auth.currentUser!;

    // read old data and merge.
    return firestore.collection('users').doc(oldUser.uid).get()
      .then(doc => doc.data() as PersistState)
      .then(oldData => firebase.auth().signInWithCredential(newCred)
        .then((cred) => {
          const newDocRef = firestore.collection('users').doc(cred.user!.uid);
          newDocRef.get().then(newDoc => {
            setShowSignIn(false);
            setShowUserInfo(false);

            const newData = newDoc.data() as PersistState | undefined;
            if (newData) {
              newData.timetables = { ...newData.timetables, ...oldData.timetables };
            }
            return newDocRef.set(newData ?? oldData);
          })
        })
      );
  };

  const [authUI, setAuthUI] = useState<JSX.Element | null>(null);
  useEffect(() => {
    if (!authUI)
      setAuthUI(<FirebaseAuth uiConfig={config} firebaseAuth={auth}></FirebaseAuth>)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUI]);

  const firebaseRef = createRef<HTMLDivElement>();
  const isEmailLink = auth.isSignInWithEmailLink(window.location.href);
  useEffect(() => {
    if (isEmailLink)
      new firebaseui.auth.AuthUI(auth).start(firebaseRef.current!, config);
  // We only want to run this once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>
    <Modal visible={showSignIn} setVisible={setShowSignIn}>
      {showSignIn && !isEmailLink && authUI}
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
          : (!showSignIn && !isEmailLink && authUI)}
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
  setUser
});

export default connect(mapStateToProps, dispatchProps)(App);
