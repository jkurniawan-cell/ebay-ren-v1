#!/usr/bin/env python3
"""
Airtable Data Dump Script
Fetches roadmap data from Airtable and saves to local JSON file.
Run this script nightly to refresh the data.

Usage:
    python3 backend/scripts/dump_airtable.py
"""

import sys
import os
import json
import requests
import urllib3
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Disable SSL warnings for corporate proxy
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Airtable configuration
AIRTABLE_BASE_ID = "appXFsy8DcRl4C5mx"
ROADMAP_TABLE_ID = "tblV23SJ1OBxebWrt"
M0_PRIORITIES_TABLE_ID = "tblwZaISS19No2Ks3"
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")

# Output file path
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "airtable_dump.json"


def fetch_m0_priorities():
    """Fetch M0 priorities from Airtable and create ID -> Name mapping."""
    if not AIRTABLE_API_KEY:
        print("ERROR: AIRTABLE_API_KEY not set in .env file")
        return {}

    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{M0_PRIORITIES_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    m0_map = {}
    offset = None
    page_count = 0

    print(f"Fetching M0 priorities from Airtable...")

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

        page_count += 1
        offset = data.get("offset")
        if not offset:
            break

    print(f"  ✓ Fetched {len(m0_map)} M0 priorities in {page_count} pages")
    return m0_map


def fetch_all_launches():
    """Fetch all roadmap launches from Airtable."""
    if not AIRTABLE_API_KEY:
        raise ValueError("AIRTABLE_API_KEY environment variable not set")

    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{ROADMAP_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    all_records = []
    offset = None
    page_count = 0

    print(f"Fetching roadmap launches from Airtable...")

    while True:
        params = {"pageSize": 100}
        if offset:
            params["offset"] = offset

        response = requests.get(url, headers=headers, params=params, verify=False)
        response.raise_for_status()

        data = response.json()
        records = data.get("records", [])
        all_records.extend(records)

        page_count += 1
        print(f"  Page {page_count}: +{len(records)} records (total: {len(all_records)})")

        offset = data.get("offset")
        if not offset:
            break

    print(f"  ✓ Fetched {len(all_records)} launches in {page_count} pages")
    return all_records


def transform_to_ren_format(airtable_records, m0_map):
    """Transform Airtable records to REN app format."""
    launches = []

    print(f"Transforming {len(airtable_records)} records to REN format...")

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

    print(f"  ✓ Transformed {len(launches)} valid launches")
    return launches


def main():
    """Main entry point for dump script."""
    print("=" * 60)
    print("AIRTABLE DATA DUMP SCRIPT")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    try:
        # Step 1: Fetch M0 priorities for lookup
        m0_map = fetch_m0_priorities()
        if not m0_map:
            print("ERROR: No M0 priorities fetched. Check AIRTABLE_API_KEY.")
            sys.exit(1)

        print()

        # Step 2: Fetch roadmap launches
        airtable_records = fetch_all_launches()
        if not airtable_records:
            print("WARNING: No launches fetched from Airtable.")

        print()

        # Step 3: Transform to REN format
        launches = transform_to_ren_format(airtable_records, m0_map)

        print()

        # Step 4: Create output data structure
        output_data = {
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "total_launches": len(launches),
                "total_m0_priorities": len(m0_map),
                "source": "airtable_api",
                "base_id": AIRTABLE_BASE_ID,
                "roadmap_table_id": ROADMAP_TABLE_ID
            },
            "m0_priorities": m0_map,
            "launches": launches
        }

        # Step 5: Save to JSON file
        print(f"Writing data to {OUTPUT_FILE}...")
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

        with open(OUTPUT_FILE, 'w') as f:
            json.dump(output_data, f, indent=2)

        print(f"  ✓ Saved to {OUTPUT_FILE}")
        print()

        # Step 6: Summary
        print("=" * 60)
        print("DUMP COMPLETE")
        print(f"  Total Launches: {len(launches)}")
        print(f"  Total M0 Priorities: {len(m0_map)}")
        print(f"  File Size: {OUTPUT_FILE.stat().st_size / 1024:.2f} KB")
        print(f"  Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

    except Exception as e:
        print()
        print("=" * 60)
        print("ERROR OCCURRED")
        print(f"  {str(e)}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
