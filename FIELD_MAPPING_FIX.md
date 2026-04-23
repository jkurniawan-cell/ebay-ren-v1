# Field Mapping Fix - Backend → Frontend

## Problem Summary

**Root Cause:** Backend was returning Airtable field names directly, but frontend components expected different field names and data types from the old CSV-based system.

---

## Issues Found

### Issue 1: Field Name Mismatches

| Backend (Airtable) | Frontend Expected | Issue |
|-------------------|-------------------|-------|
| `cross_priority_dependency` (string) | `cross_priority_dependencies_list` (array) | ❌ Wrong name + wrong type |
| `geo_category_details` (string) | `target_geos_list` (array) | ❌ Wrong name + wrong type |
| `start_quarter` | `updated_start_quarter` | ❌ Wrong name |
| `end_quarter` | `updated_end_quarter` | ❌ Wrong name |
| `initial_start_quarter` | `original_start_quarter` | ❌ Wrong name |
| `initial_end_quarter` | `original_end_quarter` | ❌ Wrong name |

### Issue 2: Missing Fields

| Field | Frontend Usage | Status |
|-------|---------------|--------|
| `highlighted` | Cross-priority filtering UI | ❌ Not in backend |
| `roadmap_ownership` | Delivery owner (removed from filters but still in types) | ❌ Not in backend |

### Issue 3: Type Mismatches

- `cross_priority_dependency`: Backend sent **string** ("Trust, GBX"), Frontend expected **array** `["Trust", "GBX"]`
- `geo_category_details`: Backend sent **string** ("US, UK, DE"), Frontend expected **array** `["US", "UK", "DE"]`

---

## Errors Encountered

### Error 1: `uploadSuccess is not defined`
**File:** `app/timeline/page.tsx:382`  
**Cause:** Incomplete cleanup - removed state variables but left UI code  
**Fix:** Removed upload handler functions and status message UI

### Error 2: `launch.cross_priority_dependencies_list is not iterable`
**File:** `components/Timeline.tsx:27`  
**Cause:** Backend sent string, frontend tried to spread it as array  
**Fix:** Backend now parses string into array

---

## Solution Applied

### Backend: `app/data_merger.py`

Added field transformation logic in both `merge_data()` and `csv_only_data()`:

```python
# 1. Parse geo_category_details into target_geos_list array
geo_details = launch.get('geo_category_details', '')
if geo_details and isinstance(geo_details, str):
    launch['target_geos_list'] = [g.strip() for g in geo_details.split(',') if g.strip()]
else:
    launch['target_geos_list'] = []

# 2. Parse cross_priority_dependency into cross_priority_dependencies_list array
cross_dep = launch.get('cross_priority_dependency', '')
if cross_dep and isinstance(cross_dep, str):
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
    launch['effective_countries_list'] = get_effective_countries(
        launch.get('geo_category', ''),
        launch.get('geo_category_details', '')
    )

# 5. Add missing fields with defaults
launch['highlighted'] = False
launch['roadmap_ownership'] = launch.get('roadmap_ownership', '')
```

---

## Verification

### Backend API Response (Sample)

```bash
curl 'http://localhost:5000/api/roadmap' | jq '.data[0].m1_initiatives[0].key_launches[0]'
```

**Result:**
```json
{
  "key_launch_name": "Increase fast shipping coverage (EDD)",
  "target_geos_list": ["Global"],               ✅ Array
  "cross_priority_dependencies_list": [],       ✅ Array
  "updated_start_quarter": "Q1-2026",           ✅ Renamed
  "updated_end_quarter": "Q3-2026",             ✅ Renamed
  "original_start_quarter": "Q1-2026",          ✅ Renamed
  "original_end_quarter": "Q3-2026",            ✅ Renamed
  "highlighted": false,                         ✅ Added
  "roadmap_ownership": ""                       ✅ Added
}
```

---

## Components Fixed

### Frontend
1. **app/timeline/page.tsx** - Removed upload handlers and status UI
2. **lib/api.ts** - Simplified to 3-parameter API
3. **components/FilterBar.tsx** - Removed obsolete props

### Backend
1. **app/data_merger.py** - Added field transformation layer
2. **app.py** - Already simplified (no changes needed)

---

## Status: ✅ FIXED

All field mapping issues resolved. Frontend should now display data correctly.

**Test:** Open http://localhost:3000/timeline
