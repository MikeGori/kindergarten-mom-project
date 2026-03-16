import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  setDoc
} from 'firebase/firestore';

/**
 * Posts Service
 */
export const createPost = async (author, type, contentUrl, caption = '') => {
  return await addDoc(collection(db, 'posts'), {
    authorId: author.id,
    authorName: author.name,
    type, // 'video', 'pdf', 'audio', 'drawing', 'emoji'
    contentUrl,
    caption,
    createdAt: serverTimestamp(),
    likes: []
  });
};

export const getPosts = async () => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Attendance Service
 */
export const logAttendance = async (childId) => {
  const today = new Date().toISOString().split('T')[0];
  const attendanceRef = doc(db, 'attendance', `${childId}_${today}`);
  
  return await setDoc(attendanceRef, {
    childId,
    date: today,
    loginTime: serverTimestamp()
  }, { merge: true });
};

/**
 * Dashboard & Analytics Queries
 */
export const getWeeklyAttendance = async () => {
  // Queries the last 7 days of attendance documents
  const attendanceSnap = await getDocs(collection(db, 'attendance'));
  // In a real app, we would group by date and count
  const data = attendanceSnap.docs.map(doc => doc.data());
  // ... transform data for Recharts ...
  return data;
};

export const getActivityBreakdown = async () => {
  const postsSnap = await getDocs(collection(db, 'posts'));
  const types = postsSnap.docs.map(doc => doc.data().type);
  // Calculate counts for each type: emoji, drawing, audio, etc.
  return types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
};

export const getDashboardMetrics = async () => {
  const attendanceSnap = await getDocs(collection(db, 'attendance'));
  const postsSnap = await getDocs(collection(db, 'posts'));

  return {
    activeChildren: attendanceSnap.size, // Today's count
    totalPosts: postsSnap.size,
    engagementRate: (postsSnap.size / Math.max(1, attendanceSnap.size)).toFixed(2)
  };
};

/**
 * Rewards Service
 */
export const awardSticker = async (childId, stickerType, reason, authorId) => {
  return await addDoc(collection(db, 'rewards'), {
    childId,
    stickerType,
    reason,
    awardedBy: authorId,
    awardedAt: serverTimestamp()
  });
};

export const getChildRewards = async (childId) => {
  const q = query(collection(db, 'rewards'), where('childId', '==', childId), orderBy('awardedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
