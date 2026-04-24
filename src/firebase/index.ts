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

export function initializeFirebase() {
  const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let db: Firestore;
  try {
    // Enable persistent local cache for "faster than ever" data access
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    // If already initialized, get the existing instance
    db = getFirestore(app);
  }

  const auth: Auth = getAuth(app);
  
  return { app, db, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './firestore/use-memo-firebase';
export * from './auth/use-user';
