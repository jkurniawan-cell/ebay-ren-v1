/**
 * Filter Bar Component
 * Multi-select dropdowns for filtering roadmap data
 */

'use client';

import React from 'react';
import { MARKETS, ROADMAP_CHANGES, COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/constants';

interface FilterBarProps {
  m0Priorities: string[];
  availableDeliveryOwners: string[];
  availableBeneficiaries: string[];
  availableMarkets: string[];
  availableRoadmapChanges: string[];
  selectedM0s: string[];
  selectedMarkets: string[];
  selectedRoadmapChanges: string[];
  selectedDeliveryOwners: string[];
  selectedBeneficiaries: string[];
  onM0Change: (selected: string[]) => void;
  onMarketChange: (selected: string[]) => void;
  onRoadmapChangeChange: (selected: string[]) => void;
  onDeliveryOwnerChange: (selected: string[]) => void;
  onBeneficiaryChange: (selected: string[]) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  mode: 'upcoming' | 'approved';
  selectedHistoryCycle?: string;
  availableCycles?: string[];
  onHistoryCycleChange?: (cycle: string) => void;
  uploadComponent?: React.ReactNode;
}

export function FilterBar({
  m0Priorities,
  availableDeliveryOwners,
  availableBeneficiaries,
  availableMarkets,
  availableRoadmapChanges,
  selectedM0s,
  selectedMarkets,
  selectedRoadmapChanges,
  selectedDeliveryOwners,
  selectedBeneficiaries,
  onM0Change,
  onMarketChange,
  onRoadmapChangeChange,
  onDeliveryOwnerChange,
  onBeneficiaryChange,
  onReset,
  onRefresh,
  isRefreshing,
  mode,
  selectedHistoryCycle,
  availableCycles,
  onHistoryCycleChange,
  uploadComponent
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const handleMultiSelectChange = (
    value: string,
    currentSelection: string[],
    onChange: (selected: string[]) => void
  ) => {
    if (currentSelection.includes(value)) {
      onChange(currentSelection.filter((item) => item !== value));
    } else {
      onChange([...currentSelection, value]);
    }
  };

  const MultiSelectDropdown = ({
    label,
    options,
    selected,
    onChange,
    placeholder,
    showFlags = false,
    tooltip
  }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    showFlags?: boolean;
    tooltip?: string;
  }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const getDisplayName = (option: string) => {
      if (showFlags && COUNTRY_FLAGS[option]) {
        return `${COUNTRY_FLAGS[option]} ${COUNTRY_NAMES[option] || option}`;
      }
      return option;
    };

    return (
      <div className="relative">
        <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
          {label}
          {tooltip && (
            <span
              className="text-gray-400 cursor-help text-[10px]"
              title={tooltip}
            >
              ⓘ
            </span>
          )}
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-sm text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between"
        >
          <span>
            {selected.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : selected.length === options.length ? (
              <span className="text-gray-900">All ({options.length})</span>
            ) : (
              <span className="text-blue-600 font-medium">
                {selected.length} selected
              </span>
            )}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-200">
                <button
                  onClick={() => {
                    if (selected.length === options.length) {
                      onChange([]);
                    } else {
                      onChange(options);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded font-medium text-blue-600 transition-colors"
                >
                  {selected.length === options.length ? '✓ Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="py-1">
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => handleMultiSelectChange(option, selected, onChange)}
                      className="mr-3 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{getDisplayName(option)}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const hasActiveFilters =
    selectedM0s.length > 0 ||
    selectedMarkets.length > 0 ||
    selectedRoadmapChanges.length > 0 ||
    selectedDeliveryOwners.length > 0 ||
    selectedBeneficiaries.length > 0;

  return (
    <div>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-base font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Filters
          </button>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded">
              {[selectedM0s, selectedMarkets, selectedRoadmapChanges, selectedDeliveryOwners, selectedBeneficiaries]
                .filter(arr => arr.length > 0).length} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Planning Cycle Dropdown (History mode) */}
          {mode === 'approved' && availableCycles && availableCycles.length > 0 && onHistoryCycleChange && (
            <select
              value={selectedHistoryCycle}
              onChange={(e) => onHistoryCycleChange(e.target.value)}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableCycles.map(cycle => (
                <option key={cycle} value={cycle}>{cycle}</option>
              ))}
            </select>
          )}

          {/* Upload CSV (Live mode) */}
          {uploadComponent}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Content - Collapsible */}
      {isExpanded && (
        <div className="grid grid-cols-3 gap-8 pt-2">
          {/* M0 Priority Filter */}
          <MultiSelectDropdown
            label="M0 Priority"
            options={m0Priorities}
            selected={selectedM0s}
            onChange={onM0Change}
            placeholder="All priorities"
          />

          {/* Market/Geo Filter */}
          <MultiSelectDropdown
            label="Country/Market"
            options={availableMarkets}
            selected={selectedMarkets}
            onChange={onMarketChange}
            placeholder="All countries"
            showFlags={true}
            tooltip="Filter by target countries/markets for each launch"
          />

          {/* Roadmap Change Filter */}
          <MultiSelectDropdown
            label="Roadmap Change"
            options={availableRoadmapChanges}
            selected={selectedRoadmapChanges}
            onChange={onRoadmapChangeChange}
            placeholder="All changes"
          />
        </div>
      )}
    </div>
  );
}
