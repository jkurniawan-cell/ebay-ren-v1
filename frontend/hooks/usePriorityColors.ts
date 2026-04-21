/**
 * Hook to auto-assign colors to M0 priorities for badges
 */

import { useMemo } from 'react';

const PRIORITY_COLORS = [
  '#A855F7', // Purple
  '#10B981', // Green
  '#14B8A6', // Teal
  '#F59E0B', // Yellow/Amber
  '#EC4899', // Pink
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#6366F1', // Indigo
];

export function usePriorityColors(priorities: string[]) {
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    priorities.forEach((priority, index) => {
      map[priority] = PRIORITY_COLORS[index % PRIORITY_COLORS.length];
    });
    return map;
  }, [priorities]);

  const getColor = (priority: string): string => {
    return colorMap[priority] || PRIORITY_COLORS[0];
  };

  const getTextColor = (backgroundColor: string): string => {
    // Simple contrast calculation - use white text for dark backgrounds
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return { getColor, getTextColor, colorMap };
}
