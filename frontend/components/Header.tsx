/**
 * Header Component
 * Dashboard title, timestamp, and export buttons
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  lastRefreshed?: Date;
  onExportCSV: () => void;
  onExportPNG: () => void;
  modeToggle?: React.ReactNode;
}

export function Header({
  lastRefreshed,
  onExportCSV,
  onExportPNG,
  modeToggle
}: HeaderProps) {
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between pt-2">
        {/* Left: Mode Toggle */}
        <div className="flex-1">
          {modeToggle}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold tracking-tight text-gray-700">
            Roadmap Intelligence Engine
          </h1>
          {lastRefreshed && (
            <p className="text-[10px] text-gray-500 mt-1 font-medium">
              Last Updated: {formatTimestamp(lastRefreshed)}
            </p>
          )}
        </div>

        {/* Right: Export Buttons */}
        <div className="flex-1 flex justify-end gap-2">
          <Button
            onClick={onExportCSV}
            variant="ghost"
            size="sm"
            className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            📊 CSV
          </Button>
          <Button
            onClick={onExportPNG}
            variant="ghost"
            size="sm"
            className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            🖼️ PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
