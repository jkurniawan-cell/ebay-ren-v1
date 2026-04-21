/**
 * M0Card Component
 * Collapsible card showing an M0 priority with expandable quarterly M1 summary
 */

'use client';

import React, { useState } from 'react';
import { M0Priority, M1Initiative } from './PillarSection';
import { QuarterlyTrack } from './QuarterlyTrack';

interface M0CardProps {
  m0: M0Priority;
  pillarColor: string;
}

export function M0Card({ m0, pillarColor }: M0CardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalLaunches = m0.m1_initiatives.reduce((sum, m1) => sum + m1.launch_count, 0);
  const m1Count = m0.m1_initiatives.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Card Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-base ${pillarColor} mb-1`}>{m0.name}</h3>
            {m0.business_unit && (
              <p className="text-xs text-gray-500 mb-2">{m0.business_unit}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>{m1Count} {m1Count === 1 ? 'initiative' : 'initiatives'}</span>
              <span className="text-gray-300">•</span>
              <span>{totalLaunches} {totalLaunches === 1 ? 'launch' : 'launches'}</span>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div className={`ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded Content - Quarterly Track */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <QuarterlyTrack m1Initiatives={m0.m1_initiatives} m0Name={m0.name} />
        </div>
      )}
    </div>
  );
}
