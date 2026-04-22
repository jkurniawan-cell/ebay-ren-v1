/**
 * Timeline Component
 * Main roadmap grid visualization with quarters as columns and M1 initiatives as rows
 */

'use client';

import React from 'react';
import type { RoadmapData, QuarterLabel } from '@/types/roadmap';
import { LaunchCard } from './LaunchCard';

interface TimelineProps {
  data: RoadmapData;
  quarters: QuarterLabel[];
}

export function Timeline({ data, quarters }: TimelineProps) {
  // Get all unique priorities for color mapping
  const allPriorities = Array.from(
    new Set(
      data.data.flatMap((m0) =>
        m0.m1_initiatives.flatMap((m1) =>
          m1.key_launches.flatMap((launch) =>
            [launch.m0_priority_name, ...launch.cross_priority_dependencies_list]
          )
        )
      )
    )
  );

  // Calculate dynamic grid columns based on number of quarters - ultra compact
  const gridCols = `200px repeat(${quarters.length}, minmax(90px, 1fr))`;

  // Helper function to check if a quarter is within a launch's timespan
  const isQuarterInLaunchSpan = (quarter: QuarterLabel, startQuarter: string, endQuarter: string): boolean => {
    if (!startQuarter || !endQuarter) return false;

    const quarterIndex = quarters.indexOf(quarter);
    const startIndex = quarters.indexOf(startQuarter as QuarterLabel);
    const endIndex = quarters.indexOf(endQuarter as QuarterLabel);

    // If indices are invalid, return false
    if (quarterIndex === -1 || startIndex === -1 || endIndex === -1) {
      return false;
    }

    // Handle both normal ranges and reversed ranges (when start > end in data)
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    return quarterIndex >= minIndex && quarterIndex <= maxIndex;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-full inline-block align-middle">
        {/* Timeline Grid - No Legend, Max Compact */}
        <div className="rounded overflow-hidden bg-white shadow-sm">
          {/* Header Row - Quarter Labels */}
          <div
            className="grid border-b border-gray-300 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-20"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="px-2 py-1 text-xs font-semibold text-white uppercase border-r border-gray-300" style={{ backgroundColor: '#78909c' }}>
              M1
            </div>
            {quarters.map((quarter) => {
              return (
                <div
                  key={quarter}
                  className="px-1 py-1 text-xs font-semibold text-center text-white border-r last:border-r-0 border-white/30"
                  style={{ backgroundColor: '#3464f2' }}
                >
                  {quarter}
                </div>
              );
            })}
          </div>

          {/* M0 Groups - Ultra Compact */}
          {data.data.map((m0, m0Idx) => (
            <div key={m0.m0_priority} className="border-b border-gray-200">
              {/* M0 Header - Minimal */}
              <div
                className="bg-gray-100 border-b border-gray-200 sticky z-10 flex items-center justify-center py-1.5"
                style={{ top: '20px' }}
              >
                <div className="text-xs font-semibold text-gray-900 bg-gray-200 px-4 py-0.5 rounded">
                  {m0.m0_priority}
                </div>
              </div>

              {/* M1 Rows - Compressed */}
              {m0.m1_initiatives.map((m1, idx) => (
                <div
                  key={`${m0.m0_priority}-${m1.m1_name}-${idx}`}
                  className="grid hover:bg-blue-50/20 transition-colors"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* M1 Name - Minimal */}
                  <div className="px-1.5 py-1 flex items-start border-r border-gray-300" style={{ backgroundColor: '#78909c' }}>
                    <div className="text-xs font-normal leading-tight line-clamp-2 text-white" style={{ lineHeight: '1.2' }}>
                      {m1.m1_name}
                    </div>
                  </div>

                  {/* Quarter Columns - Compact */}
                  {quarters.map((quarter) => {
                    const launchesInQuarter = m1.key_launches.filter(
                      (launch) =>
                        isQuarterInLaunchSpan(
                          quarter,
                          launch.updated_start_quarter || '',
                          launch.updated_end_quarter || ''
                        )
                    );

                    return (
                      <div
                        key={quarter}
                        className="p-1 min-h-[50px] bg-white border-r last:border-r-0 border-gray-200"
                      >
                        <div className="space-y-1">
                          {launchesInQuarter.map((launch, launchIdx) => (
                            <LaunchCard
                              key={`${launch.key_launch_name}-${launchIdx}`}
                              launch={launch}
                              allPriorities={allPriorities}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {/* Empty State */}
          {data.data.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-xs">
              No roadmap data available. Upload a CSV to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
