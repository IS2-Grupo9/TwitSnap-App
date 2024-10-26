import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/firestore';
import 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBfXuxIRoHaibsWtRFHJfhsGTc39wet9pg",
    authDomain: "twitsnap-aff6b.firebaseapp.com",
    projectId: "twitsnap-aff6b",
    storageBucket: "twitsnap-aff6b.appspot.com",
    messagingSenderId: "216459666015",
    appId: "1:216459666015:web:76945ffe345fef15fdb1ea",
    measurementId: "G-VZ8L15XKQ4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const chatDB = getFirestore(app);
const messaging = getMessaging(app);

export { analytics, chatDB, messaging };
  