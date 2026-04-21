/**
 * Mode Toggle Component
 * Switch between Upcoming (Draft) and Approved (Locked) views
 */

'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModeToggleProps {
  mode: 'upcoming' | 'approved';
  onModeChange: (mode: 'upcoming' | 'approved') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
      <button
        onClick={() => onModeChange('upcoming')}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
          mode === 'upcoming'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Live
      </button>
      <button
        onClick={() => onModeChange('approved')}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
          mode === 'approved'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        History
      </button>
    </div>
  );
}
