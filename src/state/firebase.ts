import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyDEuPTnP0DgQB4i8XC_nK2bSTKhbYp9qx0",
    authDomain: "uq-toilet-paper.firebaseapp.com",
    databaseURL: "https://uq-toilet-paper.firebaseio.com",
    projectId: "uq-toilet-paper",
    storageBucket: "uq-toilet-paper.appspot.com",
    messagingSenderId: "808204317412",
    appId: "1:808204317412:web:fb5461d5511544500472f1",
    measurementId: "G-Y6931FS6XR"
};

firebase.initializeApp(firebaseConfig);
export const firestore = firebase.firestore();
export const auth = firebase.auth();