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

  // Calculate dynamic grid columns based on number of quarters - more compact
  const gridCols = `150px repeat(${quarters.length}, minmax(120px, 1fr))`;

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
    <div className="overflow-x-auto pb-4">
      <div className="min-w-full inline-block align-middle">
        {/* Legend - Compact */}
        <div className="mb-3 flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-gray-200">
          <span className="font-semibold text-gray-900 mr-2">Key:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-3 rounded" style={{ backgroundColor: '#22a3df53' }}></div>
            <span className="text-gray-700">Big 3</span>
          </div>
          <div className="flex items-center gap-1.5 ml-3">
            <div className="w-12 h-3 rounded" style={{ backgroundColor: '#FFE6C5' }}></div>
            <span className="text-gray-700">Remaining Big 4</span>
          </div>
          <div className="flex items-center gap-1.5 ml-3">
            <div className="w-12 h-3 rounded" style={{ backgroundColor: '#E8E8E8' }}></div>
            <span className="text-gray-700">Global</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-soft-md">
          {/* Header Row - Quarter Labels */}
          <div
            className="grid border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-white"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="px-3 py-2.5 text-sm font-normal text-white uppercase border-r-2 border-gray-300 tracking-wide" style={{ backgroundColor: '#78909c', letterSpacing: '0.02em' }}>
              M1 Plays
            </div>
            {quarters.map((quarter, idx) => {
              // Use consistent blue for all quarters
              const bgColor = '#3464f2';
              return (
                <div
                  key={quarter}
                  className="px-2 py-2.5 text-sm font-normal text-center text-white border-r-2 last:border-r-0 border-white/30 tracking-wide"
                  style={{ backgroundColor: bgColor, letterSpacing: '0.01em' }}
                >
                  {quarter}
                </div>
              );
            })}
          </div>

          {/* M0 Groups */}
          {data.data.map((m0, m0Idx) => (
            <div key={m0.m0_priority} className={`${m0Idx > 0 ? 'mt-8' : ''}`}>
              {/* M0 Priority Header */}
              <div
                className="grid relative overflow-hidden"
                style={{ gridTemplateColumns: gridCols }}
              >
                <div className="px-3 py-2.5 col-span-full text-center" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }}>
                  <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wide">
                    {m0.m0_priority}
                  </h3>
                  {m0.business_unit && (
                    <p className="text-[10px] text-gray-500 mt-1 font-normal">{m0.business_unit}</p>
                  )}
                </div>
              </div>

              {/* M1 Rows */}
              {m0.m1_initiatives.map((m1, idx) => (
                <div
                  key={`${m0.m0_priority}-${m1.m1_name}-${idx}`}
                  className="grid hover:bg-blue-50/20 transition-colors"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* M1 Name - Left Column */}
                  <div className="relative px-2.5 py-3 flex items-start" style={{
                    backgroundColor: '#78909c',
                    borderRight: '1px solid #e0e0e0'
                  }}>
                    <div className="text-xs font-normal leading-tight line-clamp-3 overflow-hidden pt-1 text-white" style={{ lineHeight: '1.3' }}>
                      {m1.m1_name}
                    </div>
                  </div>

                  {/* Quarter Columns */}
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
                        className="p-2 min-h-[80px] bg-white relative"
                        style={{
                          borderRight: '1px solid #e5e7eb'
                        }}
                      >
                        <div className="space-y-2">
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
