import { PriorityVertical } from "./v0-types"

// Priority pillars with their M0 teams - using V0's color scheme
export const priorityVerticals: PriorityVertical[] = [
  {
    id: "strategic",
    name: "Strategic Priorities",
    description: "Drive and accelerate long-term growth",
    color: "#E53238", // eBay Red
    teams: [
      "C2C",
      "eBay Live",
      "Shipping",
      "FC: Collectibles",
      "FC: P&A",
      "FC: Fashion",
      "FC: Vehicles",
      "GBX",
    ],
  },
  {
    id: "horizontal",
    name: "Horizontal Innovation",
    description: "Customer facing innovations driving in-year GMV, Revenue or CSAT goals",
    color: "#0064D2", // eBay Blue
    teams: [
      "Trust",
      "Payments & FS",
      "B2C and Stores",
      "Buyer Experience",
      "E2E Regulatory",
      "Compliance",
      "Ads",
      "eBay Memory",
    ],
  },
  {
    id: "platform",
    name: "Platform Priorities",
    description: "Scalable Tech Enablers Driving Innovation and Efficiency for the Business",
    color: "#F5AF02", // eBay Yellow
    teams: [
      "Agentic Commerce",
      "Search of the Future",
      "Project Obsidian",
      "eBay Knowledge Platform",
      "Tokenization",
      "Discovery Platform",
      "eBay Merchant Services",
      "GCX Tech Transform",
    ],
  },
  {
    id: "essentials",
    name: "Platform Essentials",
    description: "Maintaining a great customer experience that is secure, available, compliant and delightful",
    color: "#86B817", // eBay Green
    teams: [
      "Availability",
      "Security, RAI, DG and Compliance",
      "Essential Engineering",
      "Tech Velocity",
      "RTB",
    ],
  },
]

// Pillar colors matching V0 design
export const PILLAR_STYLES = {
  strategic: {
    bg: "#CFE0F5",
    headerBg: "#CFE0F5",
    headerText: "#1E5CC6",
    boxBg: "#1E5CC6",
    boxBgHover: "#174BA3",
    boxText: "#FFFFFF",
    border: "#A3C4E8",
  },
  horizontal: {
    bg: "#D9D2E9",
    headerBg: "#D9D2E9",
    headerText: "#5B4A8A",
    boxBg: "#8E7CC3",
    boxBgHover: "#7A69B0",
    boxText: "#FFFFFF",
    border: "#C4B8DB",
  },
  platform: {
    bg: "#E5F5F3",
    headerBg: "#E5F5F3",
    headerText: "#2D6A5E",
    boxBg: "#5BA99A",
    boxBgHover: "#4A9B8C",
    boxText: "#FFFFFF",
    border: "#B8DDD6",
  },
  essentials: {
    bg: "#FFF8E6",
    headerBg: "#FFF8E6",
    headerText: "#8B6914",
    boxBg: "#C69214",
    boxBgHover: "#B8860B",
    boxText: "#FFFFFF",
    border: "#E8D5A8",
  },
}
