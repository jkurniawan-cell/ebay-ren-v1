/**
 * Change Log Table Component
 * Table showing all launches with changes
 */

'use client';

import React from 'react';
import type { RoadmapData } from '@/types/roadmap';
import { COUNTRY_FLAGS } from '@/lib/constants';

interface ChangeLogTableProps {
  data: RoadmapData;
}

export function ChangeLogTable({ data }: ChangeLogTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Flatten all launches with changes
  const changedLaunches: Array<{
    priority: string;
    market: string;
    keyLaunch: string;
    changeType: string;
    rationale: string;
    oldQuarter: string;
    newQuarter: string;
    comments: string;
  }> = [];

  data.data.forEach((m0) => {
    m0.m1_initiatives.forEach((m1) => {
      m1.key_launches.forEach((launch) => {
        // Only include launches with changes
        if (launch.roadmap_change !== 'No Change') {
          changedLaunches.push({
            priority: m0.m0_priority,
            market: launch.target_geos_list.map(geo => COUNTRY_FLAGS[geo] || geo).join(', '),
            keyLaunch: launch.key_launch_name,
            changeType: launch.roadmap_change,
            rationale: launch.change_rationale || 'N/A',
            oldQuarter: `${launch.original_start_quarter} - ${launch.original_end_quarter}`,
            newQuarter: `${launch.updated_start_quarter} - ${launch.updated_end_quarter}`,
            comments: launch.change_rationale_comment || ''
          });
        }
      });
    });
  });

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort the data
  const sortedLaunches = [...changedLaunches].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof typeof a] || '';
    const bValue = b[sortColumn as keyof typeof b] || '';

    const comparison = aValue.toString().localeCompare(bValue.toString());
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'Accelerated':
        return 'bg-green-100 text-green-800';
      case 'Deferred':
        return 'bg-red-100 text-red-800';
      case 'New':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          <span className="text-gray-500">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  if (changedLaunches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">No changes to display</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full">
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <SortableHeader column="priority" label="Priority" />
                <SortableHeader column="market" label="Market" />
                <SortableHeader column="keyLaunch" label="Key Launch" />
                <SortableHeader column="changeType" label="Roadmap Change" />
                <SortableHeader column="rationale" label="Change Rationale" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-44">
                  Timeline Shift
                </th>
                <SortableHeader column="comments" label="Comments" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedLaunches.map((row, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                    {row.market}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900 font-medium">
                    {row.keyLaunch}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-md ${getChangeTypeColor(row.changeType)}`}>
                      {row.changeType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 leading-relaxed">
                    {row.rationale}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-[9px]">From:</span>
                        <span className="text-red-600 line-through">{row.oldQuarter}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-[9px]">To:</span>
                        <span className="text-green-600 font-medium">{row.newQuarter}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 leading-relaxed">
                    {row.comments || <span className="text-gray-400 italic">None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
