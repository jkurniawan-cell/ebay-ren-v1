/**
 * Launch Modal Component
 * Clickable modal displaying detailed launch information with scrollable content
 */

'use client';

import React, { useEffect } from 'react';
import type { KeyLaunch } from '@/types/roadmap';
import { COUNTRY_FLAGS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface LaunchModalProps {
  launch: KeyLaunch;
  isOpen: boolean;
  onClose: () => void;
}

export function LaunchModal({ launch, isOpen, onClose }: LaunchModalProps) {
  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 animate-in fade-in-0 duration-300">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[85vw] md:max-w-lg max-h-[85vh] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-110"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[85vh] p-4 md:p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-base md:text-lg font-semibold break-words leading-tight text-gray-900 pr-8">
              {launch.key_launch_name}
            </h2>
            <div className="flex gap-2 text-xs text-gray-600 mt-3 flex-wrap">
              <Badge variant="outline" className="text-xs break-words max-w-full rounded-lg">
                {launch.m0_priority_name}
              </Badge>
              <Badge variant="outline" className="text-xs break-words max-w-full rounded-lg">
                {launch.m1_initiative_name}
              </Badge>
            </div>
          </div>

          <div className="space-y-5">
            {/* Timeline */}
            <div className="overflow-hidden">
              <div className="text-sm font-semibold mb-2 text-gray-800">Timeline</div>
              <div className="text-sm text-gray-700 break-words leading-relaxed">
                {launch.shifted ? (
                  <>
                    <span className="line-through opacity-70 text-red-500 break-words">
                      {launch.original_start_quarter} - {launch.original_end_quarter}
                    </span>
                    {' → '}
                    <span className="font-semibold text-green-600 break-words">
                      {launch.updated_start_quarter} - {launch.updated_end_quarter}
                    </span>
                  </>
                ) : (
                  <span className="break-words">
                    {launch.updated_start_quarter} - {launch.updated_end_quarter}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Target Markets */}
            <div className="overflow-hidden">
              <div className="text-sm font-semibold mb-2 text-gray-800">Target Markets</div>
              <div className="flex flex-wrap gap-2">
                {launch.target_geos_list.map((geo) => (
                  <Badge key={geo} variant="secondary" className="text-sm break-words rounded-lg px-3 py-1">
                    {COUNTRY_FLAGS[geo] || ''} {geo}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Roadmap Change */}
            {launch.roadmap_change && launch.roadmap_change !== 'No Change' && (
              <>
                <Separator />
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold mb-2 text-gray-800">Status</div>
                  <Badge
                    variant={launch.roadmap_change === 'Deferred' ? 'destructive' : 'default'}
                    className="text-sm break-words rounded-lg px-3 py-1"
                  >
                    {launch.roadmap_change}
                  </Badge>
                </div>
              </>
            )}

            {/* Change Rationale (Dropdown Selection) */}
            {launch.change_rationale && (
              <>
                <Separator />
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold mb-2 text-gray-800">Change Rationale</div>
                  <div className="text-sm bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 break-words whitespace-normal">
                    {launch.change_rationale}
                  </div>
                </div>
              </>
            )}

            {/* Change Rationale Comment (Free Text) */}
            {launch.change_rationale_comment && (
              <>
                <Separator />
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 overflow-hidden">
                  <div className="text-sm font-semibold text-amber-900 mb-2">Comment:</div>
                  <div className="text-sm text-amber-900 leading-relaxed break-words whitespace-normal">
                    "{launch.change_rationale_comment}"
                  </div>
                </div>
              </>
            )}

            {/* Cross-Priority Dependencies */}
            {launch.cross_priority_dependencies_list && launch.cross_priority_dependencies_list.length > 0 && (
              <>
                <Separator />
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold mb-2 text-gray-800">Collaborations</div>
                  <div className="flex flex-wrap gap-2">
                    {launch.cross_priority_dependencies_list.map((dep) => (
                      <Badge key={dep} className="bg-purple-600 text-white text-sm break-words rounded-lg px-3 py-1">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Geo Category */}
            <div className="text-sm text-gray-600 break-words">
              Geo Category: <span className="font-medium">{launch.geo_category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
