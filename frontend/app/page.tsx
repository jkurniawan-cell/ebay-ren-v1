/**
 * Home Page - 2026 Overall Company Priorities (M0)
 * eBay REN (Roadmap Intelligence Engine)
 */

"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// eBay Logo Component
function EbayLogo() {
  return (
    <span className="text-2xl font-bold tracking-tight text-gray-900">
      eBay REN
    </span>
  )
}

interface Pillar {
  id: string
  name: string
  description: string
  color: string
  hoverColor: string
  headerBg: string
  priorities: string[]
  isAvailable: boolean
}

const pillars: Pillar[] = [
  {
    id: 'strategic',
    name: 'Strategic Priorities',
    description: 'Drive and accelerate high-impact value',
    color: '#0c5bde',
    hoverColor: '#0a4ab8',
    headerBg: '#cfe2f3',
    priorities: [
      'C2C',
      'eBay Live',
      'Shipping',
      'Collectibles',
      'FC: P&A',
      'FC: Fashion',
      'FC: Electronics & IT',
      'Vehicles',
      'Global Buying Experience (GBX)'
    ],
    isAvailable: true
  },
  {
    id: 'horizontal',
    name: 'Horizontal Innovation',
    description: 'Customer facing innovations driving value across multiple or GCAT goals',
    color: '#8e7cc3',
    hoverColor: '#7566a8',
    headerBg: '#d9d2e9',
    priorities: [
      'Trust',
      'B2C',
      'E2E Regulatory',
      'Compliance',
      'Ads',
      'Payments & Financial Svs.',
      'Buyer Experience\n1. Buy it Now\n2. Search & SEO',
      'Marketing Transformation',
      'eBay Memory'
    ],
    isAvailable: true
  },
  {
    id: 'platform-innovation',
    name: 'Platform Innovation',
    description: 'Scalable Tech Enablers Driving Innovation and Efficiency for the Business',
    color: '#45818e',
    hoverColor: '#376873',
    headerBg: '#d0e0e3',
    priorities: [
      'Agentic Commerce',
      'Search Platform',
      'Project Obsidian',
      'Tokenization',
      'eBay Merchant Services',
      'GCX Tech Transform'
    ],
    isAvailable: false
  },
  {
    id: 'platform-essentials',
    name: 'Platform Essentials',
    description: 'Maintaining a great customer experience and tech health',
    color: '#b45f06',
    hoverColor: '#954e05',
    headerBg: '#fff2cc',
    priorities: [
      'Availability',
      'Security, RAI, DS and Compliance',
      'Essential Engineering',
      'Tech Velocity',
      'RTB'
    ],
    isAvailable: false
  }
]

function PriorityBox({
  name,
  color,
  hoverColor,
  onClick,
  isClickable
}: {
  name: string
  color: string
  hoverColor: string
  onClick: () => void
  isClickable: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        h-full min-h-[70px] px-3 py-2.5 rounded
        flex items-center justify-center text-center
        font-semibold text-sm leading-tight text-white
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default opacity-90'}
      `}
      style={{
        backgroundColor: isHovered && isClickable ? hoverColor : color
      }}
    >
      <span className="whitespace-pre-line">{name}</span>
    </div>
  )
}

function PillarColumn({ pillar }: { pillar: Pillar }) {
  const router = useRouter()
  const [showUnavailable, setShowUnavailable] = useState(false)

  const handlePriorityClick = (priorityName: string) => {
    if (!pillar.isAvailable) {
      setShowUnavailable(true)
      setTimeout(() => setShowUnavailable(false), 3000)
      return
    }

    router.push(`/timeline?m0=${encodeURIComponent(priorityName)}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b-2 border-gray-300 px-4 py-3 text-center" style={{ backgroundColor: pillar.headerBg }}>
        <h2 className="text-base font-bold text-gray-900 leading-tight">
          {pillar.name}
        </h2>
        <p className="text-xs text-gray-600 mt-1.5 italic leading-relaxed">
          {pillar.description}
        </p>
        {!pillar.isAvailable && (
          <div className="mt-2 inline-block px-3 py-1 bg-gray-200 rounded-full">
            <p className="text-xs font-semibold text-gray-700">Roadmaps not available</p>
          </div>
        )}
      </div>

      {/* Priority Grid */}
      <div className="flex-1 bg-white p-3 relative">
        <div className="grid grid-cols-2 gap-2 auto-rows-fr">
          {pillar.priorities.map((priority, index) => (
            <PriorityBox
              key={index}
              name={priority}
              color={pillar.color}
              hoverColor={pillar.hoverColor}
              onClick={() => handlePriorityClick(priority)}
              isClickable={pillar.isAvailable}
            />
          ))}
        </div>

        {/* Unavailable Message */}
        {showUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
            <div className="bg-white px-6 py-4 rounded-lg shadow-xl text-center">
              <p className="text-sm font-semibold text-gray-900">Roadmaps not available right now</p>
              <p className="text-xs text-gray-500 mt-1">Coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <EbayLogo />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 pb-2 border-b-2 border-gray-400">
            2026 Overall Company Priorities (M0)
          </h1>
        </div>

        {/* 4-Column Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((pillar) => (
            <PillarColumn key={pillar.id} pillar={pillar} />
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
