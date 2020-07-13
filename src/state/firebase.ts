import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';

export const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);
// export const database = firebase.database();
export const firestore = firebase.firestore();
export const auth = firebase.auth();
firebase.analytics();

export const userFirestoreDocRef = (userOrUid?: firebase.User | string | null) => {
    let uid = undefined;
    if (typeof userOrUid == 'string') {
        uid = userOrUid;
    } else {
        let user = userOrUid;
        if (!userOrUid)
            user = auth.currentUser ?? undefined;
        uid = user?.uid;
    }
    console.assert(uid != null);
    return firestore.collection('users').doc(uid);
}