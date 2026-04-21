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
      );
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

  // PNG Export
  const handleExportPNG = async () => {
    if (!timelineRef) {
      alert('Timeline not ready for export');
      return;
    }

    try {
      const canvas = await html2canvas(timelineRef, {
        backgroundColor: '#fafafa',
        scale: 2, // High quality
        logging: false,
        useCORS: true,
        windowWidth: timelineRef.scrollWidth,
        windowHeight: timelineRef.scrollHeight
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `eBay_Roadmap_Timeline_${new Date().toISOString().split('T')[0]}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (error) {
      console.error('PNG export failed:', error);
      alert('Failed to export PNG. Please try again.');
    }
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
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>

      {/* Header Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-start justify-between">
            {/* Left: Mode Toggle */}
            <div>
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            {/* Center: Title */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-normal">
                Roadmap Intelligence Engine
              </h1>
              {lastRefreshed && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Last Updated: {new Intl.DateTimeFormat('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }).format(lastRefreshed)}
                </p>
              )}
            </div>

            {/* Right: Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
              >
                📊 CSV
              </button>
              <button
                onClick={handleExportPNG}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
              >
                🖼️ PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
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

          {/* Upload Status Messages */}
          {uploadSuccess && (
            <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-xs text-green-800 flex items-center gap-2">
              <span className="text-green-600">✓</span> CSV uploaded successfully
            </div>
          )}

          {uploadError && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-center gap-2">
              <span className="text-red-600">✕</span> {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Main Timeline */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div ref={setTimelineRef}>
            {roadmapData ? (
              <Timeline data={roadmapData} quarters={quarters} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-sm text-gray-400">Loading roadmap data...</div>
              </div>
            )}
          </div>
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
