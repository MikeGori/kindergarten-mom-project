import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Replace with real Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyCy9ZGX2yqyKtYU2tHmVpCwCGduo1lfRBk",
  authDomain: "kindergarten-app-319e2.firebaseapp.com",
  projectId: "kindergarten-app-319e2",
  storageBucket: "kindergarten-app-319e2.firebasestorage.app",
  messagingSenderId: "296237623020",
  appId: "1:296237623020:web:4973ccf53fe9305b5327c9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Helper to get school settings
export const getSchoolSettings = async () => {
    try {
        const docRef = doc(db, "settings", "school");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return { name: "גן הילדים שלנו" }; // Default name
    } catch (e) {
        console.error("Error fetching school settings:", e);
        return { name: "גן הילדים שלנו" };
    }
};
