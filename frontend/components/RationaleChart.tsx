/**
 * Rationale Chart Component
 * Horizontal bars showing breakdown by change rationale
 */

'use client';

import React from 'react';
import type { RoadmapData } from '@/types/roadmap';

interface RationaleChartProps {
  data: RoadmapData;
}

export function RationaleChart({ data }: RationaleChartProps) {
  // Count launches by rationale
  const rationaleCounts: Record<string, number> = {};

  data.data.forEach((m0) => {
    m0.m1_initiatives.forEach((m1) => {
      m1.key_launches.forEach((launch) => {
        const rationale = launch.change_rationale || '';
        // Skip N/A and empty rationales
        if (rationale && rationale.trim() !== '' && rationale.toUpperCase() !== 'N/A') {
          rationaleCounts[rationale] = (rationaleCounts[rationale] || 0) + 1;
        }
      });
    });
  });

  // Sort by count descending
  const sortedRationales = Object.entries(rationaleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 rationales

  const maxCount = Math.max(...sortedRationales.map(([, count]) => count), 1);

  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  if (sortedRationales.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic">No rationales to display</div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Title */}
      <h3 className="text-xs font-bold text-gray-900">Change Rationale</h3>

      {/* Horizontal Bars - Top 3 only */}
      <div className="space-y-1">
        {sortedRationales.slice(0, 3).map(([rationale, count], index) => {
          const percentage = (count / maxCount) * 100;
          const displayName = rationale.length > 30 ? rationale.substring(0, 30) + '...' : rationale;

          return (
            <div key={rationale} className="flex items-center gap-2">
              {/* Label */}
              <div className="w-32 text-xs text-gray-700 truncate" title={rationale}>
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
