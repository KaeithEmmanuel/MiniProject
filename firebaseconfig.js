import { initializeApp } from "firebase/app";
import { getAuth,initializeAuth,getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe1KJo4oPCHpsBXW0kn-e1KcBFxg657ok",
  authDomain: "bodymeasurment-2419a.firebaseapp.com",
  projectId: "bodymeasurment-2419a",
  storageBucket: "bodymeasurment-2419a.firebasestorage.app",
  messagingSenderId: "1069432677861",
  appId: "1:1069432677861:web:0499345d91d8bc76563b0c",
  measurementId: "G-S4C4T6TN6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { auth, db, analytics , storage };
