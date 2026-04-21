/**
 * Data Adapter Layer
 * Transforms Flask API responses to V0's expected RoadmapItem format
 */

import type { RoadmapData, M0Priority, M1Initiative, KeyLaunch } from '@/types/roadmap';
import type { V0RoadmapItem } from './v0-types';

/**
 * Transform a single KeyLaunch to V0RoadmapItem format
 */
export function transformLaunchToV0Format(
  launch: KeyLaunch,
  m0Name: string,
  m1Name: string
): V0RoadmapItem {
  return {
    id: `${m0Name}-${m1Name}-${launch.key_launch_name}`.toLowerCase().replace(/\s+/g, '-'),
    priority: m0Name,
    play: m1Name,
    roadmapItem: launch.key_launch_name,
    deliveryOwner: launch.roadmap_ownership || '',
    description: launch.change_rationale_comment || '',
    startQuarter: launch.updated_start_quarter || launch.original_start_quarter || '',
    endQuarter: launch.updated_end_quarter || launch.original_end_quarter || '',
    originalStartQuarter: launch.original_start_quarter || '',
    originalEndQuarter: launch.original_end_quarter || '',
    geoCategory: launch.geo_category || '',
    geoCategoryDetails: Array.isArray(launch.target_geos_list)
      ? launch.target_geos_list.join(', ')
      : '',
    crossPriorityDependency: Array.isArray(launch.cross_priority_dependencies_list)
      ? launch.cross_priority_dependencies_list.join(', ')
      : '',
    roadmapChange: launch.roadmap_change || 'No Change',
    changeRationale: launch.change_rationale || 'No Change',
    changeRationaleComment: launch.change_rationale_comment || '',
  };
}

/**
 * Transform full API RoadmapData to V0RoadmapItem array
 */
export function transformRoadmapDataToV0Format(data: RoadmapData): V0RoadmapItem[] {
  const items: V0RoadmapItem[] = [];

  data.data.forEach((m0: M0Priority) => {
    m0.m1_initiatives.forEach((m1: M1Initiative) => {
      m1.key_launches.forEach((launch: KeyLaunch) => {
        items.push(transformLaunchToV0Format(launch, m0.m0_priority, m1.m1_name));
      });
    });
  });

  return items;
}

/**
 * Get unique M0 priorities from V0 items
 */
export function getUniquePriorities(items: V0RoadmapItem[]): string[] {
  return Array.from(new Set(items.map(item => item.priority))).sort();
}

/**
 * Get unique M1 plays from V0 items
 */
export function getUniquePlays(items: V0RoadmapItem[]): string[] {
  return Array.from(new Set(items.map(item => item.play))).filter(Boolean).sort();
}

/**
 * Get unique geo categories from V0 items
 */
export function getUniqueGeoCategories(items: V0RoadmapItem[]): string[] {
  return Array.from(new Set(items.map(item => item.geoCategory))).filter(Boolean).sort();
}

/**
 * Get unique cross-priority dependencies from V0 items
 */
export function getUniqueDependencies(items: V0RoadmapItem[]): string[] {
  const deps = new Set<string>();
  items.forEach(item => {
    if (item.crossPriorityDependency) {
      item.crossPriorityDependency.split(',').forEach(dep => {
        const trimmed = dep.trim();
        if (trimmed) deps.add(trimmed);
      });
    }
  });
  return Array.from(deps).sort();
}

/**
 * Filter V0 items by M0 priority
 */
export function filterByM0(items: V0RoadmapItem[], m0Names: string[]): V0RoadmapItem[] {
  if (m0Names.length === 0) return items;
  return items.filter(item => m0Names.includes(item.priority));
}

/**
 * Filter V0 items by quarter
 */
export function filterByQuarter(items: V0RoadmapItem[], quarters: string[]): V0RoadmapItem[] {
  if (quarters.length === 0) return items;

  return items.filter(item => {
    // Check if item spans any of the selected quarters
    return quarters.some(q => {
      const startQ = item.startQuarter;
      const endQ = item.endQuarter;

      // Simple string comparison works for Q1-2026 format
      return q >= startQ && q <= endQ;
    });
  });
}

/**
 * Filter V0 items by geo category
 */
export function filterByGeo(items: V0RoadmapItem[], geos: string[]): V0RoadmapItem[] {
  if (geos.length === 0) return items;
  return items.filter(item =>
    geos.some(geo =>
      item.geoCategory?.toLowerCase().includes(geo.toLowerCase()) ||
      item.geoCategoryDetails?.toLowerCase().includes(geo.toLowerCase())
    )
  );
}

/**
 * Filter V0 items by cross-priority dependencies
 */
export function filterByDependencies(items: V0RoadmapItem[], deps: string[]): V0RoadmapItem[] {
  if (deps.length === 0) return items;
  return items.filter(item =>
    deps.some(dep => item.crossPriorityDependency?.includes(dep))
  );
}

/**
 * Count launches per M0 priority
 */
export function countLaunchesPerM0(items: V0RoadmapItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    counts[item.priority] = (counts[item.priority] || 0) + 1;
  });
  return counts;
}
