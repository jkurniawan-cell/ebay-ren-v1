/**
 * Launch Card Component
 * Individual key launch card with badges, tooltips, and visual treatments
 */

'use client';

import React, { useState } from 'react';
import type { KeyLaunch } from '@/types/roadmap';
import { CrossPriorityBadge } from './CrossPriorityBadge';
import { LaunchModal } from './LaunchModal';
import { LaunchTooltip } from './LaunchTooltip';
import { GEO_COLORS, STATUS_COLORS, COUNTRY_FLAGS } from '@/lib/constants';
import { usePriorityColors } from '@/hooks/usePriorityColors';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface LaunchCardProps {
  launch: KeyLaunch;
  allPriorities: string[];
}

export function LaunchCard({ launch, allPriorities }: LaunchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { getColor } = usePriorityColors(allPriorities);

  const geoColor = GEO_COLORS[launch.geo_category] || GEO_COLORS.Global;

  const statusColor = launch.roadmap_change !== 'No Change'
    ? STATUS_COLORS[launch.roadmap_change]
    : undefined;

  // Determine border styling based on status
  const isDeferred = launch.roadmap_change === 'Deferred';
  const borderWidth = isDeferred ? '4px' : '0px';
  const borderColor = isDeferred ? '#FF5757' : geoColor;

  return (
    <div className="relative group">
      <div
        className="rounded p-1.5 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:z-10 transition-all duration-100 flex flex-col text-left"
        style={{
          backgroundColor: geoColor,
          borderColor: borderColor,
          borderWidth: borderWidth || '0px',
          borderStyle: 'solid',
          boxShadow: borderWidth === '3px' ? `0 0 0 ${borderWidth} ${borderColor}, 0 2px 8px rgba(0,0,0,0.06)` : '0 2px 8px rgba(0,0,0,0.06)',
          minHeight: '40px'
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Cross-Priority Badges */}
        {launch.cross_priority_dependencies_list && launch.cross_priority_dependencies_list.length > 0 && (
          <div className="flex gap-0.5 mb-0.5 flex-wrap">
            {launch.cross_priority_dependencies_list.slice(0, 1).map((dep) => (
              <span
                key={dep}
                className="px-1 py-0.5 bg-purple-600 text-white rounded text-[9px] font-semibold truncate max-w-[50px]"
                title={dep}
              >
                {dep}
              </span>
            ))}
            {launch.cross_priority_dependencies_list.length > 1 && (
              <span className="px-1 py-0.5 bg-purple-400 text-white rounded text-[9px] font-semibold">
                +{launch.cross_priority_dependencies_list.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Launch Name */}
        <div
          className="font-normal text-xs leading-tight mb-0.5 overflow-hidden text-gray-900"
          style={{
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}
          title={launch.key_launch_name}
        >
          {launch.key_launch_name}
        </div>

        {/* Country Flags */}
        <div className="flex gap-0.5 items-center flex-wrap mt-auto">
          {launch.target_geos_list.slice(0, 3).map((geo) => (
            <span key={geo} className="text-[10px] opacity-90" title={geo}>
              {COUNTRY_FLAGS[geo] || geo}
            </span>
          ))}
          {launch.target_geos_list.length > 3 && (
            <span className="text-[9px] text-gray-600" title={launch.target_geos_list.join(', ')}>
              +{launch.target_geos_list.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && !isModalOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <LaunchTooltip launch={launch} />
        </div>
      )}

      {/* Click Modal */}
      <LaunchModal launch={launch} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
