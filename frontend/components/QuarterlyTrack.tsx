/**
 * QuarterlyTrack Component
 * Shows M1 initiatives in a quarterly timeline format (similar to second reference image)
 */

'use client';

import React from 'react';
import { M1Initiative } from './PillarSection';

interface QuarterlyTrackProps {
  m1Initiatives: M1Initiative[];
  m0Name: string;
}

export function QuarterlyTrack({ m1Initiatives, m0Name }: QuarterlyTrackProps) {
  // Sort initiatives by start quarter
  const sortedInitiatives = [...m1Initiatives].sort((a, b) => {
    if (!a.start_quarter || !b.start_quarter) return 0;
    return a.start_quarter.localeCompare(b.start_quarter);
  });

  // Get status badge color
  const getStatusColor = (status: M1Initiative['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planned':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: M1Initiative['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'In Progress':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" className="opacity-30" />
            <circle cx="10" cy="10" r="3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" className="opacity-20" />
          </svg>
        );
    }
  };

  if (sortedInitiatives.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-4">
        No initiatives found for {m0Name}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Initiative Roadmap
      </h4>

      {sortedInitiatives.map((m1, index) => (
        <div key={index} className="relative pl-8 pb-4 last:pb-0">
          {/* Timeline Line */}
          {index < sortedInitiatives.length - 1 && (
            <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-gray-200" />
          )}

          {/* Timeline Dot */}
          <div className="absolute left-0 top-1 flex items-center justify-center">
            {getStatusIcon(m1.status)}
          </div>

          {/* Initiative Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-sm text-gray-900">{m1.name}</h5>
                </div>
                {m1.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{m1.description}</p>
                )}
              </div>

              {/* Status Badge */}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getStatusColor(m1.status)} whitespace-nowrap`}>
                {m1.status}
              </span>
            </div>

            {/* Quarter and Launch Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {m1.start_quarter && m1.end_quarter && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {m1.start_quarter} → {m1.end_quarter}
                </span>
              )}
              <span className="text-gray-300">•</span>
              <span>{m1.launch_count} {m1.launch_count === 1 ? 'launch' : 'launches'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
