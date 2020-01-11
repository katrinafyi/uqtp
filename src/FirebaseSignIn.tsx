import { auth } from "./state/firebase";
import * as firebaseui from "firebaseui";
import { FirebaseAuth } from "react-firebaseui";
import React from "react";
import firebase from "firebase/app";
import 'firebase/auth';

export const firebaseUIConfig = (allowAnon: boolean) => ({
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
  ].concat(allowAnon ? [firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID] : []),
  autoUpgradeAnonymousUsers: true,
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
  privacyPolicyUrl: 'https://kentonlam.xyz/uqtp-privacy/',
  callbacks: {
    // Avoid redirects after sign-in.
    // eslint-disable-next-line no-sequences
    signInSuccessWithAuthResult: (userCredential: firebase.auth.UserCredential) => {
      console.log(userCredential);
      return true;
    },
    signInFailure: (error) => {
      // For merge conflicts, the error.code will be
      // 'firebaseui/anonymous-upgrade-merge-conflict'.
      console.log('error signing in: ' +error.code);
      console.log('error uid: ' + error.credential?.uid);
      if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
        return Promise.resolve(error.credential);
      }
      // The credential the user tried to sign in with.
      var cred = error.credential;
      // Copy data from anonymous user to permanent user and delete anonymous
      // user.
      // ...
      // Finish sign-in after data is copied.
      return firebase.auth().signInWithCredential(cred);
    }
  }
} as firebaseui.auth.Config);

type Props = {
  allowAnonymous: boolean
}

export const FirebaseSignIn = ({ allowAnonymous }: Props) => {

  const uiCallback = (ui: firebaseui.auth.AuthUI) => {
    console.log('is email: ' + auth.isSignInWithEmailLink(window.location.href));
    console.log('is pending redirect: ' + ui.isPendingRedirect());
  }

  return <FirebaseAuth uiConfig={firebaseUIConfig(allowAnonymous)} firebaseAuth={auth} uiCallback={uiCallback}></FirebaseAuth>;
}