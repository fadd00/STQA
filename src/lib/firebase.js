import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwuc192n-DCD6RUUBX0yP3BVqlBCsexvM",
  authDomain: "gambling-21.firebaseapp.com",
  projectId: "gambling-21",
  storageBucket: "gambling-21.firebasestorage.app",
  messagingSenderId: "340813670464",
  appId: "1:340813670464:web:8b8bb20e9523ffc03e97a5",
  measurementId: "G-GHLGZ9S0N5",
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
