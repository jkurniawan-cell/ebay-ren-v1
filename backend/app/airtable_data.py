"""
Airtable Data Loader for REN V3
Reads roadmap data from local JSON dump (refreshed nightly).
No MCP or Airtable API dependency during runtime.
"""

import json
import os
from typing import List, Dict, Any
from pathlib import Path

# Path to JSON dump file
DATA_FILE = Path(__file__).parent.parent / "data" / "airtable_dump.json"


def load_data_from_file() -> Dict[str, Any]:
    """
    Load roadmap data from local JSON dump file.

    Returns:
        Dict with metadata, m0_priorities, and launches

    Raises:
        FileNotFoundError: If dump file doesn't exist
        JSONDecodeError: If dump file is invalid JSON
    """
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Airtable data dump not found at {DATA_FILE}. "
            f"Run: python3 backend/scripts/dump_airtable.py"
        )

    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    return data


def get_roadmap_data() -> Dict[str, Any]:
    """
    Main entry point to get roadmap data from local JSON dump.

    Returns:
        Dict with launches array and metadata
    """
    try:
        # Load from JSON file
        data = load_data_from_file()

        launches = data.get("launches", [])
        metadata = data.get("metadata", {})

        return {
            "launches": launches,
            "total_count": len(launches),
            "source": "local_json_dump",
            "last_updated": metadata.get("last_updated", "unknown")
        }

    except FileNotFoundError as e:
        print(f"ERROR: {str(e)}")
        return {
            "launches": [],
            "total_count": 0,
            "source": "local_json_dump",
            "error": str(e)
        }
    except Exception as e:
        print(f"Error loading data from JSON dump: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "launches": [],
            "total_count": 0,
            "source": "local_json_dump",
            "error": str(e)
        }


def get_unique_m0_priorities() -> List[str]:
    """
    Get list of unique M0 priorities from local JSON dump.

    Returns:
        List of M0 priority names
    """
    try:
        data = load_data_from_file()
        launches = data.get("launches", [])

        priorities = set()
        for launch in launches:
            if launch.get("m0_priority_name"):
                priorities.add(launch["m0_priority_name"])

        return sorted(list(priorities))

    except Exception as e:
        print(f"Error getting M0 priorities: {str(e)}")
        return []


def get_dump_metadata() -> Dict[str, Any]:
    """
    Get metadata about the current data dump.

    Returns:
        Dict with last_updated, total_launches, etc.
    """
    try:
        data = load_data_from_file()
        return data.get("metadata", {})
    except Exception:
        return {}
