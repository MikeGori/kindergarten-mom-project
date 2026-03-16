import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Secure Media Uploads
 * Organizes files into folders based on actor and type
 */
export const uploadMedia = async (file, pathPrefix) => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `${pathPrefix}/${timestamp}_${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
};

/**
 * Helper for Teacher Video Uploads
 */
export const uploadTeacherVideo = (file, teacherId) => 
  uploadMedia(file, `staff/${teacherId}/videos`);

/**
 * Helper for Child Drawing Uploads
 */
export const uploadChildDrawing = (file, childId) => 
  uploadMedia(file, `children/${childId}/drawings`);

/**
 * Helper for Child Audio Uploads
 */
export const uploadChildAudio = (file, childId) => 
  uploadMedia(file, `children/${childId}/audio`);
