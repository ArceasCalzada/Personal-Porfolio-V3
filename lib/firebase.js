import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_MZWuyfHvQgNtwRjOwBbSP8UgzHHcggU",
  authDomain: "porfolio-website-d4a19.firebaseapp.com",
  projectId: "porfolio-website-d4a19",
  storageBucket: "porfolio-website-d4a19.firebasestorage.app",
  messagingSenderId: "647014557769",
  appId: "1:647014557769:web:95a52b547ed24c1d9eb798"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
