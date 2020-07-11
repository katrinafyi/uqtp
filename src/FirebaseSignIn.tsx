import { auth } from "./state/firebase";
import * as firebaseui from "firebaseui";
import { FirebaseAuth, StyledFirebaseAuth } from "react-firebaseui";
import React, { useState, useEffect, createContext, createRef, useCallback } from "react";
import firebase from "firebase/app";
import 'firebase/auth';
import { setUser } from './state/ducks/user'; 
import { connect } from "react-redux";

export const getFirebaseUIConfig = 
  (signInSuccess?: NewFirebaseLoginProps['signInSuccess'],
    mergeResolver?: NewFirebaseLoginProps['anonymousMergeConflict']): firebaseui.auth.Config => 
  ({
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      },
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        defaultCountry: 'AU',
      }
    ].concat([firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID]),
    autoUpgradeAnonymousUsers: true,
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    privacyPolicyUrl: 'https://kentonlam.xyz/uqtp-privacy/',
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (userCredential) => {
        // console.log(userCredential);
        return signInSuccess?.(userCredential) ?? false;
      },
      signInFailure: async (error) => {
        // ignore non-merge conflict errors.
        if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
          return;
        }
        if (mergeResolver) {
          await mergeResolver(error.credential);
        }
      }
    }
  });

const mapDispatchToProps = {
  setUser
};

type Props = typeof mapDispatchToProps;
const _FirebaseSignIn = ({ setUser }: Props) => {
  const config = getFirebaseUIConfig();

  config.callbacks!.signInSuccessWithAuthResult = (cred: firebase.auth.UserCredential) => {
    // console.log('signInSuccessWithAuthResult');
    // console.log(cred);
    // if (cred.operationType === 'link')
    //   setUser(cred.user);
    return false;
  }

  const [element, setElement] = useState<JSX.Element | null>(null);
  
  useEffect(() => {
    if (!element)
      setElement(<FirebaseAuth uiConfig={config} firebaseAuth={auth}></FirebaseAuth>)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  return element;
}

export const FirebaseSignIn = connect(null, mapDispatchToProps)(_FirebaseSignIn);

export type NewFirebaseLoginProps = {
  anonymousMergeConflict?: (newCredential: firebase.auth.AuthCredential) => Promise<void>,
  signInSuccess?: (authResult: firebase.auth.UserCredential) => boolean,
}

export const NewFirebaseLogin = (props: NewFirebaseLoginProps) => {
  const config = getFirebaseUIConfig(props.signInSuccess, props.anonymousMergeConflict);

  const uiCallback = useCallback((ui: firebaseui.auth.AuthUI) => ui.reset(), []);

  return <StyledFirebaseAuth uiConfig={config} firebaseAuth={auth} uiCallback={uiCallback}>
  </StyledFirebaseAuth>;
}