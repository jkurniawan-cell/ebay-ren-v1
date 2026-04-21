"""
Geo/Country utilities for market filtering.
Handles country normalization and category-to-country expansion.
"""
from typing import List, Set

# Country expansion constants
BIG_3_COUNTRIES = ['US', 'UK', 'DE']
REMAINING_BIG_4_COUNTRIES = ['FR', 'IT', 'AU', 'CA']

# Default country mappings for each geo category
GEO_CATEGORY_DEFAULTS = {
    'Big 3': BIG_3_COUNTRIES,
    'Remaining Big 4': REMAINING_BIG_4_COUNTRIES,
    'Global': [],  # Global means all countries, handled specially
    'Brought In': []  # No specific defaults
}

# Country code normalization mapping (handle variations in data)
COUNTRY_NORMALIZATION = {
    'US': 'US',
    'USA': 'US',
    'United States': 'US',
    'UK': 'UK',
    'United Kingdom': 'UK',
    'DE': 'DE',
    'Germany': 'DE',
    'Deutschland': 'DE',
    'FR': 'FR',
    'France': 'FR',
    'IT': 'IT',
    'Italy': 'IT',
    'AU': 'AU',
    'Australia': 'AU',
    'CA': 'CA',
    'Canada': 'CA',
    'EU': 'EU',
    'European Union': 'EU',
}

# All valid country codes for filtering
ALL_COUNTRIES = ['US', 'UK', 'DE', 'FR', 'IT', 'AU', 'CA', 'EU']


def normalize_country_code(country: str) -> str:
    """
    Normalize a country name/code to standard 2-letter code.

    Args:
        country: Country name or code (e.g., "Germany", "DE", "United Kingdom")

    Returns:
        Normalized 2-letter country code (e.g., "DE", "UK") or original if unknown
    """
    if not country:
        return ''

    country_clean = country.strip()
    return COUNTRY_NORMALIZATION.get(country_clean, country_clean)


def parse_geo_details(geo_details: str) -> List[str]:
    """
    Parse Geo_Category_Details field into list of normalized country codes.
    Handles various formats: "US, CA", "US/UK/DE", "US UK DE", etc.

    Args:
        geo_details: Comma or slash-separated country string

    Returns:
        List of normalized country codes
    """
    if not geo_details or geo_details.strip() == '':
        return []

    # Handle multiple separators: comma, slash, space
    # Known multi-word country names that should NOT be split
    MULTI_WORD_COUNTRIES = ['European Union', 'United States', 'United Kingdom']

    # Check if contains a known multi-word country
    has_multiword = any(mw in geo_details for mw in MULTI_WORD_COUNTRIES)

    if ',' in geo_details:
        # Comma-separated: "US, CA, European Union"
        countries = [c.strip() for c in geo_details.split(',') if c.strip()]
    elif '/' in geo_details:
        # Slash-separated: "US/UK/DE"
        countries = [c.strip() for c in geo_details.split('/') if c.strip()]
    elif has_multiword:
        # Contains multi-word country, don't split by space
        countries = [geo_details.strip()]
    else:
        # Space-separated codes: "US UK DE" or "UK Germany"
        countries = [c.strip() for c in geo_details.split() if c.strip()]

    # Filter out non-country text like "flagged only"
    countries = [c for c in countries if not any(word in c.lower() for word in ['flagged', 'only'])]

    # Normalize each country
    normalized = [normalize_country_code(c) for c in countries]

    # Remove duplicates while preserving order
    seen = set()
    result = []
    for country in normalized:
        if country and country not in seen:
            seen.add(country)
            result.append(country)

    return result


def get_effective_countries(geo_category: str, geo_details: str) -> List[str]:
    """
    Get the effective list of countries for a launch.

    Logic (per user requirements):
    1. If Geo_Category_Details has specific countries, use those (takes precedence)
    2. If Geo_Category_Details is empty, use the category's default countries
    3. For "Global" with empty details, return empty list (matches all)

    Args:
        geo_category: Geo category (Big 3, Remaining Big 4, Global, Brought In)
        geo_details: Comma-separated country details

    Returns:
        List of normalized country codes for this launch
    """
    # First check if details has specific countries
    countries_from_details = parse_geo_details(geo_details)

    if countries_from_details:
        # Details takes precedence
        return countries_from_details

    # Fall back to category defaults
    return GEO_CATEGORY_DEFAULTS.get(geo_category, [])


def matches_country_filter(effective_countries: List[str], filter_countries: List[str], geo_category: str = '') -> bool:
    """
    Check if a launch matches the country filter.

    Args:
        effective_countries: The launch's effective country list
        filter_countries: List of countries to filter by (can include "Global")
        geo_category: The launch's geo category (for Global special handling)

    Returns:
        True if launch matches any of the filter countries
    """
    if not filter_countries:
        # No filter applied, show all
        return True

    # Check if "Global" is in the filter
    if 'Global' in filter_countries and geo_category == 'Global':
        return True

    # Check if any filter country is in the effective countries
    return any(country in effective_countries for country in filter_countries)


def get_all_countries_in_data(launches: List[dict]) -> List[str]:
    """
    Extract all unique countries mentioned in the dataset.

    Args:
        launches: List of launch dictionaries

    Returns:
        Sorted list of unique country codes
    """
    all_countries = set()

    for launch in launches:
        geo_category = launch.get('geo_category', '')
        geo_details = launch.get('target_geos', '')

        countries = get_effective_countries(geo_category, geo_details)
        all_countries.update(countries)

    # Add standard countries even if not in data
    all_countries.update(ALL_COUNTRIES)

    return sorted(list(all_countries))
