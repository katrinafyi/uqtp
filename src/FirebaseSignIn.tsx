import { auth } from "./state/firebase";
import * as firebaseui from "firebaseui";
import { FirebaseAuth } from "react-firebaseui";
import React from "react";
import firebase from "firebase";

export const firebaseUIConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
    },      
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
  ],
  autoUpgradeAnonymousUsers: true,
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
  callbacks: {
    // Avoid redirects after sign-in.
    // eslint-disable-next-line no-sequences
    signInSuccessWithAuthResult: (authResult: any) => (false),
    signInFailure: (error) => {
      // For merge conflicts, the error.code will be
      // 'firebaseui/anonymous-upgrade-merge-conflict'.
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
};

export const FirebaseSignIn = () => {

  const uiCallback = (ui: firebaseui.auth.AuthUI) => {
    console.log('is email: ' + auth.isSignInWithEmailLink(window.location.href));
    console.log('is pending redirect: ' + ui.isPendingRedirect());
  }

  return <FirebaseAuth uiConfig={firebaseUIConfig} firebaseAuth={auth} uiCallback={uiCallback}></FirebaseAuth>;
}