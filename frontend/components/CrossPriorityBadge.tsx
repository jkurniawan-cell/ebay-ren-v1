/**
 * Cross-Priority Dependency Badge Component
 * Shows colored circular badges for collaborating M0 priorities
 */

import React from 'react';

interface CrossPriorityBadgeProps {
  priority: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CrossPriorityBadge({ priority, color, size = 'sm' }: CrossPriorityBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: color,
        color: getTextColor(color)
      }}
      title={`Collaborating priority: ${priority}`}
    >
      {priority}
    </span>
  );
}
