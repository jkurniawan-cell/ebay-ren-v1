/**
 * CompactM0Section Component
 * Collapsible M0 priority showing M1 initiative rows
 */

'use client';

import React, { useState } from 'react';
import { M0Priority } from './PillarSection';
import { M1Row } from './M1Row';

interface CompactM0SectionProps {
  m0: M0Priority;
  isLast: boolean;
}

export function CompactM0Section({ m0, isLast }: CompactM0SectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`${!isLast ? 'border-b border-gray-100' : ''}`}>
      {/* M0 Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div className={`w-1 h-6 ${isExpanded ? 'bg-blue-500' : 'bg-gray-300'} rounded-full transition-colors`} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{m0.name}</h3>
            {m0.business_unit && (
              <p className="text-xs text-gray-500 mt-0.5">{m0.business_unit}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {m0.m1_initiatives.length} {m0.m1_initiatives.length === 1 ? 'initiative' : 'initiatives'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* M1 Rows */}
      {isExpanded && (
        <div className="bg-gray-50 px-4 py-2">
          <div className="space-y-1">
            {m0.m1_initiatives.map((m1, index) => (
              <M1Row
                key={index}
                m1={m1}
                m0Name={m0.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
