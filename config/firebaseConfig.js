import { FirebaseApp, getApp, getApps, initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBfXuxIRoHaibsWtRFHJfhsGTc39wet9pg",
    authDomain: "twitsnap-aff6b.firebaseapp.com",
    projectId: "twitsnap-aff6b",
    storageBucket: "twitsnap-aff6b.appspot.com",
    messagingSenderId: "216459666015",
    appId: "1:216459666015:web:76945ffe345fef15fdb1ea",
    measurementId: "G-VZ8L15XKQ4",
    databaseURL: '',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const fireDB = firestore();
const messagingInstance = messaging();

export { app, fireDB, messagingInstance };