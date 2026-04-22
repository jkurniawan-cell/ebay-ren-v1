/**
 * Main Dashboard Page
 * eBay REN (Roadmap Intelligence Engine)
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ModeToggle } from '@/components/ModeToggle';
import { FilterBar } from '@/components/FilterBar';
import { Timeline } from '@/components/Timeline';
import { CSVUpload } from '@/components/CSVUpload';
import { ApproveButton } from '@/components/ApproveButton';
import { StatusChart } from '@/components/StatusChart';
import { RationaleChart } from '@/components/RationaleChart';
import { EngCapacityChart } from '@/components/EngCapacityChart';
import { ChangeLogTable } from '@/components/ChangeLogTable';
import { TimelineByPriority } from '@/components/TimelineByPriority';
import { apiClient } from '@/lib/api';
import type { RoadmapData, QuarterLabel } from '@/types/roadmap';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';

function DashboardContent() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'upcoming' | 'approved'>('upcoming');
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [m0Priorities, setM0Priorities] = useState<string[]>([]);
  const [availableDeliveryOwners, setAvailableDeliveryOwners] = useState<string[]>([]);
  const [availableBeneficiaries, setAvailableBeneficiaries] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [availableRoadmapChanges, setAvailableRoadmapChanges] = useState<string[]>([]);
  const [quarters, setQuarters] = useState<QuarterLabel[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [timelineRef, setTimelineRef] = useState<HTMLDivElement | null>(null);

  // History mode state
  const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<string>('Q2 refresh 2026');
  const [availableCycles, setAvailableCycles] = useState<string[]>([]);

  // Filter state - initialize from URL params if present
  const [selectedM0s, setSelectedM0s] = useState<string[]>(() => {
    const m0 = searchParams.get('m0');
    return m0 ? [m0] : [];
  });
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedRoadmapChanges, setSelectedRoadmapChanges] = useState<string[]>([]);
  const [selectedDeliveryOwners, setSelectedDeliveryOwners] = useState<string[]>([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

  // Page toggle state
  const [activeView, setActiveView] = useState<'roadmap' | 'changelog' | 'by-priority'>('roadmap');

  // Fetch roadmap data
  const fetchRoadmapData = async () => {
    try {
      // First, fetch unfiltered data to get all available filter options
      const unfilteredData = await apiClient.getRoadmapData({
        mode: mode === 'upcoming' ? 'draft' : 'approved',
        planning_cycle: mode === 'upcoming' ? 'Current' : selectedHistoryCycle,
        m0_priorities: [],
        markets: [],
        roadmap_changes: [],
        delivery_owners: [],
        beneficiaries: []
      });

      // Extract all available M0 priorities from unfiltered data
      const priorities = Array.from(
        new Set(unfilteredData.data.map((m0) => m0.m0_priority))
      ).sort((a, b) => a.localeCompare(b));
      setM0Priorities(priorities);

      // Now fetch filtered data for display
      const data = await apiClient.getRoadmapData({
        mode: mode === 'upcoming' ? 'draft' : 'approved',
        planning_cycle: mode === 'upcoming' ? 'Current' : selectedHistoryCycle,
        m0_priorities: selectedM0s,
        markets: selectedMarkets,
        roadmap_changes: selectedRoadmapChanges,
        delivery_owners: selectedDeliveryOwners,
        beneficiaries: selectedBeneficiaries
      });

      setRoadmapData(data);

      // Extract ALL available filter options from unfiltered data
      const allUnfilteredLaunches = unfilteredData.data.flatMap((m0) =>
        m0.m1_initiatives.flatMap((m1) => m1.key_launches)
      );

      // Extract available delivery owners from unfiltered data
      const deliveryOwners = Array.from(
        new Set(
          allUnfilteredLaunches.map((launch) => launch.roadmap_ownership).filter(Boolean)
        )
      ).sort() as string[];
      setAvailableDeliveryOwners(deliveryOwners);

      // Extract available beneficiaries from unfiltered data
      const beneficiaries = Array.from(
        new Set(
          unfilteredData.data.flatMap((m0) =>
            m0.m1_initiatives.flatMap((m1) =>
              m1.key_launches.flatMap((launch) => launch.cross_priority_dependencies_list)
            )
          ).filter(Boolean)
        )
      ).sort() as string[];
      setAvailableBeneficiaries(beneficiaries);

      // Extract available markets from unfiltered data
      const markets = Array.from(
        new Set(
          unfilteredData.data.flatMap((m0) =>
            m0.m1_initiatives.flatMap((m1) =>
              m1.key_launches.flatMap((launch) => launch.target_geos_list)
            )
          ).filter(Boolean)
        )
      ).sort() as string[];
      setAvailableMarkets(markets);

      // Extract available roadmap changes from unfiltered data
      const roadmapChanges = Array.from(
        new Set(
          unfilteredData.data.flatMap((m0) =>
            m0.m1_initiatives.flatMap((m1) =>
              m1.key_launches.map((launch) => launch.roadmap_change)
            )
          ).filter(Boolean)
        )
      ).sort() as string[];
      setAvailableRoadmapChanges(roadmapChanges);

      // Helper function to generate all quarters between start and end
      const generateQuarterRange = (start: string, end: string): string[] => {
        if (!start || !end) return [];

        const parseQuarter = (q: string) => {
          const [quarter, year] = q.split('-');
          return { quarter: parseInt(quarter.replace('Q', '')), year: parseInt(year) };
        };

        const startQ = parseQuarter(start);
        const endQ = parseQuarter(end);

        const quarters: string[] = [];
        let currentYear = startQ.year;
        let currentQuarter = startQ.quarter;

        while (currentYear < endQ.year || (currentYear === endQ.year && currentQuarter <= endQ.quarter)) {
          quarters.push(`Q${currentQuarter}-${currentYear}`);
          currentQuarter++;
          if (currentQuarter > 4) {
            currentQuarter = 1;
            currentYear++;
          }
        }

        return quarters;
      };

      // Extract quarters from data - include ALL quarters in each launch's span
      const allQuarters = Array.from(
        new Set(
          data.data.flatMap((m0) =>
            m0.m1_initiatives.flatMap((m1) =>
              m1.key_launches.flatMap((launch) =>
                generateQuarterRange(
                  launch.updated_start_quarter,
                  launch.updated_end_quarter
                )
              )
            )
          )
          // Filter out empty/invalid quarters - must match Q[1-4]-YYYY format
          .filter((q) => q && typeof q === 'string' && /^Q[1-4]-\d{4}$/.test(q))
        )
      ).filter(Boolean) as QuarterLabel[];

      // Sort quarters chronologically (Q1-2026, Q2-2026, Q3-2026, Q4-2026, Q1-2027, etc.)
      const sortedQuarters = allQuarters.sort((a, b) => {
        const [aQ, aY] = a.split('-');
        const [bQ, bY] = b.split('-');
        const aYear = parseInt(aY);
        const bYear = parseInt(bY);
        const aQuarter = parseInt(aQ.replace('Q', ''));
        const bQuarter = parseInt(bQ.replace('Q', ''));

        if (aYear !== bYear) return aYear - bYear;
        return aQuarter - bQuarter;
      });

      setQuarters(sortedQuarters);
    } catch (error) {
      console.error('Failed to fetch roadmap data:', error);
    }
  };

  // Refresh data from backend
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiClient.refreshCache();
      await fetchRoadmapData();
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle CSV upload success
  const handleUploadSuccess = async () => {
    setUploadSuccess(true);
    setUploadError(null);
    await fetchRoadmapData();
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  // Handle CSV upload error
  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(false);
  };

  // Handle approve planning cycle
  const handleApprove = async (cycle: string) => {
    try {
      await apiClient.createSnapshot(cycle, 'Jordan');
      alert(`${cycle} approved and frozen as snapshot`);
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve planning cycle');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedM0s([]);
    setSelectedMarkets([]);
    setSelectedRoadmapChanges([]);
    setSelectedDeliveryOwners([]);
    setSelectedBeneficiaries([]);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!roadmapData) {
      alert('No data to export');
      return;
    }

    // Flatten nested structure into CSV rows
    const csvRows: any[] = [];

    roadmapData.data.forEach((m0) => {
      m0.m1_initiatives.forEach((m1) => {
        m1.key_launches.forEach((launch) => {
          csvRows.push({
            'M0 Priority': m0.m0_priority,
            'Business Unit': m0.business_unit,
            'M1 Initiative': m1.m1_name,
            'Key Launch': launch.key_launch_name,
            'Original Start Quarter': launch.original_start_quarter,
            'Original End Quarter': launch.original_end_quarter,
            'Updated Start Quarter': launch.updated_start_quarter,
            'Updated End Quarter': launch.updated_end_quarter,
            'Geo Category': launch.geo_category,
            'Target Geos': launch.target_geos_list.join(', '),
            'Roadmap Change': launch.roadmap_change,
            'Change Rationale': launch.change_rationale || '',
            'Cross Priority Dependencies': launch.cross_priority_dependencies_list.join(', '),
            'Highlighted': launch.highlighted ? 'Yes' : 'No'
          });
        });
      });
    });

    // Generate CSV
    const csv = Papa.unparse(csvRows, {
      quotes: true,
      delimiter: ',',
      header: true
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `eBay_Roadmap_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Export to 16:9 Slide
  const handleExportSlide = () => {
    // Open slide view in new window
    const slideUrl = `/slide?mode=${mode}&planning_cycle=${mode === 'upcoming' ? 'Current' : selectedHistoryCycle}&m0s=${selectedM0s.join(',')}&markets=${selectedMarkets.join(',')}&roadmap_changes=${selectedRoadmapChanges.join(',')}`;
    window.open(slideUrl, '_blank');
  };

  // Fetch available planning cycles for History dropdown
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const cycles = await apiClient.getSnapshotCycles();
        setAvailableCycles(cycles);
        if (cycles.length > 0 && !selectedHistoryCycle) {
          setSelectedHistoryCycle(cycles[0]);
        }
      } catch (error) {
        console.error('Failed to fetch planning cycles:', error);
      }
    };
    fetchCycles();
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchRoadmapData();
  }, [selectedM0s, selectedMarkets, selectedRoadmapChanges, selectedDeliveryOwners, selectedBeneficiaries, mode, selectedHistoryCycle]);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Compact Header - Single Row */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-1.5 flex items-center justify-between">
          {/* Left: Title & Mode */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a
                href="/"
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Home
              </a>
              <span className="text-gray-300">|</span>
              <h1 className="text-sm font-semibold text-gray-900">eBay REN</h1>
            </div>
            <div className="scale-75 origin-left">
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>
          </div>

          {/* Center: Last Updated */}
          {lastRefreshed && (
            <p className="text-[10px] text-gray-500">
              Updated: {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }).format(lastRefreshed)}
            </p>
          )}

          {/* Right: Export Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportCSV}
              className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
            >
              CSV
            </button>
            <button
              onClick={handleExportSlide}
              className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
            >
              Slide
            </button>
          </div>
        </div>
      </div>

      {/* Compact Charts - Single Row */}
      <div className="border-b border-gray-200 flex-shrink-0 bg-gray-50">
        <div className="px-4 py-1.5 grid grid-cols-3 gap-4">
          {/* Roadmap Change Chart */}
          <div className="space-y-1.5">
            {roadmapData && <StatusChart data={roadmapData} />}
            <div
              onClick={() => setActiveView('changelog')}
              className="w-full px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer text-center transition-colors"
            >
              view change log
            </div>
          </div>

          {/* Rationale Chart */}
          <div>
            {roadmapData && <RationaleChart data={roadmapData} />}
          </div>

          {/* Eng Capacity Chart */}
          <div>
            {roadmapData && <EngCapacityChart data={roadmapData} />}
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-1">
          <div className="scale-90 origin-top-left">
            <FilterBar
              m0Priorities={m0Priorities}
              availableDeliveryOwners={availableDeliveryOwners}
              availableBeneficiaries={availableBeneficiaries}
              availableMarkets={availableMarkets}
              availableRoadmapChanges={availableRoadmapChanges}
              selectedM0s={selectedM0s}
              selectedMarkets={selectedMarkets}
              selectedRoadmapChanges={selectedRoadmapChanges}
              selectedDeliveryOwners={selectedDeliveryOwners}
              selectedBeneficiaries={selectedBeneficiaries}
              onM0Change={setSelectedM0s}
              onMarketChange={setSelectedMarkets}
              onRoadmapChangeChange={setSelectedRoadmapChanges}
              onDeliveryOwnerChange={setSelectedDeliveryOwners}
              onBeneficiaryChange={setSelectedBeneficiaries}
              onReset={handleResetFilters}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              mode={mode}
              selectedHistoryCycle={selectedHistoryCycle}
              availableCycles={availableCycles}
              onHistoryCycleChange={setSelectedHistoryCycle}
              uploadComponent={
                mode === 'upcoming' ? (
                  <CSVUpload
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />
                ) : undefined
              }
            />
          </div>

          {/* Upload Status Messages */}
          {(uploadSuccess || uploadError) && (
            <div className="mt-1">
              {uploadSuccess && (
                <div className="px-2 py-1 bg-green-50 border border-green-200 rounded text-[10px] text-green-800 flex items-center gap-1">
                  <span>✓</span> Uploaded
                </div>
              )}
              {uploadError && (
                <div className="px-2 py-1 bg-red-50 border border-red-200 rounded text-[10px] text-red-800 flex items-center gap-1">
                  <span>✕</span> {uploadError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact Toggle */}
      <div className="border-b border-gray-200 bg-white flex-shrink-0">
        <div className="px-4 flex gap-2 justify-between items-center">
          {/* Left: View Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('roadmap')}
              className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'roadmap'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setActiveView('by-priority')}
              className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'by-priority'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Priorities by Market
            </button>
            <button
              onClick={() => setActiveView('changelog')}
              className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'changelog'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Change Log
            </button>
          </div>

          {/* Right: Geo Legend */}
          <div className="flex items-center gap-3 text-[10px] font-medium">
            <span className="text-gray-700">Key:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: '#B3D4FF' }}></div>
              <span className="text-gray-700">Big 3</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: '#FFE8B3' }}></div>
              <span className="text-gray-700">Remaining Big 4</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: '#E0E0E0' }}></div>
              <span className="text-gray-700">Global</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Fills Remaining Height */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="h-full px-4 py-2">
          {activeView === 'roadmap' ? (
            <div ref={setTimelineRef} className="h-full">
              {roadmapData ? (
                <Timeline data={roadmapData} quarters={quarters} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-gray-400">Loading roadmap...</div>
                </div>
              )}
            </div>
          ) : activeView === 'by-priority' ? (
            <div className="h-full">
              {roadmapData ? (
                <TimelineByPriority data={roadmapData} quarters={quarters} selectedMarkets={selectedMarkets} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-gray-400">Loading roadmap...</div>
                </div>
              )}
            </div>
          ) : (
            roadmapData ? (
              <ChangeLogTable data={roadmapData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-xs text-gray-400">Loading change log...</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-sm text-gray-400">Loading...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
