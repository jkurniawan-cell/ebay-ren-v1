/**
 * Status Chart Component
 * Horizontal stacked bar showing breakdown by roadmap change status
 */

'use client';

import React from 'react';
import type { RoadmapData } from '@/types/roadmap';

interface StatusChartProps {
  data: RoadmapData;
}

export function StatusChart({ data }: StatusChartProps) {
  // Count launches by status
  const statusCounts = {
    'No Change': 0,
    'Accelerated': 0,
    'Deprioritized (beyond H2)': 0,
    'New': 0
  };

  data.data.forEach((m0) => {
    m0.m1_initiatives.forEach((m1) => {
      m1.key_launches.forEach((launch) => {
        const status = launch.roadmap_change;
        if (status === 'No Change') {
          statusCounts['No Change']++;
        } else if (status === 'Accelerated') {
          statusCounts['Accelerated']++;
        } else if (status === 'Deferred') {
          statusCounts['Deprioritized (beyond H2)']++;
        } else if (status === 'New') {
          statusCounts['New']++;
        }
      });
    });
  });

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  const statusColors = {
    'No Change': '#9CA3AF', // gray-400
    'Accelerated': '#10B981', // green-500
    'Deprioritized (beyond H2)': '#EF4444', // red-500
    'New': '#3B82F6' // blue-500
  };

  if (total === 0) {
    return (
      <div className="text-xs text-gray-400 italic">No launches to display</div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Title */}
      <h3 className="text-xs font-bold text-gray-900">Roadmap change</h3>

      {/* Stacked Bar */}
      <div className="relative h-6 bg-gray-100 rounded overflow-hidden flex">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = (count / total) * 100;
          if (percentage === 0) return null;

          return (
            <div
              key={status}
              className="flex items-center justify-center transition-all hover:opacity-80"
              style={{
                width: `${percentage}%`,
                backgroundColor: statusColors[status as keyof typeof statusColors]
              }}
              title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
            >
              {percentage > 8 && (
                <span className="text-xs font-medium text-white px-1 truncate">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend - Compact */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
            />
            <span className="text-xs text-gray-700">
              {status.split(' ')[0]}: <span className="font-medium">{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
