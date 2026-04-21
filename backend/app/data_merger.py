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

            # Add effective countries list to launch
            # Use already-parsed target_geos_list if available, otherwise compute
            if launch.get('target_geos_list'):
                # Already parsed during CSV upload
                launch['effective_countries_list'] = launch['target_geos_list']
            else:
                # Fallback: compute from geo_category and target_geos
                launch['effective_countries_list'] = get_effective_countries(
                    launch.get('geo_category', ''),
                    launch.get('target_geos', '')
                )

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

            # Add effective countries list to launch
            # Use already-parsed target_geos_list if available, otherwise compute
            if launch.get('target_geos_list'):
                # Already parsed during CSV upload
                launch['effective_countries_list'] = launch['target_geos_list']
            else:
                # Fallback: compute from geo_category and target_geos
                launch['effective_countries_list'] = get_effective_countries(
                    launch.get('geo_category', ''),
                    launch.get('target_geos', '')
                )

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
