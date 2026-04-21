/**
 * CompactPillarSection Component
 * Collapsible pillar showing M0 priorities with their M1 initiatives
 */

'use client';

import React, { useState } from 'react';
import { CompactM0Section } from './CompactM0Section';
import { M0Priority } from './PillarSection';

interface CompactPillarSectionProps {
  name: string;
  description: string;
  color: string;
  borderColor: string;
  m0Priorities: M0Priority[];
}

export function CompactPillarSection({
  name,
  description,
  color,
  borderColor,
  m0Priorities
}: CompactPillarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`border-l-4 ${borderColor} bg-white rounded-lg shadow-sm mb-3 overflow-hidden`}>
      {/* Pillar Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left">
          <h2 className={`text-lg font-bold ${color}`}>{name}</h2>
          <p className={`text-xs ${color} opacity-70 mt-0.5 italic`}>{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">
            {m0Priorities.length} {m0Priorities.length === 1 ? 'priority' : 'priorities'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* M0 Sections */}
      {isExpanded && m0Priorities.length > 0 && (
        <div className="border-t border-gray-100">
          {m0Priorities.map((m0, index) => (
            <CompactM0Section
              key={m0.name}
              m0={m0}
              isLast={index === m0Priorities.length - 1}
            />
          ))}
        </div>
      )}

      {isExpanded && m0Priorities.length === 0 && (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          No priorities in this pillar
        </div>
      )}
    </div>
  );
}
