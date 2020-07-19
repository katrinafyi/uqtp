import React, { useState, useEffect } from 'react';
import Emoji from 'a11y-react-emoji'
import './App.scss';

import StateErrorBoundary from './components/StateErrorBoundary';
import Main from './Main';
import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaUser } from 'react-icons/fa';
import { auth, userFirestoreDocRef, mergeAnonymousData } from './state/firebase';
import { NewFirebaseLoginProps, NewFirebaseLogin } from './components/FirebaseSignIn';
import { Modal, ModalCard } from './components/Modal';
import UserInfoView from './components/UserInfoView';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useStoreState, useStoreActions } from './state/easy-peasy';


const App = () => {
  const user = useStoreState(s => s.user);
  const setUser = useStoreActions(s => s.setUser);

  const [authUser, authLoading, authError] = useAuthState(auth);
  const showMainSignIn = authUser == null;
 //console.log({authUser, authLoading, authError});

  const [showSignInModal, setShowSignIn] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const signOut = async () => {
    setShowUserInfo(false);
    setShowSignIn(false);

    try {
      const ref = userFirestoreDocRef(user?.uid ?? null);
      if ((user?.isAnon ?? false) && ref)
        await ref.delete();
    } catch (e) {
      console.error('failed to delete anonymous data', e);
    }
    
    await auth.signOut();
  };

  useEffect(() => {
    if (!authLoading && !authError)
      setUser(authUser ?? null);
  }, [authUser, authLoading, authError, setUser]);

  const signInSuccess = () => {
    setShowUserInfo(false);
    setShowSignIn(false);
    return false;
  };

  const signInConfig: NewFirebaseLoginProps = {
    signInSuccess,
    anonymousMergeConflict: async (cred: firebase.auth.AuthCredential) => {
      await mergeAnonymousData(cred);
      signInSuccess();
    },
  };
  
  const [firebaseLoginElement] = useState(() => <NewFirebaseLogin {...signInConfig}></NewFirebaseLogin>);
  
  const displayName = user?.name ?? user?.email ?? user?.phone;
  const isAnon = user?.isAnon ?? false;
  const uid = user?.uid;
  const photo = user?.photo;

  const isEmailLink = auth.isSignInWithEmailLink(window.location.href);

  return <>
    <Modal visible={showSignInModal} setVisible={setShowSignIn}>
      <div style={{display: authLoading ? 'none' : ''}}>
        {showSignInModal && firebaseLoginElement}
      </div>
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
      {user && <UserInfoView></UserInfoView>}
    </ModalCard>
    <div className="hero is-dark">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title is-1"><Emoji symbol="📅"></Emoji>&nbsp;UQTP&nbsp;<Emoji symbol="✨" className="has-text-size-4"></Emoji> <span className="is-no-wrap"><span className="tag is-link">{process.env.REACT_APP_VERSION}</span> <span className="tag is-warning">Unofficial</span></span></h1>
              <p className="mb-2">
                <em>Plan your timetable where Allocate+ can't hurt you.</em>
              </p>
              <p className="block">
                UQTP is a new timetable planner for UQ. Works on mobile and syncs to the cloud!
              </p>
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
        <div style={{display: authLoading ? 'none' : ''}}>
          {!showSignInModal && (showMainSignIn || isEmailLink) && firebaseLoginElement}
        </div>
        {uid && <Main></Main>}
      </StateErrorBoundary>
    </section>
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <strong>UQTP</strong> is an (unofficial) timetable planner for UQ, built by&nbsp;
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

export default App;
