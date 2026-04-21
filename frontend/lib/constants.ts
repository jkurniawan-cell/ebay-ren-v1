/**
 * Constants for eBay REN dashboard
 */

// Geo category colors (premium palette - Apple-inspired muted tones)
export const GEO_COLORS = {
  'Big 3': '#22a3df53',         // Bright Blue with transparency
  'Remaining Big 4': '#FFE6C5', // Desaturated Peach/Beige
  'Global': '#E8E8E8'           // Light Gray
} as const;

// Roadmap change status colors (Apple-inspired muted tones)
export const STATUS_COLORS = {
  'New': '#5B9FFF',         // Softer Blue
  'Shifted': '#FFE17F',     // Softer Yellow
  'Deferred': '#EF9A9A',    // Softer Red
  'Accelerated': '#66BB6A', // Softer Green
  'No Change': '#B0B7C3'    // Softer Gray
} as const;

// Quarter labels
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
export const YEARS = ['2025', '2026', '2027', '2028'] as const;

// Markets/Geos - Country codes for filtering
// Note: These match the backend geo_utils.py ALL_COUNTRIES list
// Includes "Global" as a filterable category
export const MARKETS = [
  'US',
  'UK',
  'DE',
  'FR',
  'IT',
  'AU',
  'CA',
  'EU',
  'Global'
] as const;

// Roadmap change types
export const ROADMAP_CHANGES = [
  'No Change',
  'Accelerated',
  'Deferred',
  'New'
] as const;

// Change rationale options
export const CHANGE_RATIONALES = [
  'Prioritized',
  'Deprioritized',
  'Blocked due to eng capacity',
  'Constrained',
  'Not ready'
] as const;

// Country flag emojis (for display)
export const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'UK': '🇬🇧',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'IT': '🇮🇹',
  'AU': '🇦🇺',
  'CA': '🇨🇦',
  'EU': '🇪🇺',
  'Global': '🌐'
};

// Country display names
export const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States',
  'UK': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'AU': 'Australia',
  'CA': 'Canada',
  'EU': 'European Union'
};
