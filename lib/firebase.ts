import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBS8ECoks-R7Ec5gPz-96NQ0HjeEu27hn4",
  authDomain: "final-8f787.firebaseapp.com",
  projectId: "final-8f787",
  storageBucket: "final-8f787.firebasestorage.app",
  messagingSenderId: "87813096927",
  appId: "1:87813096927:web:fef49275235f7a25f4f06a",
  measurementId: "G-N972VDE8PE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);