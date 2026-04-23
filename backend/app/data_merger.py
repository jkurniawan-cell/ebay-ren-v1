"""
Data merger - combines Airtable M0/M1 data with CSV Key Launch data.
"""
from typing import Dict, List
from app.geo_utils import get_effective_countries

class DataMerger:
    """Merge Airtable and CSV data for roadmap visualization."""

    @staticmethod
    def merge_data(m0_priorities: List[Dict], m1_plays: List[Dict], key_launches: List[Dict]) -> Dict:
        """
        Merge Airtable M0/M1 data with CSV Key Launch data.

        Args:
            m0_priorities: List of M0 priorities from Airtable
            m1_plays: List of M1 plays from Airtable
            key_launches: List of key launches from CSV

        Returns:
            Merged data structure organized by M0 -> M1 -> Launches
        """
        # Create lookup maps
        m0_map = {p['name']: p for p in m0_priorities}
        m1_map = {p['name']: p for p in m1_plays}

        # Group launches by M0 and M1
        result = {}

        for launch in key_launches:
            m0_name = launch['m0_priority_name']
            m1_name = launch['m1_initiative_name']

            # Initialize M0 if not exists
            if m0_name not in result:
                m0_data = m0_map.get(m0_name, {})
                result[m0_name] = {
                    'm0_priority': m0_name,
                    'business_unit': m0_data.get('business_unit', ''),
                    'm1_initiatives': {}
                }

            # Initialize M1 if not exists
            if m1_name not in result[m0_name]['m1_initiatives']:
                m1_data = m1_map.get(m1_name, {})
                result[m0_name]['m1_initiatives'][m1_name] = {
                    'm1_name': m1_name,
                    'start_quarter': m1_data.get('start_quarter', ''),
                    'end_quarter': m1_data.get('end_quarter', ''),
                    'key_launches': []
                }

            # Transform Airtable field names to match frontend expectations

            # 1. Parse geo_category_details into target_geos_list array
            geo_details = launch.get('geo_category_details', '')
            if geo_details and isinstance(geo_details, str):
                # Split by comma and strip whitespace
                launch['target_geos_list'] = [g.strip() for g in geo_details.split(',') if g.strip()]
            else:
                launch['target_geos_list'] = []

            # 2. Parse cross_priority_dependency into cross_priority_dependencies_list array
            cross_dep = launch.get('cross_priority_dependency', '')
            if cross_dep and isinstance(cross_dep, str):
                # Split by comma and strip whitespace
                launch['cross_priority_dependencies_list'] = [d.strip() for d in cross_dep.split(',') if d.strip()]
            else:
                launch['cross_priority_dependencies_list'] = []

            # 3. Map quarter field names: Airtable → Frontend
            launch['updated_start_quarter'] = launch.get('start_quarter', '')
            launch['updated_end_quarter'] = launch.get('end_quarter', '')
            launch['original_start_quarter'] = launch.get('initial_start_quarter', '')
            launch['original_end_quarter'] = launch.get('initial_end_quarter', '')

            # 4. Add effective countries list for filtering
            if launch['target_geos_list']:
                launch['effective_countries_list'] = launch['target_geos_list']
            else:
                # Fallback: compute from geo_category
                launch['effective_countries_list'] = get_effective_countries(
                    launch.get('geo_category', ''),
                    launch.get('geo_category_details', '')
                )

            # 5. Add missing fields with defaults
            launch['highlighted'] = False  # Default: not highlighted
            launch['roadmap_ownership'] = launch.get('roadmap_ownership', '')  # Empty if not present

            # Add launch to M1
            result[m0_name]['m1_initiatives'][m1_name]['key_launches'].append(launch)

        # Convert to list format
        output = []
        for m0_name, m0_data in result.items():
            m1_list = list(m0_data['m1_initiatives'].values())
            output.append({
                'm0_priority': m0_name,
                'business_unit': m0_data['business_unit'],
                'm1_initiatives': m1_list
            })

        return {
            'data': output,
            'total_m0': len(output),
            'total_launches': len(key_launches)
        }

    @staticmethod
    def csv_only_data(key_launches: List[Dict]) -> Dict:
        """
        Create roadmap data structure from CSV only (no Airtable data).

        Args:
            key_launches: List of key launches from CSV

        Returns:
            Data structure organized by M0 -> M1 -> Launches
        """
        # Group launches by M0 and M1
        result = {}

        for launch in key_launches:
            m0_name = launch['m0_priority_name']
            m1_name = launch['m1_initiative_name']

            # Initialize M0 if not exists
            if m0_name not in result:
                result[m0_name] = {
                    'm0_priority': m0_name,
                    'business_unit': '',  # Not available from CSV
                    'm1_initiatives': {}
                }

            # Initialize M1 if not exists
            if m1_name not in result[m0_name]['m1_initiatives']:
                result[m0_name]['m1_initiatives'][m1_name] = {
                    'm1_name': m1_name,
                    'start_quarter': '',  # Not available from CSV
                    'end_quarter': '',  # Not available from CSV
                    'key_launches': []
                }

            # Transform Airtable field names to match frontend expectations

            # 1. Parse geo_category_details into target_geos_list array
            geo_details = launch.get('geo_category_details', '')
            if geo_details and isinstance(geo_details, str):
                # Split by comma and strip whitespace
                launch['target_geos_list'] = [g.strip() for g in geo_details.split(',') if g.strip()]
            else:
                launch['target_geos_list'] = []

            # 2. Parse cross_priority_dependency into cross_priority_dependencies_list array
            cross_dep = launch.get('cross_priority_dependency', '')
            if cross_dep and isinstance(cross_dep, str):
                # Split by comma and strip whitespace
                launch['cross_priority_dependencies_list'] = [d.strip() for d in cross_dep.split(',') if d.strip()]
            else:
                launch['cross_priority_dependencies_list'] = []

            # 3. Map quarter field names: Airtable → Frontend
            launch['updated_start_quarter'] = launch.get('start_quarter', '')
            launch['updated_end_quarter'] = launch.get('end_quarter', '')
            launch['original_start_quarter'] = launch.get('initial_start_quarter', '')
            launch['original_end_quarter'] = launch.get('initial_end_quarter', '')

            # 4. Add effective countries list for filtering
            if launch['target_geos_list']:
                launch['effective_countries_list'] = launch['target_geos_list']
            else:
                # Fallback: compute from geo_category
                launch['effective_countries_list'] = get_effective_countries(
                    launch.get('geo_category', ''),
                    launch.get('geo_category_details', '')
                )

            # 5. Add missing fields with defaults
            launch['highlighted'] = False  # Default: not highlighted
            launch['roadmap_ownership'] = launch.get('roadmap_ownership', '')  # Empty if not present

            # Add launch to M1
            result[m0_name]['m1_initiatives'][m1_name]['key_launches'].append(launch)

        # Convert to list format
        output = []
        for m0_name, m0_data in result.items():
            m1_list = list(m0_data['m1_initiatives'].values())
            output.append({
                'm0_priority': m0_name,
                'business_unit': m0_data['business_unit'],
                'm1_initiatives': m1_list
            })

        return {
            'data': output,
            'total_m0': len(output),
            'total_launches': len(key_launches)
        }
