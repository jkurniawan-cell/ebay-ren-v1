# Airtable Data Refresh Guide

## Architecture: Local JSON Dump (No MCP Dependency)

```
Airtable API → dump_airtable.py → airtable_dump.json → Flask Backend → React Frontend
                (runs nightly)        (local file)
```

**Benefits:**
- ✅ No dependency on MCP server
- ✅ No Airtable API calls during the day (faster performance)
- ✅ No API rate limits
- ✅ Dashboard always available even if Airtable is down
- ✅ Data refreshes automatically every night

---

## Files

### Data Files
- **`backend/data/airtable_dump.json`** - Local JSON dump (284 KB, 514 launches)
- **`backend/data/dump.log`** - Log file for nightly refresh job

### Scripts
- **`backend/scripts/dump_airtable.py`** - Fetches data from Airtable and saves to JSON
- **`backend/scripts/setup_cron.sh`** - Installs daily cron job (runs at 2 AM)

### Backend Code
- **`backend/app/airtable_data.py`** - Reads from JSON file (replaces airtable_mcp.py)
- **`backend/app/airtable_mcp.py`** - ⚠️ DEPRECATED - kept for reference only

---

## Quick Start

### 1. Initial Data Dump

Run this once to create the initial JSON file:

```bash
python3 backend/scripts/dump_airtable.py
```

**Output:**
```
============================================================
AIRTABLE DATA DUMP SCRIPT
Started: 2026-04-23 13:56:55
============================================================

Fetching M0 priorities from Airtable...
  ✓ Fetched 31 M0 priorities in 1 pages

Fetching roadmap launches from Airtable...
  Page 1: +100 records (total: 100)
  ...
  Page 6: +14 records (total: 514)
  ✓ Fetched 514 launches in 6 pages

Transforming 514 records to REN format...
  ✓ Transformed 514 valid launches

Writing data to backend/data/airtable_dump.json...
  ✓ Saved to backend/data/airtable_dump.json

============================================================
DUMP COMPLETE
  Total Launches: 514
  Total M0 Priorities: 31
  File Size: 284.84 KB
  Completed: 2026-04-23 13:57:24
============================================================
```

### 2. Setup Daily Auto-Refresh (Optional)

Install a cron job to refresh data nightly at 2 AM:

```bash
cd backend/scripts
./setup_cron.sh
```

This adds a cron job:
```
0 2 * * * cd /Users/jkurniawan/ClaudeCode/REN_V3/backend && /usr/bin/python3 scripts/dump_airtable.py >> data/dump.log 2>&1
```

**Verify cron job:**
```bash
crontab -l
```

**View logs:**
```bash
tail -f backend/data/dump.log
```

### 3. Start Backend

The backend now reads from the JSON file (no API calls):

```bash
cd backend
python3 app.py
```

