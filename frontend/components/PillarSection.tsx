/**
 * PillarSection Component
 * Displays a pillar (Strategic, Horizontal Innovation, Platform Priorities, Platform Essentials)
 * with its M0 priorities as cards
 */

import React from 'react';
import { M0Card } from './M0Card';

export interface M0Priority {
  name: string;
  business_unit: string;
  pillar: string;
  m1_initiatives: M1Initiative[];
}

export interface M1Initiative {
  name: string;
  description: string;
  start_quarter: string;
  end_quarter: string;
  quarters: string[];
  launch_count: number;
  status: 'Completed' | 'In Progress' | 'Planned';
}

interface PillarSectionProps {
  name: string;
  description: string;
  color: string;
  backgroundColor: string;
  m0Priorities: M0Priority[];
}

export function PillarSection({ name, description, color, backgroundColor, m0Priorities }: PillarSectionProps) {
  return (
    <div className="mb-8">
      {/* Pillar Header */}
      <div className={`${backgroundColor} rounded-xl p-6 mb-4`}>
        <h2 className={`text-2xl font-bold ${color} mb-2`}>{name}</h2>
        <p className={`text-sm ${color} opacity-80 italic`}>{description}</p>
      </div>

      {/* M0 Priority Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {m0Priorities.map((m0) => (
          <M0Card key={m0.name} m0={m0} pillarColor={color} />
        ))}
      </div>
    </div>
  );
}
