'use client';

import { useMemo } from 'react';

/**
 * A hook to stabilize Firebase references and queries.
 * References created with doc() or collection() change on every render,
 * so they must be memoized when passed to useCollection or useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
