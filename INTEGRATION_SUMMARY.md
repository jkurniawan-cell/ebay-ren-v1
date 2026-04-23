# REN V3 Airtable Integration - Final Summary

## Architecture: Read-Only Airtable Sync

**Data Flow:**
```
Airtable (via MCP) → Flask Backend → React Frontend
                ↓
         (Read-Only - No Write-Back)
```

### Key Decisions

1. **✅ Read-Only from Airtable** - Never write back to Airtable
2. **✅ No CSV Upload** - Remove CSV upload functionality entirely
3. **✅ No Drafts/Snapshots** - Remove SQLite draft/snapshot system
4. **✅ Live Data Only** - Display real-time data from Airtable
5. **✅ Planning Cycle** - Will be added later (not in initial version)

---

## Field Mapping

### Roadmap Item Local Table → REN App

| REN Field | Airtable Field | Field ID | Type | Notes |
|-----------|---------------|----------|------|-------|
| **key_launch_name** | Roadmap Item Name | `flduuIoUIZojWLFtU` | singleLineText | ✅ |
| **m0_priority_name** | Priorities (M0) | `fldCVODBAs5vPPBEg` | multipleRecordLinks | Extract `.name` |
| **m1_initiative_name** | Roadmap Item Category | `fldOfNNWTC7oDyzeS` | multilineText | Use this instead of linked Plays |
| **start_quarter** | H2 Start Quarter | `fld21yjdXCTBn7Arb` | singleSelect | Extract `.name` |
| **end_quarter** | H2 End Quarter | `fldEQwylawUJpmKSd` | singleSelect | Extract `.name` |
| **initial_start_quarter** | Original H2 Start Quarter | `flddxxHSZ604WOvKA` | singleSelect | If changed |
| **initial_end_quarter** | Original H2 End Quarter | `fldxjqD6sQiBOwn9u` | singleSelect | If changed |
| **geo_category** | Geo Category | `fldWLspsBpzgIejWt` | singleSelect | ✅ NEW FIELD |
| **geo_category_details** | Geo | `fldnAHV614gkQF1ex` | multipleSelects | Array of markets |
| **roadmap_change** | Roadmap Timing Change | `fldS9Crp4RZmAC4Hk` | singleSelect | Deferred/Accelerated/New |
| **change_rationale** | Change Rationale Status | `fldYO25QKXiWhbgqR` | singleSelect | Strategic/Constrained |
| **change_rationale_comment** | Change Rationale Comments | `fld2yy4n9BhH9NY7X` | multilineText | Free text |
| **cross_priority_dependency** | Cross Priority Dependency / Partnership | `fldFJILTHhtSPgsg5` | singleSelect | ✅ NEW FIELD |

---

## Sample Data Verification

### ✅ Record with Changes: "Excessive UPI Policy Ph2"
```json
{
  "key_launch_name": "Excessive UPI Policy Ph2",
  "m0_priority_name": "Trust",
  "m1_initiative_name": "UPI- Consequences",
  "start_quarter": "Q2-2026",
  "end_quarter": "Q2-2026",
  "initial_start_quarter": "Q1-2026",  // ✅ Changed!
  "initial_end_quarter": "Q1-2026",     // ✅ Changed!
  "roadmap_change": "Deferred",          // ✅ Present
  "change_rationale": "Strategic Reason", // ✅ Present
  "change_rationale_comment": "Why: Auctions expanded...", // ✅ Present
  "geo_category": "Global",
  "geo_category_details": ["Global"]
}
```

### ✅ Record with Geo Category: "DE eIS"
```json
{
  "key_launch_name": "DE eIS",
  "m0_priority_name": "C2C",
  "start_quarter": "Q3-2026",
  "end_quarter": "Q3-2026",
  "initial_start_quarter": "Q2-2026",
  "initial_end_quarter": "Q2-2026",
  "geo_category": "Big 3",               // ✅ NEW FIELD WORKS!
  "geo_category_details": ["DE"]
}
```

### Total Records with Changes
- **34 records** have Original Start Quarter populated (changed dates)
- **10 records** fetched show various change types (Deferred, no change)
- **Geo Category field** is working and populated

---

## What to Remove from Backend

### Files to Delete
- ❌ `app/csv_parser.py` - No longer needed
- ❌ `app/snapshot_manager.py` - No drafts/snapshots
- ❌ `app/database.py` - No SQLite needed
- ❌ `backend/ebay_ren.db` - Remove SQLite database

