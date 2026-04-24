
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const initialized = initializeFirebase();
    setFirebase(initialized);
  }, []);

  if (!firebase) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseProvider app={firebase.app} db={firebase.db} auth={firebase.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
