import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { ref as rtdbRef, set as rtdbSet, onValue, push } from 'firebase/database';
import { db, rtdb } from '../lib/firebase';
import { Project, ClientProfile, Task, Message, ShootEvent, EditVersion, ActivityLog } from '../types';

// Collection Constants
export const COLLECTIONS = {
  PROJECTS: 'studioflow_projects',
  CLIENTS: 'studioflow_clients',
  TASKS: 'studioflow_tasks',
  MESSAGES: 'studioflow_messages',
  SHOOTS: 'studioflow_shoots',
  VERSIONS: 'studioflow_versions',
  LOGS: 'studioflow_activity_logs'
} as const;

/**
 * Real-time collection subscriber
 */
export const subscribeFirestoreCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      callback(items);
    },
    (error) => {
      console.warn(`Firestore subscription error on ${collectionName}:`, error.message);
      if (onError) onError(error);
    }
  );
};

/**
 * Write or update a document in Firestore
 */
export const saveFirestoreDoc = async <T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> => {
  const docRef = doc(db, collectionName, data.id);
  await setDoc(docRef, data, { merge: true });
};

/**
 * Delete document from Firestore
 */
export const deleteFirestoreDoc = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

/**
 * Seed all initial Blueprint mock data to Firestore with one click
 */
export const seedInitialDataToFirebase = async (initialData: {
  projects: Project[];
  clients: ClientProfile[];
  tasks: Task[];
  messages: Message[];
  shootEvents: ShootEvent[];
  editVersions: EditVersion[];
  activityLogs: ActivityLog[];
}): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const batch = writeBatch(db);
    let count = 0;

    // Projects
    initialData.projects.forEach((item) => {
      const ref = doc(db, COLLECTIONS.PROJECTS, item.id);
      batch.set(ref, item, { merge: true });
      count++;
    });

    // Clients
    initialData.clients.forEach((item) => {
      const ref = doc(db, COLLECTIONS.CLIENTS, item.id);
      batch.set(ref, item, { merge: true });
      count++;
    });

    // Tasks
    initialData.tasks.forEach((item) => {
      const ref = doc(db, COLLECTIONS.TASKS, item.id);
      batch.set(ref, item, { merge: true });
      count++;
    });

    // Shoots
    initialData.shootEvents.forEach((item) => {
      const ref = doc(db, COLLECTIONS.SHOOTS, item.id);
      batch.set(ref, item, { merge: true });
      count++;
    });

    // Versions
    initialData.editVersions.forEach((item) => {
      const ref = doc(db, COLLECTIONS.VERSIONS, item.id);
      batch.set(ref, item, { merge: true });
      count++;
    });

    // Messages
    initialData.messages.forEach((item) => {
      const ref = doc(db, COLLECTIONS.MESSAGES, item.id);
      batch.set(ref, item, { merge: true });
      count++;
    });

    await batch.commit();

    // Also write a health ping to Realtime Database
    try {
      const pingRef = rtdbRef(rtdb, 'studioflow_status');
      await rtdbSet(pingRef, {
        lastSyncedAt: new Date().toISOString(),
        syncedRecordsCount: count,
        project: 'rakib-18024'
      });
    } catch (rtdbErr) {
      console.warn('Realtime Database ping warning:', rtdbErr);
    }

    return { success: true, count };
  } catch (err: any) {
    console.error('Failed to seed data to Firebase:', err);
    return { success: false, count: 0, error: err?.message || 'Error writing to Firestore' };
  }
};

/**
 * Realtime Database Presence & Live Notifications
 */
export const pushRealtimeNotification = async (message: string, meta?: any) => {
  try {
    const notifRef = rtdbRef(rtdb, 'studioflow_live_events');
    const newEventRef = push(notifRef);
    await rtdbSet(newEventRef, {
      message,
      timestamp: Date.now(),
      meta: meta || {}
    });
  } catch (err) {
    console.warn('Realtime notification write skipped:', err);
  }
};

