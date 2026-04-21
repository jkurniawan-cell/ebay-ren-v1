/**
 * TypeScript type definitions for eBay REN dashboard
 */

export interface KeyLaunch {
  name: string;
  m0_priority_name: string;
  m1_initiative_name: string;
  key_launch_name: string;
  roadmap_ownership?: string;
  original_start_quarter: string;
  original_end_quarter: string;
  updated_start_quarter: string;
  updated_end_quarter: string;
  original_quarter: string;
  current_quarter: string;
  shifted: boolean;
  shift_direction?: 'deferred' | 'accelerated';
  geo_category: 'Big 3' | 'Remaining Big 4' | 'Global';
  target_geos: string[];
  target_geos_list: string[];
  roadmap_change: 'No Change' | 'Accelerated' | 'Deferred' | 'New';
  change_rationale?: string;
  change_rationale_comment?: string;
  cross_priority_dependencies: string[];
  cross_priority_dependencies_list: string[];
  highlighted?: boolean;
}

export interface M1Initiative {
  m1_name: string;
  start_quarter?: string;
  end_quarter?: string;
  key_launches: KeyLaunch[];
}

export interface M0Priority {
  m0_priority: string;
  business_unit: string;
  m1_initiatives: M1Initiative[];
}

export interface RoadmapData {
  data: M0Priority[];
  total_m0: number;
  total_launches: number;
}

export interface RoadmapFilters {
  mode: 'draft' | 'approved';
  snapshot_id?: number;
  planning_cycle?: string;
  m0_priorities?: string[];
  markets?: string[];
  roadmap_changes?: string[];
  delivery_owners?: string[];
  beneficiaries?: string[];
}

export interface Snapshot {
  id: number;
  planning_cycle: string;
  version: number;
  approved_by: string;
  approved_at: string;
  total_launches: number;
}

export interface Draft {
  id: number;
  planning_cycle: string;
  last_uploaded_at: string;
  uploaded_by: string;
  total_launches: number;
}

export interface M0PriorityOption {
  id: string;
  name: string;
  business_unit: string;
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type Year = '2025' | '2026' | '2027' | '2028';
export type QuarterLabel = `${Quarter}-${Year}`;

export interface UploadCSVResponse {
  success: boolean;
  message: string;
  total_launches?: number;
  planning_cycle?: string;
  draft_info?: Draft;
}

export interface ApiError {
  error: string;
}
