import React from "react";
import firebase from "firebase";
import { auth } from "./state/firebase";
import { Modal } from "./components/Modal";
import { FirebaseAuth } from "react-firebaseui";

type Props = {
    visible: boolean,
    setVisible: (visible: boolean) => any,
    success?: (authResult: any) => any,
}

export const SignInModal = ({ visible, setVisible, success }: Props) => {

    const uiConfig: firebaseui.auth.Config = {
        signInFlow: 'popup',
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            // eslint-disable-next-line no-sequences
            signInSuccessWithAuthResult: (authResult: any) => (success?.(authResult), false),
        }
    };

    return <>
        <Modal visible={visible} setVisible={setVisible}>
            <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}></FirebaseAuth>
        </Modal>
    </>;
}