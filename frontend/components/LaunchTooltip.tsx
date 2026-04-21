/**
 * Launch Tooltip Component
 * Displays detailed information on hover/click
 */

import React from 'react';
import type { KeyLaunch } from '@/types/roadmap';
import { COUNTRY_FLAGS } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface LaunchTooltipProps {
  launch: KeyLaunch;
}

export function LaunchTooltip({ launch }: LaunchTooltipProps) {
  return (
    <Card className="w-80 shadow-soft-lg rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm break-words leading-tight">{launch.key_launch_name}</CardTitle>
        <div className="flex gap-2 text-xs text-muted-foreground mt-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] break-words max-w-full rounded-lg">{launch.m0_priority_name}</Badge>
          <Badge variant="outline" className="text-[10px] break-words max-w-full rounded-lg">{launch.m1_initiative_name}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 overflow-hidden">
        {/* Timeline */}
        <div className="overflow-hidden">
          <div className="text-xs font-semibold mb-1.5">Timeline</div>
          <div className="text-xs break-words">
            {launch.shifted ? (
              <>
                <span className="line-through opacity-70 text-red-600 break-words">{launch.original_start_quarter} - {launch.original_end_quarter}</span>
                {' → '}
                <span className="font-semibold text-green-600 break-words">{launch.updated_start_quarter} - {launch.updated_end_quarter}</span>
              </>
            ) : (
              <span className="break-words">{launch.updated_start_quarter} - {launch.updated_end_quarter}</span>
            )}
          </div>
        </div>

        {/* Target Markets */}
        <div className="overflow-hidden">
          <div className="text-xs font-semibold mb-1.5">Target Markets</div>
          <div className="flex flex-wrap gap-1.5">
            {launch.target_geos_list.map((geo) => (
              <Badge key={geo} variant="secondary" className="text-[10px] break-words rounded-lg">
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
              <div className="text-xs font-semibold mb-1.5">Status</div>
              <Badge
                variant={launch.roadmap_change === 'Deferred' ? 'destructive' : 'default'}
                className="text-[10px] break-words rounded-lg"
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
              <div className="text-xs font-semibold mb-1.5">Change Rationale</div>
              <div className="text-xs bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 break-words whitespace-normal">{launch.change_rationale}</div>
            </div>
          </>
        )}

        {/* Change Rationale Comment (Free Text) */}
        {launch.change_rationale_comment && (
          <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200 overflow-hidden">
            <div className="text-[10px] font-semibold text-amber-900 mb-1">Comment:</div>
            <div className="text-xs text-amber-900 leading-relaxed break-words whitespace-normal">"{launch.change_rationale_comment}"</div>
          </div>
        )}

        {/* Cross-Priority Dependencies */}
        {launch.cross_priority_dependencies_list && launch.cross_priority_dependencies_list.length > 0 && (
          <>
            <Separator />
            <div className="overflow-hidden">
              <div className="text-xs font-semibold mb-1.5">Collaborations</div>
              <div className="flex flex-wrap gap-1.5">
                {launch.cross_priority_dependencies_list.map((dep) => (
                  <Badge key={dep} className="bg-purple-600 text-white text-[10px] break-words rounded-lg">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="text-[10px] text-muted-foreground break-words">
          {launch.geo_category}
        </div>
      </CardContent>
    </Card>
  );
}
