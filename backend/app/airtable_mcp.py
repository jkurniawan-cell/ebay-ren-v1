"""
Airtable MCP Client for REN V3
Fetches roadmap data directly from Airtable via MCP (Model Context Protocol)
"""

import requests
import os
import urllib3
from typing import List, Dict, Any, Optional

# Disable SSL warnings for development (corporate proxy)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Airtable configuration
AIRTABLE_BASE_ID = "appXFsy8DcRl4C5mx"
ROADMAP_TABLE_ID = "tblV23SJ1OBxebWrt"
M0_PRIORITIES_TABLE_ID = "tblwZaISS19No2Ks3"
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")

# Field IDs from Airtable
FIELD_IDS = {
    "key_launch_name": "flduuIoUIZojWLFtU",
    "m0_priorities": "fldCVODBAs5vPPBEg",
    "m1_initiative": "fldOfNNWTC7oDyzeS",
    "start_quarter": "fld21yjdXCTBn7Arb",
    "end_quarter": "fldEQwylawUJpmKSd",
    "initial_start_quarter": "flddxxHSZ604WOvKA",
    "initial_end_quarter": "fldxjqD6sQiBOwn9u",
    "geo_category": "fldWLspsBpzgIejWt",
    "geo_details": "fldnAHV614gkQF1ex",
    "roadmap_change": "fldS9Crp4RZmAC4Hk",
    "change_rationale": "fldYO25QKXiWhbgqR",
    "change_rationale_comment": "fld2yy4n9BhH9NY7X",
    "cross_priority_dependency": "fldFJILTHhtSPgsg5"
}


def fetch_m0_priorities() -> Dict[str, str]:
    """
    Fetch M0 priorities from Airtable and create ID -> Name mapping.

    Returns:
        Dict mapping record IDs to priority names
    """
    if not AIRTABLE_API_KEY:
        return {}

    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{M0_PRIORITIES_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    m0_map = {}
    offset = None

    while True:
        params = {"pageSize": 100}
        if offset:
            params["offset"] = offset

        response = requests.get(url, headers=headers, params=params, verify=False)
        response.raise_for_status()

        data = response.json()
        for record in data.get("records", []):
            record_id = record.get("id")
            priority_name = record.get("fields", {}).get("Priority Name")
            if record_id and priority_name:
                m0_map[record_id] = priority_name

        offset = data.get("offset")
        if not offset:
            break

    return m0_map


def fetch_all_launches() -> List[Dict[str, Any]]:
    """
    Fetch all roadmap launches from Airtable using the Airtable API.

    Returns:
        List of launch records in Airtable format
    """
    if not AIRTABLE_API_KEY:
        raise ValueError("AIRTABLE_API_KEY environment variable not set")

    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{ROADMAP_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    all_records = []
    offset = None

    while True:
        params = {"pageSize": 100}
        if offset:
            params["offset"] = offset

        response = requests.get(url, headers=headers, params=params, verify=False)
        response.raise_for_status()

        data = response.json()
        all_records.extend(data.get("records", []))

        offset = data.get("offset")
        if not offset:
            break

    return all_records


def extract_field_value(fields: Dict[str, Any], field_id: str, value_type: str = "text") -> Optional[Any]:
    """
    Extract a field value from Airtable record fields.

    Args:
        fields: The cellValuesByFieldId or fields dict from Airtable
        field_id: The Airtable field ID
        value_type: Type of value to extract - "text", "select", "multiselect", "link"

    Returns:
        Extracted value or None
    """
    value = fields.get(field_id)

    if value is None:
        return None

    if value_type == "text":
        return value

    elif value_type == "select":
        # Single select field returns {"id": "sel...", "name": "...", "color": "..."}
        return value.get("name") if isinstance(value, dict) else None

    elif value_type == "multiselect":
        # Multiple selects returns array of {"id": "sel...", "name": "...", "color": "..."}
        if isinstance(value, list):
            return [item.get("name") for item in value if isinstance(item, dict)]
        return []

    elif value_type == "link":
        # Linked records returns array of {"id": "rec...", "name": "..."}
        if isinstance(value, list):
            return [item.get("name") for item in value if isinstance(item, dict)]
        return []

    return value


def transform_to_ren_format(airtable_records: List[Dict[str, Any]], m0_map: Dict[str, str]) -> List[Dict[str, Any]]:
    """
    Transform Airtable records to REN app format.

    Args:
        airtable_records: Raw records from Airtable API
        m0_map: Mapping of M0 record IDs to priority names

    Returns:
        List of launches in REN app format
    """
    launches = []

    for record in airtable_records:
        # Airtable API returns "fields" dict
        fields = record.get("fields", {})

        # Extract M0 priority name from linked record
        m0_record_ids = fields.get("Priorities (M0)", [])
        m0_name = None
        if isinstance(m0_record_ids, list) and len(m0_record_ids) > 0:
            m0_record_id = m0_record_ids[0]
            m0_name = m0_map.get(m0_record_id)

        # Build launch object (field names have trailing spaces!)
        launch = {
            "key_launch_name": fields.get("Roadmap Item Name"),
            "m0_priority_name": m0_name,
            "m1_initiative_name": fields.get("Roadmap Item Category"),
            "start_quarter": fields.get("H2 Start Quarter"),
            "end_quarter": fields.get("H2 End Quarter"),
            "initial_start_quarter": fields.get("Original H2 Start Quarter"),
            "initial_end_quarter": fields.get("Original H2 End Quarter"),
            "geo_category": fields.get("Geo Category "),  # Note the space!
            "geo_category_details": ", ".join(fields.get("Geo ", [])) if fields.get("Geo ") else None,
            "roadmap_change": fields.get("Roadmap Timing Change"),
            "change_rationale": fields.get("Change Rationale Status"),
            "change_rationale_comment": fields.get("Change Rationale Comments "),  # Note the space!
            "cross_priority_dependency": fields.get("Cross Priority Dependency / Partnership")
        }

        # Only include launches with at least a name
        if launch["key_launch_name"]:
            launches.append(launch)

    return launches


def get_roadmap_data() -> Dict[str, Any]:
    """
    Main entry point to get roadmap data from Airtable.

    Returns:
        Dict with launches array and metadata
    """
    try:
        # Fetch M0 priorities for lookup
        m0_map = fetch_m0_priorities()

        # Fetch roadmap launches
        airtable_records = fetch_all_launches()
        launches = transform_to_ren_format(airtable_records, m0_map)

        return {
            "launches": launches,
            "total_count": len(launches),
            "source": "airtable_mcp"
        }

    except Exception as e:
        print(f"Error fetching from Airtable: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "launches": [],
            "total_count": 0,
            "source": "airtable_mcp",
            "error": str(e)
        }


def get_unique_m0_priorities() -> List[str]:
    """
    Get list of unique M0 priorities from Airtable.

    Returns:
        List of M0 priority names
    """
    try:
        data = get_roadmap_data()
        priorities = set()

        for launch in data["launches"]:
            if launch.get("m0_priority_name"):
                priorities.add(launch["m0_priority_name"])

        return sorted(list(priorities))

    except Exception as e:
        print(f"Error getting M0 priorities: {str(e)}")
        return []
