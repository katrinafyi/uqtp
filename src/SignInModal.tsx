import React from "react";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from "firebase";
import { auth } from "./state/firebase";
import { Modal } from "./components/Modal";

type Props = {
    visible: boolean,
    setVisible: (visible: boolean) => any,
    success?: (authResult: any) => any,
}

export const SignInModal = ({ visible, setVisible, success }: Props) => {

    const uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            // eslint-disable-next-line no-sequences
            signInSuccessWithAuthResult: (authResult: any) => (success?.(authResult), false)
        }
    };

    return <>
        <Modal visible={visible} setVisible={setVisible} 
            title="Sign in">
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}></StyledFirebaseAuth>
        </Modal>
    </>;
}