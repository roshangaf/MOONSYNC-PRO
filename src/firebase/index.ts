
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let dbInstance: Firestore | null = null;

/**
 * Initializes the Firebase application and its core services.
 * Specifically configured for high-performance IT terminal synchronization.
 */
export function initializeFirebase() {
  const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  if (!dbInstance) {
    try {
      // Enable high-speed persistent local cache for instant data availability across devices and tabs
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (e) {
      dbInstance = getFirestore(app);
    }
  }

  const auth: Auth = getAuth(app);
  
  return { app, db: dbInstance, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './firestore/use-memo-firebase';
export * from './auth/use-user';
