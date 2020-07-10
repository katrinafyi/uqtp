import { auth } from "./state/firebase";
import * as firebaseui from "firebaseui";
import { FirebaseAuth } from "react-firebaseui";
import React, { useState, useEffect } from "react";
import firebase from "firebase/app";
import 'firebase/auth';
import { setUser } from './state/ducks/user'; 
import { connect } from "react-redux";

export const getFirebaseUIConfig = () => ({
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
    // eslint-disable-next-line no-sequences
    signInSuccessWithAuthResult: (userCredential: firebase.auth.UserCredential) => {
      // console.log(userCredential);
      return false;
    },
  }
} as firebaseui.auth.Config);

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