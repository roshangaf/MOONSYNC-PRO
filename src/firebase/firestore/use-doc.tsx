
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * High-performance hook for real-time documents.
 * Prioritizes local cache to provide an "instant" UI experience.
 */
export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    // Only set loading if the path changed and we don't have existing data for it.
    if (lastPathRef.current !== ref.path && !data) {
      setLoading(true);
    }
    lastPathRef.current = ref.path;

    const unsubscribe = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      (snapshot: DocumentSnapshot<T>) => {
        setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : null);
        setLoading(false);
      },
      async (serverError: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
