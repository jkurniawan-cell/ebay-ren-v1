/**
 * Timeline By Priority Component
 * Roadmap grid grouped by Market with M0 Priority + M1 columns + quarters
 */

'use client';

import React from 'react';
import type { RoadmapData, QuarterLabel } from '@/types/roadmap';
import { LaunchCard } from './LaunchCard';
import { COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/constants';

interface TimelineByPriorityProps {
  data: RoadmapData;
  quarters: QuarterLabel[];
  selectedMarkets: string[];
}

export function TimelineByPriority({ data, quarters, selectedMarkets }: TimelineByPriorityProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

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

  // Handle column header click for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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

  // Group launches by market (target_geos_list)
  // For this view: Group by market -> M1 initiative (unique M1s only, combining all M0 priorities)
  // Structure: { market: { m1_name_normalized: { original_name, m0_priorities: Set<string>, launch_ids: Set, launches[] } } }
  const marketGroups: Record<string, Record<string, { original_name: string; m0_priorities: Set<string>; launch_ids: Set<string>; launches: any[] }>> = {};

  data.data.forEach((m0) => {
    m0.m1_initiatives.forEach((m1) => {
      m1.key_launches.forEach((launch) => {
        // Each launch can target multiple markets
        launch.target_geos_list.forEach((market) => {
          if (!marketGroups[market]) {
            marketGroups[market] = {};
          }

          // Normalize M1 name for grouping (trim whitespace, normalize case for key)
          const normalizedM1Name = m1.m1_name.trim();

          // Group by normalized M1 name (combine all M0 priorities under the same M1)
          if (!marketGroups[market][normalizedM1Name]) {
            marketGroups[market][normalizedM1Name] = {
              original_name: m1.m1_name.trim(), // Store original for display
              m0_priorities: new Set(),
              launch_ids: new Set(), // Track unique launches
              launches: []
            };
          }

          marketGroups[market][normalizedM1Name].m0_priorities.add(m0.m0_priority);

          // Only add launch if we haven't seen it before (deduplicate by launch name)
          const launchId = `${launch.key_launch_name}-${launch.updated_start_quarter}-${launch.updated_end_quarter}`;
          if (!marketGroups[market][normalizedM1Name].launch_ids.has(launchId)) {
            marketGroups[market][normalizedM1Name].launch_ids.add(launchId);
            marketGroups[market][normalizedM1Name].launches.push(launch);
          }
        });
      });
    });
  });

  // Filter markets based on selectedMarkets filter
  // If selectedMarkets is empty, show all markets; otherwise only show selected ones
  let marketsToShow = Object.keys(marketGroups);
  if (selectedMarkets.length > 0) {
    marketsToShow = marketsToShow.filter(market => selectedMarkets.includes(market));
  }

  // Sort markets alphabetically
  const sortedMarkets = marketsToShow.sort((a, b) => a.localeCompare(b));

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-full inline-block align-middle">
        {/* Timeline Table - Priorities by Market View */}
        <table className="min-w-full border-collapse bg-white shadow-sm">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-gray-300 bg-gradient-to-r from-gray-50 to-white">
              <th
                onClick={() => handleSort('m0')}
                className="px-2 py-1 text-sm font-bold text-white uppercase w-[150px] bg-gray-700 cursor-pointer hover:opacity-80"
              >
                <div className="flex items-center justify-center gap-1">
                  M0 Priority
                  {sortColumn === 'm0' && (
                    <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('m1')}
                className="px-2 py-1 text-xs font-semibold text-white uppercase w-[150px] cursor-pointer hover:opacity-80"
                style={{ backgroundColor: '#78909c' }}
              >
                <div className="flex items-center justify-center gap-1">
                  M1
                  {sortColumn === 'm1' && (
                    <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              {quarters.map((quarter) => (
                <th
                  key={quarter}
                  onClick={() => handleSort(quarter)}
                  className="px-1 py-1 text-xs font-semibold text-center text-white min-w-[90px] cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: '#3464f2' }}
                >
                  <div className="flex items-center justify-center gap-1">
                    {quarter}
                    {sortColumn === quarter && (
                      <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Market Groups */}
            {sortedMarkets.map((market) => {
              // First, group M1s by their M0 priority
              const priorityGroups: Record<string, Array<[string, typeof groupData]>> = {};

              // Apply sorting based on current column
              const sortedEntries = Object.entries(marketGroups[market]).sort(([m1A, dataA], [m1B, dataB]) => {
                if (!sortColumn) {
                  return m1A.localeCompare(m1B);
                }

                if (sortColumn === 'm0') {
                  const m0A = Array.from(dataA.m0_priorities).sort().join(', ');
                  const m0B = Array.from(dataB.m0_priorities).sort().join(', ');
                  return sortDirection === 'asc' ? m0A.localeCompare(m0B) : m0B.localeCompare(m0A);
                } else if (sortColumn === 'm1') {
                  return sortDirection === 'asc' ? m1A.localeCompare(m1B) : m1B.localeCompare(m1A);
                } else {
                  // Sort by number of launches in the quarter
                  const launchesA = dataA.launches.filter((launch) =>
                    isQuarterInLaunchSpan(sortColumn as QuarterLabel, launch.updated_start_quarter || '', launch.updated_end_quarter || '')
                  ).length;
                  const launchesB = dataB.launches.filter((launch) =>
                    isQuarterInLaunchSpan(sortColumn as QuarterLabel, launch.updated_start_quarter || '', launch.updated_end_quarter || '')
                  ).length;
                  return sortDirection === 'asc' ? launchesA - launchesB : launchesB - launchesA;
                }
              });

              sortedEntries.forEach(([normalizedM1Name, groupData]) => {
                const { m0_priorities } = groupData;
                const sortedM0Priorities = Array.from(m0_priorities).sort();
                const displayPriority = sortedM0Priorities.length === 1
                  ? sortedM0Priorities[0]
                  : sortedM0Priorities.join(', ');

                if (!priorityGroups[displayPriority]) {
                  priorityGroups[displayPriority] = [];
                }
                priorityGroups[displayPriority].push([normalizedM1Name, groupData]);
              });

              return (
                <React.Fragment key={market}>
                  {/* Market Header Row */}
                  <tr>
                    <td colSpan={2 + quarters.length} className="bg-gray-100 border-b border-gray-300 sticky z-10 py-4" style={{ top: '28px' }}>
                      <div className="flex items-center justify-center">
                        <div className="text-xl font-bold text-gray-900 bg-gray-200 px-8 py-3 rounded border-2 border-gray-700 flex items-center gap-3">
                          <span className="text-2xl">{COUNTRY_FLAGS[market] || ''}</span>
                          <span>{COUNTRY_NAMES[market] || market}</span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* M1 Rows within this Market */}
                  {Object.entries(priorityGroups).map(([displayPriority, m1Entries], priorityIndex) =>
                    m1Entries.map(([normalizedM1Name, groupData], indexInGroup) => {
                      const { original_name, launches } = groupData;
                      const isFirstInGroup = indexInGroup === 0;
                      const isLastInGroup = indexInGroup === m1Entries.length - 1;
                      const rowSpan = m1Entries.length;

                      return (
                        <tr
                          key={`${market}-${normalizedM1Name}`}
                          className={`hover:bg-blue-50/20 transition-colors ${isLastInGroup ? 'border-b border-gray-200' : ''}`}
                        >
                          {/* M0 Priority Name(s) - Column 1 - Only show on first row of group with rowspan */}
                          {isFirstInGroup && (
                            <td
                              rowSpan={rowSpan}
                              className="px-2 py-1 align-top bg-gray-700"
                            >
                              <div className="text-sm font-bold leading-tight text-white" style={{ lineHeight: '1.2' }}>
                                {displayPriority}
                              </div>
                            </td>
                          )}

                          {/* M1 Initiative Name - Column 2 */}
                          <td className="px-1.5 py-1 align-top" style={{ backgroundColor: '#78909c' }}>
                            <div className="text-xs font-normal leading-tight line-clamp-2 text-white" style={{ lineHeight: '1.2' }}>
                              {original_name}
                            </div>
                          </td>

                          {/* Quarter Columns */}
                          {quarters.map((quarter) => {
                            const launchesInQuarter = launches.filter(
                              (launch) =>
                                isQuarterInLaunchSpan(
                                  quarter,
                                  launch.updated_start_quarter || '',
                                  launch.updated_end_quarter || ''
                                )
                            );

                            return (
                              <td
                                key={quarter}
                                className="p-1 min-h-[50px] bg-white align-top"
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
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </React.Fragment>
              );
            })}

            {/* Empty State */}
            {sortedMarkets.length === 0 && (
              <tr>
                <td colSpan={2 + quarters.length} className="p-12 text-center text-gray-500 text-xs">
                  No roadmap data available. Upload a CSV to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
