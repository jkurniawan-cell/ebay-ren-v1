// V0 Type Definitions
export type Quarter = "Q1-2026" | "Q2-2026" | "Q3-2026" | "Q4-2026"

export type GeoCategory = "Big 3" | "Remaining Big 4" | "Global"

export type RoadmapChangeStatus =
  | "No Change"
  | "Accelerated"
  | "Deferred"
  | "Deferred (within H2)"
  | "Deprioritized (beyond H2)"
  | "New"

export type ChangeRationale =
  | "No Change"
  | "Prioritized - Strategic Reason"
  | "Deprioritized- Strategic Reason"
  | "Blocked due to eng. capacity"
  | "Constrained"
  | "Not Ready"

export interface PriorityVertical {
  id: string
  name: string
  description: string
  color: string
  bgColor?: string
  textColor?: string
  teams?: string[]
}

// V0 RoadmapItem format
export interface V0RoadmapItem {
  id: string
  priority: string              // M0 name
  play: string                  // M1 name
  roadmapItem: string           // Launch name
  deliveryOwner: string
  description: string
  startQuarter: Quarter | string
  endQuarter: Quarter | string
  originalStartQuarter: string
  originalEndQuarter: string
  geoCategory: GeoCategory | string
  geoCategoryDetails: string
  crossPriorityDependency: string
  roadmapChange: RoadmapChangeStatus | string
  changeRationale: ChangeRationale | string
  changeRationaleComment: string
}

export const QUARTERS: Quarter[] = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"]

export const GEO_CATEGORIES = ["All", "Big 3", "Remaining Big 4", "Global"] as const

export const COUNTRIES = [
  "All",
  "US",
  "UK",
  "Germany",
  "Australia",
  "Canada",
  "France",
  "Italy",
] as const
