import firebase from 'firebase/app';
import 'firebase/auth';
// import 'firebase/firestore';
import 'firebase/database';
import { PersistState } from './schema';
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
export const database = firebase.database();
// export const firestore = firebase.firestore();
export const auth = firebase.auth();
firebase.analytics();

export const userFirestoreDocRef = (userOrUid: firebase.User | string | null) => {
    if (userOrUid == null)
        return null;

    let uid = '';
    if (typeof userOrUid == 'string') {
        uid = userOrUid;
    } else {
        uid = userOrUid.uid;
    }
    console.assert(uid != null);
    return database.ref('data/' + uid);
};

export const mergeData = (oldData: PersistState, newData: PersistState) => {
    return {...oldData, ...newData, timetables: { ...newData.timetables, ...oldData.timetables }};
}

export const mergeAnonymousData = async (newCredential: firebase.auth.AuthCredential) => {
    const oldUser = auth.currentUser;

   //console.log("merging data from accounts:", oldUser, newCredential);    

    const oldDocRef = userFirestoreDocRef(oldUser);
    if (!oldDocRef) {
        return;
    }

    const oldData = (await oldDocRef.once('value')).val() as PersistState;
    
    const newUser = await auth.signInWithCredential(newCredential);
    
    const newDocRef = userFirestoreDocRef(newUser.user)!;
    const newData = (await newDocRef.once('value')).val() as PersistState;
  
    await newDocRef.set(mergeData(oldData ?? {}, newData ?? {}));
  };