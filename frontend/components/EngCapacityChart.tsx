/**
 * Eng Capacity Chart Component
 * Shows M0 priorities blocked due to engineering capacity
 */

'use client';

import React from 'react';
import type { RoadmapData } from '@/types/roadmap';

interface EngCapacityChartProps {
  data: RoadmapData;
}

export function EngCapacityChart({ data }: EngCapacityChartProps) {
  // Count launches by M0 priority that are blocked due to eng capacity
  const m0EngCapacityCounts: Record<string, number> = {};

  data.data.forEach((m0) => {
    m0.m1_initiatives.forEach((m1) => {
      m1.key_launches.forEach((launch) => {
        const rationale = launch.change_rationale || '';
        // Check if rationale contains "blocked due to eng capacity" (case insensitive)
        if (rationale.toLowerCase().includes('blocked due to eng capacity')) {
          const m0Name = m0.m0_priority;
          m0EngCapacityCounts[m0Name] = (m0EngCapacityCounts[m0Name] || 0) + 1;
        }
      });
    });
  });

  // Sort by count descending
  const sortedM0s = Object.entries(m0EngCapacityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Top 3 M0s

  const maxCount = Math.max(...sortedM0s.map(([, count]) => count), 1);

  const colors = ['#EF4444', '#F59E0B', '#EC4899']; // Red, Orange, Pink

  if (sortedM0s.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic">No eng capacity blocks</div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900">Eng Capacity Blocks</h3>

      {/* Horizontal Bars - Top 3 only */}
      <div className="space-y-1">
        {sortedM0s.map(([m0Name, count], index) => {
          const percentage = (count / maxCount) * 100;
          const displayName = m0Name.length > 25 ? m0Name.substring(0, 25) + '...' : m0Name;

          return (
            <div key={m0Name} className="flex items-center gap-2">
              {/* Label */}
              <div className="w-28 text-xs text-gray-700 truncate" title={m0Name}>
                {displayName}
              </div>

              {/* Bar */}
              <div className="flex-1 relative h-5 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full flex items-center px-2 transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                >
                  <span className="text-xs font-medium text-white">{count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
