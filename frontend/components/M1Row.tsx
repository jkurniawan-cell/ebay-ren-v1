/**
 * M1Row Component
 * Individual M1 initiative row that navigates to timeline when clicked
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { M1Initiative } from './PillarSection';

interface M1RowProps {
  m1: M1Initiative;
  m0Name: string;
}

export function M1Row({ m1, m0Name }: M1RowProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to timeline with filters for this M0 and M1
    const params = new URLSearchParams();
    params.set('m0', m0Name);
    params.set('m1', m1.name);
    router.push(`/timeline?${params.toString()}`);
  };

  // Get status styling
  const getStatusStyle = () => {
    switch (m1.status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full px-3 py-2 bg-white rounded border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all text-left group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {m1.name}
            </h4>
          </div>
          {m1.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{m1.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Quarter Range */}
          {m1.start_quarter && m1.end_quarter && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {m1.start_quarter} → {m1.end_quarter}
            </span>
          )}

          {/* Launch Count */}
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            {m1.launch_count}
          </span>

          {/* Status Badge */}
          <span className={`text-xs px-2 py-0.5 rounded border ${getStatusStyle()}`}>
            {m1.status}
          </span>

          {/* Arrow Icon */}
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
