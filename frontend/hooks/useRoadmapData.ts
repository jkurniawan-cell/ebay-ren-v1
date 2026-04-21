/**
 * Hook for fetching and managing roadmap data
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { RoadmapData, RoadmapFilters } from '@/types/roadmap';

export function useRoadmapData(filters: RoadmapFilters) {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getRoadmapData(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
