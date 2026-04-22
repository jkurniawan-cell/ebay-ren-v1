/**
 * 16:9 Slide Export Page
 * Single-page roadmap view optimized for print/PDF export
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Timeline } from '@/components/Timeline';
import { apiClient } from '@/lib/api';
import type { RoadmapData, QuarterLabel } from '@/types/roadmap';

function SlideContent() {
  const searchParams = useSearchParams();

  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [quarters, setQuarters] = useState<QuarterLabel[]>([]);

  // Extract filter params from URL
  const mode = (searchParams.get('mode') || 'draft') as 'draft' | 'approved';
  const planning_cycle = searchParams.get('planning_cycle') || 'Current';
  const m0s = searchParams.get('m0s')?.split(',').filter(Boolean) || [];
  const markets = searchParams.get('markets')?.split(',').filter(Boolean) || [];
  const roadmap_changes = searchParams.get('roadmap_changes')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiClient.getRoadmapData({
          mode,
          planning_cycle,
          m0_priorities: m0s,
          markets,
          roadmap_changes,
          delivery_owners: [],
          beneficiaries: []
        });

        setRoadmapData(data);

        // Generate quarter range
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
            ).filter((q) => q && typeof q === 'string' && /^Q[1-4]-\d{4}$/.test(q))
          )
        ).filter(Boolean) as QuarterLabel[];

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

    fetchData();
  }, [mode, planning_cycle, m0s.join(','), markets.join(','), roadmap_changes.join(',')]);

  return (
    <>
      <style jsx global>{`
        @page {
          size: 13.333in 7.5in;
          margin: 0;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .slide-container {
            overflow: hidden !important;
          }
        }

        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Print to PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>

      {/* 16:9 Slide Container */}
      <div
        className="slide-container mx-auto my-8 bg-white shadow-2xl overflow-hidden"
        style={{
          width: '13.333in',
          height: '7.5in',
          aspectRatio: '16/9',
          transform: 'scale(0.8)',
          transformOrigin: 'top center'
        }}
      >
        {/* Title Area */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <h1 className="text-lg font-bold text-gray-900">eBay Roadmap</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {mode === 'upcoming' ? 'Draft View' : 'Approved Snapshot'} • {planning_cycle}
          </p>
        </div>

        {/* Roadmap Content - Scaled to fit */}
        <div className="p-4 h-[calc(100%-4rem)] overflow-hidden">
          {roadmapData ? (
            <div className="h-full" style={{ transform: 'scale(0.7)', transformOrigin: 'top left' }}>
              <Timeline data={roadmapData} quarters={quarters} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-400">Loading roadmap...</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SlidePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-sm text-gray-400">Loading slide...</div></div>}>
      <SlideContent />
    </Suspense>
  );
}
