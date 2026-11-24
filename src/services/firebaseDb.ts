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
  PROJECTS: 'flowdeck_projects',
  CLIENTS: 'flowdeck_clients',
  TASKS: 'flowdeck_tasks',
  MESSAGES: 'flowdeck_messages',
  SHOOTS: 'flowdeck_shoots',
  ROOMS: 'flowdeck_rooms',
  VERSIONS: 'flowdeck_versions',
  ASSETS: 'flowdeck_assets',
  LOGS: 'flowdeck_activity_logs',
  USERS: 'flowdeck_users',
  BUSINESSES: 'flowdeck_businesses',
  NOTIFICATIONS: 'flowdeck_notifications'
} as const;

/**
 * Deep sanitization function to remove undefined values that cause Firestore setDoc() to fail
 */
export function cleanForFirestore<T>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        res[key] = cleanForFirestore(value);
      }
    }
    return res;
  }
  return obj;
}

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
 * Write or update a document in Firestore with sanitization and error logging
 */
export const saveFirestoreDoc = async <T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> => {
  try {
    const cleaned = cleanForFirestore(data);
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err: any) {
    console.error(`Firestore save error on ${collectionName}/${data.id}:`, err?.message || err);
  }
};

/**
 * Delete document from Firestore with silent fallback
 */
export const deleteFirestoreDoc = async (
  collectionName: string,
  id: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn(`Firestore delete error on ${collectionName}/${id}:`, err?.message || err);
  }
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
      batch.set(ref, cleanForFirestore(item), { merge: true });
      count++;
    });

    // Clients
    initialData.clients.forEach((item) => {
      const ref = doc(db, COLLECTIONS.CLIENTS, item.id);
      batch.set(ref, cleanForFirestore(item), { merge: true });
      count++;
    });

    // Tasks
    initialData.tasks.forEach((item) => {
      const ref = doc(db, COLLECTIONS.TASKS, item.id);
      batch.set(ref, cleanForFirestore(item), { merge: true });
      count++;
    });

    // Shoots
    initialData.shootEvents.forEach((item) => {
      const ref = doc(db, COLLECTIONS.SHOOTS, item.id);
      batch.set(ref, cleanForFirestore(item), { merge: true });
      count++;
    });

    // Versions
    initialData.editVersions.forEach((item) => {
      const ref = doc(db, COLLECTIONS.VERSIONS, item.id);
      batch.set(ref, cleanForFirestore(item), { merge: true });
      count++;
    });

    // Messages
    initialData.messages.forEach((item) => {
      const ref = doc(db, COLLECTIONS.MESSAGES, item.id);
      batch.set(ref, cleanForFirestore(item), { merge: true });
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

