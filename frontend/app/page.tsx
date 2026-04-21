/**
 * Home Page - V0 Design with Backend Integration
 * eBay REN (Roadmap Intelligence Engine)
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { priorityVerticals, PILLAR_STYLES } from "@/lib/v0-data"
import { apiClient } from "@/lib/api"
import { transformRoadmapDataToV0Format, countLaunchesPerM0 } from "@/lib/data-adapter"
import type { V0RoadmapItem } from "@/lib/v0-types"

// eBay Logo Component with multicolor letters
function EbayLogo() {
  return (
    <span className="text-2xl font-bold tracking-tight">
      <span style={{ color: "#E53238" }}>e</span>
      <span style={{ color: "#0064D2" }}>B</span>
      <span style={{ color: "#F5AF02" }}>a</span>
      <span style={{ color: "#86B817" }}>y</span>
      <span className="text-gray-900 ml-1">REN</span>
    </span>
  )
}

// M0 Team Box Component
function M0Box({
  team,
  pillarId,
  launchCount,
  disabled
}: {
  team: string
  pillarId: string
  launchCount: number
  disabled?: boolean
}) {
  const style = PILLAR_STYLES[pillarId as keyof typeof PILLAR_STYLES]

  if (disabled) {
    return (
      <div
        className={cn(
          "h-full min-h-[72px] px-3 py-3 rounded-lg",
          "flex flex-col items-center justify-center text-center",
          "font-semibold text-sm leading-tight",
          "opacity-60 cursor-not-allowed"
        )}
        style={{
          backgroundColor: style.boxBg,
          color: style.boxText
        }}
      >
        <span className="line-clamp-2">{team}</span>
      </div>
    )
  }

  return (
    <Link href={`/timeline?m0=${encodeURIComponent(team)}`}>
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "h-full min-h-[72px] px-3 py-3 rounded-lg",
          "flex flex-col items-center justify-center text-center",
          "font-semibold text-sm leading-tight",
          "transition-all duration-200 cursor-pointer",
          "shadow-sm hover:shadow-md"
        )}
        style={{
          backgroundColor: style.boxBg,
          color: style.boxText
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = style.boxBgHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = style.boxBg
        }}
      >
        <span className="line-clamp-2">{team}</span>
        {launchCount > 0 && (
          <span className="text-[10px] opacity-80 mt-1">
            {launchCount} launches
          </span>
        )}
      </motion.div>
    </Link>
  )
}

// Pillar Column Component
function PillarColumn({
  pillar,
  index,
  launchCounts
}: {
  pillar: typeof priorityVerticals[0]
  index: number
  launchCounts: Record<string, number>
}) {
  const style = PILLAR_STYLES[pillar.id as keyof typeof PILLAR_STYLES]
  const teams = pillar.teams || []
  const totalLaunches = teams.reduce((sum, team) => sum + (launchCounts[team] || 0), 0)
  const hasData = totalLaunches > 0

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    }
  }

  const transition = {
    duration: 0.4,
    delay: index * 0.1,
    ease: "easeOut" as const
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={transition}
      className={cn(
        "rounded-xl overflow-hidden h-full flex flex-col",
        "border shadow-sm"
      )}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-5 text-center"
        style={{ backgroundColor: style.headerBg }}
      >
        <h2
          className="text-xl font-bold"
          style={{ color: style.headerText }}
        >
          {pillar.name.split(" ").map((word, i) => (
            <span key={i}>
              {word}
              {i < pillar.name.split(" ").length - 1 && <br className="hidden sm:inline" />}
              {i < pillar.name.split(" ").length - 1 && " "}
            </span>
          ))}
        </h2>
        <p
          className="text-xs mt-2 italic leading-relaxed opacity-75"
          style={{ color: style.headerText }}
        >
          {pillar.description}
        </p>
        {hasData ? (
          <div
            className="mt-2 text-xs font-medium"
            style={{ color: style.headerText }}
          >
            {teams.length} priorities &middot; {totalLaunches} launches
          </div>
        ) : (
          <div className="mt-2 text-xs font-medium text-gray-500">
            No roadmap data available
          </div>
        )}
      </div>

      {/* M0 Team Grid */}
      <div className="p-3 flex-1">
        <div className="grid grid-cols-2 gap-2 auto-rows-fr">
          {teams.map((team) => (
            <M0Box
              key={team}
              team={team}
              pillarId={pillar.id}
              launchCount={launchCounts[team] || 0}
              disabled={!hasData && launchCounts[team] === 0}
            />
          ))}
        </div>

        {/* No roadmap indicator for empty pillars */}
        {!hasData && (
          <div className="mt-4 py-3 px-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-center">
            <p className="text-sm text-gray-500 font-medium">No roadmap data available</p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const [allData, setAllData] = useState<V0RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch from backend API
        const roadmapData = await apiClient.getRoadmapData({
          mode: 'draft',
          planning_cycle: 'H2 2026',
        })

        // Transform to V0 format
        const v0Data = transformRoadmapDataToV0Format(roadmapData)
        setAllData(v0Data)
      } catch (err) {
        console.error('Failed to fetch roadmap data:', err)
        setError('Failed to load roadmap data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Count launches per M0 priority
  const launchCounts = useMemo(() => countLaunchesPerM0(allData), [allData])
  const totalItems = allData.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading roadmap data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EbayLogo />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {totalItems} total launches
            </span>
            <Link
              href="/timeline"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold",
                "bg-gray-900 text-white rounded-lg",
                "hover:bg-gray-800 transition-colors shadow-sm"
              )}
            >
              View Full Timeline
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            2026 Overall Company Priorities (M0)
          </h1>
          <p className="text-gray-600 mt-2">
            Click on any priority to view its detailed roadmap timeline
          </p>
        </div>

        {/* 4-Column Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {priorityVerticals.map((pillar, index) => (
            <PillarColumn
              key={pillar.id}
              pillar={pillar}
              index={index}
              launchCounts={launchCounts}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 eBay. All rights reserved. Confidential and proprietary.
          </p>
        </div>
      </main>
    </div>
  )
}
