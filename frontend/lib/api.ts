/**
 * API client for eBay REN backend
 */

import type {
  RoadmapData,
  RoadmapFilters,
  Snapshot,
  Draft,
  M0PriorityOption,
  UploadCSVResponse,
  ApiError
} from '@/types/roadmap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return response.json();
  }

  /**
   * Get roadmap data with filters (live data from Airtable)
   */
  async getRoadmapData(filters: {
    m0_priorities?: string[];
    markets?: string[];
    roadmap_changes?: string[];
  }): Promise<RoadmapData> {
    const params = new URLSearchParams();

    filters.m0_priorities?.forEach(p => params.append('m0_priorities[]', p));
    filters.markets?.forEach(m => params.append('markets[]', m));
    filters.roadmap_changes?.forEach(r => params.append('roadmap_changes[]', r));

    const response = await fetch(`${this.baseUrl}/api/roadmap?${params.toString()}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to fetch roadmap data');
    }

    return response.json();
  }


  /**
   * Get M0 priorities (for filter dropdown)
   */
  async getPriorities(): Promise<{ priorities: M0PriorityOption[] }> {
    const response = await fetch(`${this.baseUrl}/api/priorities`);
    return response.json();
  }


  /**
   * Manual cache refresh
   */
  async refreshCache(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/refresh`, {
      method: 'POST',
    });
    return response.json();
  }

}

export const apiClient = new ApiClient();
