"""
CSV parser for Key Launch data.
"""
import pandas as pd
from typing import Dict, List
import io
import re

# Column mapping: CSV column name -> internal field name
COLUMN_MAPPING = {
    'M0': 'm0_priority_name',
    'Priority (M0)': 'm0_priority_name',  # New format
    'M1 ': 'm1_initiative_name',  # Note the space in the CSV
    'Play (M1)': 'm1_initiative_name',  # New format
    'Key_Launch': 'key_launch_name',
    'Roadmap item': 'key_launch_name',  # Alternative name
    'Roadmap Item': 'key_launch_name',  # New format
    'roadmap ownership': 'roadmap_ownership',
    'Roadmap Item Delivery Owner': 'roadmap_ownership',  # New format
    'Roadmap item Description': 'roadmap_item_description',
    'Roadmap Item Description': 'roadmap_item_description',  # New format
    ' primary_domain ': 'primary_domain',  # Note: spaces in CSV!
    'dependent_domains': 'dependent_domains',
    'Initial_start_Quarter': 'original_start_quarter',
    'Initial_end_Quarter': 'original_end_quarter',
    'Original_Quarter': 'original_start_quarter',  # New format
    'Original_Start_Quarter': 'original_start_quarter',  # New format
    'Original_End_Quarter': 'original_end_quarter',  # New format
    'Start_Quarter': 'updated_start_quarter',
    'End_Quarter': 'updated_end_quarter',
    'Geo_Category': 'geo_category',
    'Geo_Category_Details': 'target_geos',
    'roadmap_change': 'roadmap_change',
    'Roadmap_change': 'roadmap_change',  # Alternative name
    'change_rationale': 'change_rationale',
    'Change_rationale': 'change_rationale',  # Alternative name
    'Change Rationale Comment': 'change_rationale_comment',
    'Cross_Priority_Dependency': 'cross_priority_partnership',
    'Cross Priority Dependency / Partnership': 'cross_priority_partnership',  # Column M
    'Roadmap Item Priority (M0) Beneficiary': 'cross_priority_beneficiary'  # Column S
}

# Required internal fields (after mapping)
REQUIRED_FIELDS = [
    'm0_priority_name',
    'm1_initiative_name',
    'key_launch_name',
    'updated_start_quarter',
    'updated_end_quarter',
    'geo_category'
]


def normalize_quarter(quarter_str: str) -> str:
    """
    Normalize quarter format to Q[1-4]-YYYY.

    Handles variations like:
    - "Q1-2026", "Q1 2026", "Q1-26"
    - Trims whitespace
    - Validates quarter number (1-4)

    Args:
        quarter_str: Quarter string in various formats

    Returns:
        Normalized quarter string (e.g., "Q1-2026") or empty string if invalid
    """
    if not quarter_str or not isinstance(quarter_str, str):
        return ''

    # Handle variations: "Q1-2026", "Q1 2026", "Q1-26", etc.
    match = re.match(r'Q([1-4])[- ]?(\d{2,4})', quarter_str.strip())
    if not match:
        return ''

    q_num, year = match.groups()
    # Normalize year to 4 digits
    if len(year) == 2:
        year = '20' + year

    return f'Q{q_num}-{year}'


def validate_quarter_range(start_q: str, end_q: str) -> tuple:
    """
    Ensure start_quarter <= end_quarter chronologically.
    Swaps quarters if reversed.

    Args:
        start_q: Start quarter (e.g., "Q2-2026")
        end_q: End quarter (e.g., "Q1-2026")

    Returns:
        Tuple of (corrected_start, corrected_end)
    """
    if not start_q or not end_q:
        return start_q, end_q

    # Parse to compare chronologically
    def quarter_to_num(q):
        parts = q.split('-')
        if len(parts) != 2:
            return 0
        try:
            year = int(parts[1])
            quarter = int(parts[0].replace('Q', ''))
            return year * 4 + quarter
        except (ValueError, IndexError):
            return 0

    start_num = quarter_to_num(start_q)
    end_num = quarter_to_num(end_q)

    if start_num > end_num:
        print(f'WARNING: Reversed quarters detected: {start_q} -> {end_q}, swapping to {end_q} -> {start_q}')
        return end_q, start_q

    return start_q, end_q


