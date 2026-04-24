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

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  
  // Track the query to avoid resetting data when query stays stable
  const lastQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const currentQueryKey = (query as any)._query?.path?.segments?.join('/') || 'query';
    
    // Only set loading if the query path has actually changed or we have no data
    if (lastQueryRef.current !== currentQueryKey && data.length === 0) {
      setLoading(true);
    }
    
    lastQueryRef.current = currentQueryKey;

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setData(items);
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
