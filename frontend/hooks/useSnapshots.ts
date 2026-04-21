/**
 * Hook for managing snapshots
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Snapshot } from '@/types/roadmap';

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getSnapshots();
      setSnapshots(result.snapshots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snapshots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const createSnapshot = useCallback(async (planning_cycle: string, approved_by: string = 'Jordan') => {
    try {
      const result = await apiClient.createSnapshot(planning_cycle, approved_by);
      await fetchSnapshots(); // Refresh list
      return result.snapshot;
    } catch (err) {
      throw err;
    }
  }, [fetchSnapshots]);

  return { snapshots, loading, error, createSnapshot, refetch: fetchSnapshots };
}