class CSVParser:
    """Parser for Key Launch CSV files."""

    @staticmethod
    def find_header_row(file_content: str) -> int:
        """
        Dynamically find the header row by trying different skip values.

        Tries parsing CSV with different skip values and checks if the result
        has the expected header columns (Priority (M0), Play (M1), etc.)

        Args:
            file_content: CSV file content as string

        Returns:
            Number of rows to skip (0-based) where headers are found, or 1 as default
        """
        # Try different skip values (0 to 20)
        for skip_rows in range(21):
            try:
                df = pd.read_csv(io.StringIO(file_content), skiprows=skip_rows, nrows=0)
                columns = list(df.columns)

                # Check if this row contains the expected headers
                if 'Priority (M0)' in columns or 'M0' in columns:
                    return skip_rows
            except Exception:
                continue

        # Default to old behavior (skip 1 row)
        return 1

    @staticmethod
    def validate_csv(file_content: str) -> tuple[bool, str]:
        """
        Validate CSV structure and required columns.

        Args:
            file_content: CSV file content as string

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Dynamically find header row
            header_row = CSVParser.find_header_row(file_content)
            skiprows = list(range(header_row)) if header_row > 0 else None

            df = pd.read_csv(io.StringIO(file_content), skiprows=skiprows)

            # Check for empty data
            if df.empty:
                return False, "CSV file is empty"

            # Check for required CSV columns that we can map
            csv_columns = set(df.columns)
            required_csv_columns = set(COLUMN_MAPPING.keys())
            available_columns = csv_columns & required_csv_columns

            if not available_columns:
                return False, f"CSV does not contain recognizable columns. Found: {', '.join(list(csv_columns)[:5])}"

            return True, ""

        except Exception as e:
            return False, f"Error parsing CSV: {str(e)}"

    @staticmethod
    def parse_csv(file_content: str) -> List[Dict]:
        """
        Parse CSV content into list of key launch dictionaries.

        Args:
            file_content: CSV file content as string

        Returns:
            List of key launch dicts
        """
        # Dynamically find header row
        header_row = CSVParser.find_header_row(file_content)
        skiprows = list(range(header_row)) if header_row > 0 else None

        df = pd.read_csv(io.StringIO(file_content), skiprows=skiprows)

        # Fill NaN values with empty strings
        df = df.fillna('')

        launches = []
        for _, row in df.iterrows():
            launch = {}

            # Map CSV columns to internal field names
            for csv_col, internal_field in COLUMN_MAPPING.items():
                if csv_col in df.columns:
                    launch[internal_field] = str(row[csv_col]).strip()
                else:
                    launch[internal_field] = ''

            # Skip rows with empty M0 or Key Launch name
            if not launch.get('m0_priority_name') or not launch.get('key_launch_name'):
                continue

            # Parse and normalize target geos (handles comma, slash, space separators)
            from app.geo_utils import parse_geo_details
            launch['target_geos_list'] = parse_geo_details(launch.get('target_geos', ''))

            # Merge cross-priority fields from columns M and S
            partnership = launch.get('cross_priority_partnership', '')
            beneficiary = launch.get('cross_priority_beneficiary', '')

            all_cross_priorities = []
            if partnership:
                all_cross_priorities.extend([p.strip() for p in partnership.split(',') if p.strip()])
            if beneficiary:
                all_cross_priorities.extend([b.strip() for b in beneficiary.split(',') if b.strip()])

            # Remove duplicates while preserving order
            seen = set()
            unique_cross_priorities = []
            for priority in all_cross_priorities:
                if priority not in seen:
                    seen.add(priority)
                    unique_cross_priorities.append(priority)

            launch['cross_priority_dependencies_list'] = unique_cross_priorities
            launch['cross_priority_dependencies'] = ', '.join(unique_cross_priorities) if unique_cross_priorities else ''

            # Normalize quarter formats
            launch['original_start_quarter'] = normalize_quarter(launch.get('original_start_quarter', ''))
            launch['original_end_quarter'] = normalize_quarter(launch.get('original_end_quarter', ''))
            launch['updated_start_quarter'] = normalize_quarter(launch.get('updated_start_quarter', ''))
            launch['updated_end_quarter'] = normalize_quarter(launch.get('updated_end_quarter', ''))

            # Validate and fix reversed quarter ranges
            launch['updated_start_quarter'], launch['updated_end_quarter'] = validate_quarter_range(
                launch['updated_start_quarter'],
                launch['updated_end_quarter']
            )
            launch['original_start_quarter'], launch['original_end_quarter'] = validate_quarter_range(
                launch['original_start_quarter'],
                launch['original_end_quarter']
            )

            # Detect if launch shifted (comparing Initial vs Start/End quarters)
            original_start = launch.get('original_start_quarter', '')
            original_end = launch.get('original_end_quarter', '')
            updated_start = launch.get('updated_start_quarter', '')
            updated_end = launch.get('updated_end_quarter', '')

            launch['shifted'] = (
                (original_start and updated_start and original_start != updated_start) or
                (original_end and updated_end and original_end != updated_end)
            )

            launches.append(launch)

        return launches

    @staticmethod
    def csv_to_json(file_content: str) -> Dict:
        """
        Convert CSV to JSON format for storage.

        Args:
            file_content: CSV file content as string

        Returns:
            Dict with launches list
        """
        launches = CSVParser.parse_csv(file_content)
        return {
            'launches': launches,
            'total_count': len(launches)
        }