### Files to Modify
- ✏️ `app.py` - Remove CSV upload endpoint, remove draft/snapshot routes
- ✏️ `app/data_merger.py` - Replace with direct Airtable → JSON conversion
- ✏️ `app/filters.py` - Keep filtering logic, update data source
- ✏️ Replace `app/airtable_client.py` with **`app/airtable_mcp.py`** (new MCP-based client)

### Frontend Changes
- ❌ Remove `CSVUpload.tsx` component
- ❌ Remove `ApproveButton.tsx` component
- ❌ Remove `ModeToggle.tsx` component (no more draft/approved modes)
- ✏️ Update `lib/api.ts` - Remove CSV upload, draft, snapshot methods
- ✏️ Update `app/page.tsx` - Remove mode toggle, simplify to live view only

---

## New Backend Architecture

### app/airtable_mcp.py (NEW)
```python
"""
Airtable MCP client for REN V3
Fetches roadmap data directly from Airtable via MCP
"""
from mcp import mcp__airtable__list_records_for_table

def get_all_launches():
    """Fetch all launches from Airtable"""
    return mcp__airtable__list_records_for_table(
        baseId="appXFsy8DcRl4C5mx",
        tableId="tblV23SJ1OBxebWrt",
        pageSize=1000  # Fetch all 514 records
    )

def transform_to_ren_format(airtable_records):
    """Transform Airtable records to REN app format"""
    launches = []
    for record in airtable_records:
        fields = record['cellValuesByFieldId']
        
        # Extract M0 priority name
        m0_list = fields.get('fldCVODBAs5vPPBEg', [])
        m0_name = m0_list[0]['name'] if m0_list else None
        
        # Extract geo category
        geo_cat = fields.get('fldWLspsBpzgIejWt', {})
        geo_category = geo_cat.get('name') if geo_cat else None
        
        # Extract geo details
        geo_list = fields.get('fldnAHV614gkQF1ex', [])
        geo_details = [g['name'] for g in geo_list]
        
        launch = {
            "key_launch_name": fields.get('flduuIoUIZojWLFtU'),
            "m0_priority_name": m0_name,
            "m1_initiative_name": fields.get('fldOfNNWTC7oDyzeS'),
            "start_quarter": fields.get('fld21yjdXCTBn7Arb', {}).get('name'),
            "end_quarter": fields.get('fldEQwylawUJpmKSd', {}).get('name'),
            "initial_start_quarter": fields.get('flddxxHSZ604WOvKA', {}).get('name'),
            "initial_end_quarter": fields.get('fldxjqD6sQiBOwn9u', {}).get('name'),
            "geo_category": geo_category,
            "geo_category_details": ", ".join(geo_details) if geo_details else None,
            "roadmap_change": fields.get('fldS9Crp4RZmAC4Hk', {}).get('name'),
            "change_rationale": fields.get('fldYO25QKXiWhbgqR', {}).get('name'),
            "change_rationale_comment": fields.get('fld2yy4n9BhH9NY7X'),
            "cross_priority_dependency": fields.get('fldFJILTHhtSPgsg5', {}).get('name')
        }
        launches.append(launch)
    
    return launches
```

### app.py (SIMPLIFIED)
```python
from app.airtable_mcp import get_all_launches, transform_to_ren_format
from app.filters import apply_filters

@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    """Get filtered roadmap data from Airtable"""
    # Get filter parameters
    m0_priorities = request.args.getlist('m0_priorities')
    markets = request.args.getlist('markets')
    # ... other filters
    
    # Fetch from Airtable via MCP
    airtable_data = get_all_launches()
    launches = transform_to_ren_format(airtable_data)
    
    # Apply filters
    filtered = apply_filters(launches, m0_priorities, markets, ...)
    
    return jsonify({"launches": filtered})

# Remove these routes:
# - /api/upload-csv ❌
# - /api/snapshots ❌
# - /api/drafts ❌
```

---

## Questions Answered ✅

1. **geo_category & cross_priority_dependency** → ✅ Fields added and working
2. **Planning cycle** → Will be added later (not in initial version)
3. **Fetch 5-10 records** → ✅ Done, verified change tracking works
4. **CSV Upload** → ✅ Removed entirely
5. **Read-only** → ✅ Confirmed, never write back to Airtable
6. **Drafts** → ✅ Removed, no SQLite needed

---

## Next Steps

**Ready to proceed with:**

1. ✅ Create `app/airtable_mcp.py` - MCP client for fetching data
2. ✅ Update `app.py` - Simplify routes, remove CSV/draft/snapshot endpoints
3. ✅ Update frontend - Remove CSV upload, mode toggle, approve button
4. ✅ Test with real Airtable data
5. ✅ Deploy!

**Confirm to begin implementation?** 🚀
