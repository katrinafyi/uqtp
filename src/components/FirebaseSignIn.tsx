import { auth } from "../state/firebase";
import React, { useEffect } from "react";
import firebase from "firebase/app";
import 'firebase/auth';

import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

export const getFirebaseUIConfig =
  (signInSuccess?: NewFirebaseLoginProps['signInSuccess'],
    mergeResolver?: NewFirebaseLoginProps['anonymousMergeConflict']): firebaseui.auth.Config =>
  ({
    signInFlow: 'popup',
    signInOptions: [
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
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
    ],
    autoUpgradeAnonymousUsers: true,
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    privacyPolicyUrl: 'https://kentonlam.xyz/uqtp-privacy/',
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (userCredential) => {
       //console.log(userCredential);
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

export type NewFirebaseLoginProps = {
  anonymousMergeConflict?: (newCredential: firebase.auth.AuthCredential) => Promise<void>,
  signInSuccess?: (authResult: firebase.auth.UserCredential) => boolean,
}

export const NewFirebaseLogin = (props: NewFirebaseLoginProps) => {
  const config = getFirebaseUIConfig(props.signInSuccess, props.anonymousMergeConflict);

  // const uiCallback = useCallback((ui: firebaseui.auth.AuthUI) => ui.reset(), []);

  const id = "new-firebaseui-login";

  // this component should only be instantiated once!
  useEffect(() => {
    const ui = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(auth);
    ui.start('#'+id, config);
  }, [config]);

  return <div id={id}></div>;
}
