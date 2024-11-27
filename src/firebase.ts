// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  addDoc,
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Helper functions for database operations
export interface StudyHour {
  category: string;
  hours: number;
}

export interface StudyEntry {
  id?: string;
  date: string;
  hours: StudyHour[];
  timestamp: Timestamp;
}

export type StudyCategory = string;

export interface ProgressTotals {
  id?: string;
  weeklyTotals: Record<StudyCategory, number>;
  monthlyTotals: Record<StudyCategory, number>;
  lastUpdated: Timestamp;
}

// Add a new study entry
export async function addStudyEntry(entry: Omit<StudyEntry, 'timestamp'>) {
  try {
    // Check if there's already an entry for this date
    const existingEntries = await getStudyEntriesForDate(entry.date);
    
    if (existingEntries.length > 0) {
      // Update existing entry
      const existingEntry = existingEntries[0];
      const updatedHours = [...existingEntry.hours, ...entry.hours];
      
      await updateDoc(doc(db, 'studyEntries', existingEntry.id), {
        hours: updatedHours,
        timestamp: Timestamp.now()
      });
      
      return existingEntry.id;
    } else {
      // Create new entry
      const docRef = await addDoc(collection(db, 'studyEntries'), {
        ...entry,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error adding study entry:', error);
    throw error;
  }
}

// Get study entries for a specific date
export async function getStudyEntriesForDate(date: string) {
  try {
    const q = query(
      collection(db, 'studyEntries'),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudyEntry));
  } catch (error) {
    console.error('Error getting study entries:', error);
    throw error;
  }
}

// Subscribe to study entries for a specific date
export function subscribeToStudyEntries(date: string, callback: (entries: StudyEntry[]) => void) {
  const q = date 
    ? query(
        collection(db, 'studyEntries'),
        where('date', '==', date)
      )
    : query(collection(db, 'studyEntries'));
  
  return onSnapshot(q, (querySnapshot) => {
    const entries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudyEntry));
    callback(entries);
  }, (error) => {
    console.error('Error in study entries subscription:', error);
  });
}

// Delete a specific hour entry from a study entry
export async function deleteStudyHour(entryId: string, hourIndex: number) {
  try {
    const entryRef = doc(db, 'studyEntries', entryId);
    const entrySnap = await getDocs(query(collection(db, 'studyEntries'), where('__name__', '==', entryId)));
    
    if (!entrySnap.empty) {
      const entry = { id: entrySnap.docs[0].id, ...entrySnap.docs[0].data() } as StudyEntry;
      const updatedHours = entry.hours.filter((_, index) => index !== hourIndex);
      
      if (updatedHours.length === 0) {
        // If no hours left, delete the entire entry
        await deleteDoc(entryRef);
      } else {
        // Update with remaining hours
        await updateDoc(entryRef, {
          hours: updatedHours,
          timestamp: Timestamp.now()
        });
      }
    }
  } catch (error) {
    console.error('Error deleting study hour:', error);
    throw error;
  }
}

// Update progress totals
export async function updateProgressTotals(totals: Omit<ProgressTotals, 'id'>) {
  try {
    const totalsRef = collection(db, 'progressTotals');
    const querySnapshot = await getDocs(totalsRef);
    
    if (querySnapshot.empty) {
      // Create new document if none exists
      await addDoc(totalsRef, totals);
    } else {
      // Update existing document
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, totals);
    }
  } catch (error) {
    console.error('Error updating progress totals:', error);
    throw error;
  }
}

// Subscribe to progress totals
export function subscribeToProgressTotals(callback: (totals: ProgressTotals | null) => void) {
  const totalsRef = collection(db, 'progressTotals');
  
  return onSnapshot(totalsRef, (querySnapshot) => {
    if (querySnapshot.empty) {
      callback(null);
    } else {
      const doc = querySnapshot.docs[0];
      callback({ id: doc.id, ...doc.data() } as ProgressTotals);
    }
  }, (error) => {
    console.error('Error in progress totals subscription:', error);
    callback(null);
  });
}

// Factory reset - delete all study entries and progress totals
export async function factoryReset() {
  try {
    const batch = writeBatch(db);
    
    // Delete all study entries
    const entriesSnapshot = await getDocs(collection(db, 'studyEntries'));
    entriesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete all progress totals
    const totalsSnapshot = await getDocs(collection(db, 'progressTotals'));
    totalsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error performing factory reset:', error);
    throw error;
  }
}