
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * High-performance hook for real-time collections.
 * Prioritizes local cache to provide an "instant" UI experience.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  
  const lastQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const currentQueryKey = (query as any)._query?.path?.segments?.join('/') || 'query';
    
    // We only show loading if we have NO data for this specific query yet.
    // If we have data (even from cache), we keep showing it during background sync.
    if (lastQueryRef.current !== currentQueryKey && data.length === 0) {
      setLoading(true);
    }
    lastQueryRef.current = currentQueryKey;

    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: true },
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        
        // Optimistic update: use cache immediately
        setData(items);
        
        // Stop loading as soon as we have any snapshot (cache or server)
        setLoading(false);
      },
      async (serverError: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
          path: lastQueryRef.current || 'unknown',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
