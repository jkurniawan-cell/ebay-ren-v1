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
   * Get roadmap data with filters
   */
  async getRoadmapData(filters: RoadmapFilters): Promise<RoadmapData> {
    const params = new URLSearchParams();

    params.append('mode', filters.mode);

    if (filters.mode === 'approved') {
      if (filters.planning_cycle) {
        params.append('planning_cycle', filters.planning_cycle);
      } else if (filters.snapshot_id) {
        params.append('snapshot_id', filters.snapshot_id.toString());
      }
    }

    if (filters.mode === 'draft' && filters.planning_cycle) {
      params.append('planning_cycle', filters.planning_cycle);
    }

    filters.m0_priorities?.forEach(p => params.append('m0_priorities[]', p));
    filters.markets?.forEach(m => params.append('markets[]', m));
    filters.roadmap_changes?.forEach(r => params.append('roadmap_changes[]', r));
    filters.delivery_owners?.forEach(o => params.append('delivery_owners[]', o));
    filters.beneficiaries?.forEach(b => params.append('beneficiaries[]', b));

    const response = await fetch(`${this.baseUrl}/api/roadmap?${params.toString()}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to fetch roadmap data');
    }

    return response.json();
  }

  /**
   * Get all snapshots
   */
  async getSnapshots(): Promise<{ snapshots: Snapshot[] }> {
    const response = await fetch(`${this.baseUrl}/api/snapshots`);
    return response.json();
  }

  /**
   * Create snapshot (approve planning cycle)
   */
  async createSnapshot(planning_cycle: string, approved_by: string = 'Jordan'): Promise<{ snapshot: Snapshot }> {
    const response = await fetch(`${this.baseUrl}/api/snapshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planning_cycle, approved_by }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to create snapshot');
    }

    return response.json();
  }

  /**
   * Get all drafts
   */
  async getDrafts(): Promise<{ drafts: Draft[] }> {
    const response = await fetch(`${this.baseUrl}/api/drafts`);
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
   * Upload CSV file
   */
  async uploadCSV(file: File, planning_cycle: string): Promise<UploadCSVResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('planning_cycle', planning_cycle);

    const response = await fetch(`${this.baseUrl}/api/upload-csv`, {
      method: 'POST',
      body: formData,
    });

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

  /**
   * Get unique planning cycles for History dropdown
   */
  async getSnapshotCycles(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/snapshots/list`);
    const data = await response.json();
    return data.planning_cycles || [];
  }

  /**
   * Get M0 summary with M1 initiatives
   */
  async getM0Summary(planning_cycle: string = 'H2 2026'): Promise<any> {
    const params = new URLSearchParams();
    params.append('planning_cycle', planning_cycle);

    const response = await fetch(`${this.baseUrl}/api/m0-summary?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch M0 summary: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get roadmap data in V0 format (flattened launches)
   */
  async getRoadmapDataV0(filters: RoadmapFilters): Promise<any> {
    const data = await this.getRoadmapData(filters);
    // Data is already in the right structure, just return it
    return data;
  }
}

export const apiClient = new ApiClient();
