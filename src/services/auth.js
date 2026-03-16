import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

/**
 * Staff Authentication: Standard Email/Password
 */
export const staffLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Verify role in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists() && userDoc.data().role === 'staff') {
      return userDoc.data();
    } else {
      await signOut(auth);
      throw new Error('Unauthorized: Staff access only.');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Child Authentication: Visual PIN Sequence
 * 1. Find the child document by name or ID
 * 2. Compare the provided visual sequence with the stored one
 * 3. Sign in anonymously and set local user context
 */
export const childVisualLogin = async (childId, providedSequence) => {
  try {
    const childDoc = await getDoc(doc(db, 'users', childId));
    
    if (!childDoc.exists() || childDoc.data().role !== 'child') {
      throw new Error('Child profile not found.');
    }

    const storedSequence = childDoc.data().visualPin; // e.g., ['bear', 'apple', 'car']
    
    // Validate sequence
    const isValid = JSON.stringify(providedSequence) === JSON.stringify(storedSequence);
    
    if (isValid) {
      // Use anonymous auth to create a session
      await signInAnonymously(auth);
      // We return the child profile. The application should track this childId in state.
      return {
        ...childDoc.data(),
        id: childDoc.id
      };
    } else {
      throw new Error('Oops! That sequence is not quite right. Try again!');
    }
  } catch (error) {
    throw error;
  }
};

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
