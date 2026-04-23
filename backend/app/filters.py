"""
Filtering logic for roadmap data.
"""
from typing import Dict, List, Set
from app.geo_utils import matches_country_filter
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class RoadmapFilter:
    """Apply filters to roadmap data."""

    @staticmethod
    def filter_by_m0(data: List[Dict], m0_names: List[str]) -> List[Dict]:
        """Filter data by M0 priority names."""
        if not m0_names:
            return data
        m0_set = set(m0_names)
        return [item for item in data if item['m0_priority'] in m0_set]

    @staticmethod
    def filter_by_markets(launches: List[Dict], markets: List[str]) -> List[Dict]:
        """
        Filter launches by target countries using country-first logic.

        Logic (per user requirements):
        1. Check Geo_Category_Details for specific countries (takes precedence)
        2. If Geo_Category_Details is empty, use category defaults
        3. Match if any selected country is in the effective country list
        4. Special case: Global with empty details matches all country filters

        Args:
            launches: List of launch dictionaries (must have effective_countries_list)
            markets: List of country codes to filter by (e.g., ["US", "UK"])

        Returns:
            Filtered list of launches
        """
        if not markets:
            return launches

        filtered = []
        rejected = []

        for launch in launches:
            effective_countries = launch.get('effective_countries_list', [])
            geo_category = launch.get('geo_category', '')

            if matches_country_filter(effective_countries, markets, geo_category):
                filtered.append(launch)
            else:
                rejected.append({
                    'launch_name': launch.get('key_launch_name', 'Unknown'),
                    'geo_category': geo_category,
                    'target_geos': launch.get('target_geos', ''),
                    'effective_countries': effective_countries,
                    'filter_countries': markets
                })

        if rejected:
            logger.debug(f"Market filter rejected {len(rejected)} launches:")
            for r in rejected[:5]:
                logger.debug(f"  - {r['launch_name']}: category={r['geo_category']}, "
                            f"geos={r['target_geos']}, effective={r['effective_countries']}, "
                            f"filter={r['filter_countries']}")

        logger.info(f"Market filter: {len(filtered)} matches, {len(rejected)} rejected")

        return filtered

    @staticmethod
    def filter_by_planning_cycle(launches: List[Dict], planning_cycles: List[str]) -> List[Dict]:
        """
        Filter launches by planning cycle.

        Supports:
        - Quarters: Q1-2026, Q2-2026, etc.
        - Half-years: H1 2026 (Q1+Q2), H2 2026 (Q3+Q4)
        - Annual: Annual 2026
        """
        if not planning_cycles:
            return launches

        # Expand planning cycles to quarters
        expanded_quarters = set()
        for cycle in planning_cycles:
            if cycle.startswith('Q'):  # e.g., "Q1-2026"
                expanded_quarters.add(cycle)
            elif cycle.startswith('H1'):  # e.g., "H1 2026"
                year = cycle.split()[1] if len(cycle.split()) > 1 else '2026'
                expanded_quarters.add(f'Q1-{year}')
                expanded_quarters.add(f'Q2-{year}')
            elif cycle.startswith('H2'):  # e.g., "H2 2026"
                year = cycle.split()[1] if len(cycle.split()) > 1 else '2026'
                expanded_quarters.add(f'Q3-{year}')
                expanded_quarters.add(f'Q4-{year}')
            elif cycle.startswith('Annual'):  # e.g., "Annual 2026"
                year = cycle.split()[1] if len(cycle.split()) > 1 else '2026'
                for q in range(1, 5):
                    expanded_quarters.add(f'Q{q}-{year}')

        # Filter launches
        filtered = []
        for launch in launches:
            start_q = launch.get('updated_start_quarter', '')
            end_q = launch.get('updated_end_quarter', '')

            if start_q in expanded_quarters or end_q in expanded_quarters:
                filtered.append(launch)

        return filtered

    @staticmethod
    def filter_by_roadmap_change(launches: List[Dict], change_types: List[str]) -> List[Dict]:
        """
        Filter launches by roadmap change type.

        Handles case-insensitive matching (CSV may have lowercase values).
        """
        if not change_types:
            return launches

        # Normalize to lowercase for comparison
        change_set_lower = {c.lower() for c in change_types}

        filtered = []
        rejected = []
        all_change_values = set()

        for launch in launches:
            roadmap_change_raw = launch.get('roadmap_change')
            # Handle None/null values - convert to empty string
            roadmap_change = (roadmap_change_raw or '').lower()
            all_change_values.add(roadmap_change)

            if roadmap_change in change_set_lower:
                filtered.append(launch)
            else:
                rejected.append({
                    'launch_name': launch.get('key_launch_name', 'Unknown'),
                    'roadmap_change': roadmap_change_raw,
                    'filter_types': change_types
                })

        logger.debug(f"Roadmap change values found in data: {sorted(all_change_values)}")

        if rejected:
            logger.debug(f"Roadmap change filter rejected {len(rejected)} launches")
            for r in rejected[:3]:
                logger.debug(f"  - {r['launch_name']}: change={r['roadmap_change']}, filter={r['filter_types']}")

        logger.info(f"Roadmap change filter: {len(filtered)} matches, {len(rejected)} rejected")

        return filtered

    @staticmethod
    def filter_by_roadmap_ownership(launches: List[Dict], owners: List[str]) -> List[Dict]:
        """
        Filter launches by roadmap ownership (delivery owner).

        Args:
            launches: List of launch dictionaries
            owners: List of ownership names to filter by

        Returns:
            Filtered list of launches
        """
        if not owners:
            return launches

        owner_set = set(owners)
        filtered = []
        for launch in launches:
            roadmap_owner = launch.get('roadmap_ownership', '')
            if roadmap_owner in owner_set:
                filtered.append(launch)

        return filtered

    @staticmethod
    def filter_by_cross_priority_beneficiary(launches: List[Dict], beneficiaries: List[str]) -> List[Dict]:
        """
        Filter launches where ANY selected M0 is in cross_priority_dependencies_list.

        This is a TRUE FILTER (unlike highlight mode which just marks items).
        Uses the same data source as cross-dependency highlighting (Column M).

        Args:
            launches: List of launch dictionaries
            beneficiaries: List of M0 priority names that should benefit

        Returns:
            Filtered list of launches where at least one beneficiary matches
        """
        if not beneficiaries:
            return launches

        beneficiary_set = set(beneficiaries)
        filtered = []

        for launch in launches:
            # Use existing cross_priority_dependencies_list field
            launch_deps = set(launch.get('cross_priority_dependencies_list', []))
            if launch_deps.intersection(beneficiary_set):
                filtered.append(launch)

        return filtered

    @staticmethod
    def apply_filters(
        data: List[Dict],
        m0_filter: List[str] = None,
        market_filter: List[str] = None,
        roadmap_change_filter: List[str] = None,
        roadmap_ownership_filter: List[str] = None,
        beneficiary_filter: List[str] = None
    ) -> List[Dict]:
        """
        Apply all filters to merged roadmap data.

        Args:
            data: Merged roadmap data (M0 -> M1 -> Launches)
            m0_filter: List of M0 priority names to filter by
            market_filter: List of markets/geos to filter by
            roadmap_change_filter: List of roadmap change types
            roadmap_ownership_filter: List of roadmap ownership names to filter by
            beneficiary_filter: List of M0s that should benefit from the work (TRUE FILTER)

        Returns:
            Filtered data
        """
        # Filter by M0
        if m0_filter:
            data = RoadmapFilter.filter_by_m0(data, m0_filter)

        # Filter launches within each M1
        for m0_item in data:
            for m1_item in m0_item['m1_initiatives']:
                launches = m1_item['key_launches']

                # Apply market filter
                if market_filter:
                    launches = RoadmapFilter.filter_by_markets(launches, market_filter)

                # Apply roadmap change filter
                if roadmap_change_filter:
                    launches = RoadmapFilter.filter_by_roadmap_change(launches, roadmap_change_filter)

                # Apply roadmap ownership filter
                if roadmap_ownership_filter:
                    launches = RoadmapFilter.filter_by_roadmap_ownership(launches, roadmap_ownership_filter)

                # Apply beneficiary filter
                if beneficiary_filter:
                    launches = RoadmapFilter.filter_by_cross_priority_beneficiary(launches, beneficiary_filter)

                m1_item['key_launches'] = launches

        # Remove M1s with no launches
        for m0_item in data:
            m0_item['m1_initiatives'] = [
                m1 for m1 in m0_item['m1_initiatives']
                if len(m1['key_launches']) > 0
            ]

        # Remove M0s with no M1s
        data = [m0 for m0 in data if len(m0['m1_initiatives']) > 0]

        return data