**Test:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "eBay REN API",
  "data_source": "local_json_dump",
  "last_updated": "2026-04-23T13:57:24.134814",
  "total_launches": 514
}
```

---

## Manual Data Refresh

### Option 1: Run Script Directly

```bash
python3 backend/scripts/dump_airtable.py
```

### Option 2: Run with Logging

```bash
python3 backend/scripts/dump_airtable.py >> backend/data/dump.log 2>&1
```

### Option 3: From Anywhere

```bash
cd /Users/jkurniawan/ClaudeCode/REN_V3
python3 backend/scripts/dump_airtable.py
```

**No need to restart backend** - it reads the file on each API request, so new data is available immediately.

---

## Troubleshooting

### Error: "AIRTABLE_API_KEY not set"

**Cause:** Missing `.env` file or API key not set.

**Fix:**
```bash
cd backend
echo "AIRTABLE_API_KEY=patXXXXXXXXXXXXXXX" >> .env
```

### Error: "Airtable data dump not found"

**Cause:** JSON file doesn't exist yet.

**Fix:** Run initial dump:
```bash
python3 backend/scripts/dump_airtable.py
```

### Dashboard shows old data

**Cause:** JSON file hasn't been refreshed.

**Fix:** Run manual refresh:
```bash
python3 backend/scripts/dump_airtable.py
```

### Cron job not running

**Check if cron job exists:**
```bash
crontab -l | grep dump_airtable
```

**Check cron logs (macOS):**
```bash
log show --predicate 'process == "cron"' --last 1h
```

**Check dump logs:**
```bash
tail -50 backend/data/dump.log
```

**Test cron job manually:**
```bash
cd /Users/jkurniawan/ClaudeCode/REN_V3/backend
/usr/bin/python3 scripts/dump_airtable.py >> data/dump.log 2>&1
```

---

## Data Structure

### JSON Dump Format

```json
{
  "metadata": {
    "last_updated": "2026-04-23T13:57:24.134814",
    "total_launches": 514,
    "total_m0_priorities": 31,
    "source": "airtable_api",
    "base_id": "appXFsy8DcRl4C5mx",
    "roadmap_table_id": "tblV23SJ1OBxebWrt"
  },
  "m0_priorities": {
    "recXXXXXXXXXXXXXX": "Trust",
    "recYYYYYYYYYYYYYY": "Shipping",
    ...
  },
  "launches": [
    {
      "key_launch_name": "Increase fast shipping coverage (EDD)",
      "m0_priority_name": "Shipping",
      "m1_initiative_name": "Horizontal Capabilities and Tech Foundations",
      "start_quarter": "Q1-2026",
      "end_quarter": "Q3-2026",
      "initial_start_quarter": "Q1-2026",
      "initial_end_quarter": "Q3-2026",
      "geo_category": "Global",
      "geo_category_details": "Global",
      "roadmap_change": null,
      "change_rationale": null,
      "change_rationale_comment": null,
      "cross_priority_dependency": null
    },
    ...
  ]
}
```

---

## Changing Refresh Schedule

Edit the cron job:

```bash
crontab -e
```

**Examples:**

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Daily 2 AM | `0 2 * * *` | Default (recommended) |
| Daily 6 AM | `0 6 * * *` | Morning refresh |
| Every 12 hours | `0 */12 * * *` | Twice daily |
| Weekdays only | `0 2 * * 1-5` | Mon-Fri at 2 AM |
| Every hour | `0 * * * *` | Hourly (not recommended) |

---

## Migration from MCP/API

### What Changed

| Before (MCP/API) | After (JSON Dump) |
|-----------------|------------------|
| `app/airtable_mcp.py` | `app/airtable_data.py` |
| Live API calls on every request | Read from local JSON file |
| MCP server dependency | No dependencies |
| SSL certificate issues | No network calls |
| API rate limits | No limits |
| Slower (network latency) | Faster (local file) |

### Backward Compatibility

The old `airtable_mcp.py` is kept for reference but **not used**. The new `airtable_data.py` has the same interface:

```python
from app.airtable_data import get_roadmap_data, get_unique_m0_priorities

data = get_roadmap_data()  # Same return format
```

---

## Best Practices

1. **Initial Setup:** Run `dump_airtable.py` before starting the backend for the first time
2. **Auto-Refresh:** Use cron job for automatic nightly refresh
3. **Manual Refresh:** Run dump script after making changes in Airtable during the day
4. **Logs:** Monitor `backend/data/dump.log` for errors
5. **Git:** Add `backend/data/airtable_dump.json` to `.gitignore` (data is user-specific)

---

## Summary

✅ **No MCP dependency**  
✅ **No Airtable API calls during the day**  
✅ **Faster dashboard performance**  
✅ **Automatic nightly refresh at 2 AM**  
✅ **Manual refresh anytime: `python3 backend/scripts/dump_airtable.py`**

**Dashboard:** http://localhost:3000/timeline  
**Backend:** http://localhost:5000/api/health
