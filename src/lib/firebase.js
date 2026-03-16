// Mock Firebase Configuration for the Kindergarten App

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Replace with real Firebase config from the console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "kindergarten-app.firebaseapp.com",
  projectId: "kindergarten-app",
  storageBucket: "kindergarten-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
