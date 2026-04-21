# AIRTABLE PRIMARY INPUT - ARCHITECTURE REDESIGN

## CRITICAL CHANGE: CSV → AIRTABLE

**Before:** CSV upload → Parse → PostgreSQL → Dashboard  
**Now:** Airtable (all data) → Sync → PostgreSQL (cache) → Dashboard

---

## NEW DATA FLOW

```
Airtable Base (Source of Truth)
├── Priorities (M0) ✓ exists
├── Plays (M1) ✓ exists
└── Key Launches (NEW TABLE) ← ALL roadmap data
        ↓
    Sync Mechanism (choose 1):
    - Manual refresh button
    - Scheduled job (hourly/daily)
    - Webhook (real-time)
        ↓
PostgreSQL (Cache + Snapshots)
├── RoadmapDraft → Latest Airtable sync
└── RoadmapSnapshot → Frozen versions
        ↓
    Dashboard API
        ↓
    Frontend (unchanged)
```

---

## AIRTABLE SCHEMA REQUIRED

### NEW TABLE: Key Launches (`tblXXXXXXXXXXXXXXX`)

**Fields needed:**

| Field Name                    | Field Type          | Airtable ID         | Notes                          |
|-------------------------------|---------------------|---------------------|--------------------------------|
| M0 Priority                   | Link to Priorities  | fldXXXXXXXXXXXXXXX  | Links to M0 table              |
| M1 Initiative                 | Link to Plays       | fldXXXXXXXXXXXXXXX  | Links to M1 table              |
| Key Launch Name               | Single line text    | fldXXXXXXXXXXXXXXX  | Primary field                  |
| Original Start Quarter        | Single select       | fldXXXXXXXXXXXXXXX  | Q1-2026, Q2-2026, etc          |
| Original End Quarter          | Single select       | fldXXXXXXXXXXXXXXX  | Q1-2026, Q2-2026, etc          |
| Start Quarter                 | Single select       | fldXXXXXXXXXXXXXXX  | Updated timeline               |
| End Quarter                   | Single select       | fldXXXXXXXXXXXXXXX  | Updated timeline               |
| Geo Category                  | Single select       | fldXXXXXXXXXXXXXXX  | Big 3, Remaining Big 4, Global |
| Target Geos                   | Multiple select     | fldXXXXXXXXXXXXXXX  | US, UK, DE, FR, etc            |
| Roadmap Change                | Single select       | fldXXXXXXXXXXXXXXX  | No Change, New, Accelerated, Deferred |
| Change Rationale              | Single select       | fldXXXXXXXXXXXXXXX  | Dropdown options               |
| Change Rationale Comment      | Long text           | fldXXXXXXXXXXXXXXX  | Free-text                      |
| Cross-Priority Dependencies   | Multiple select     | fldXXXXXXXXXXXXXXX  | GBX, Trust, GCX, etc           |
| Planning Cycle                | Single select       | fldXXXXXXXXXXXXXXX  | H2 2026, Q3 2026, etc          |
| Status                        | Single select       | fldXXXXXXXXXXXXXXX  | Draft, Approved (optional)     |
| Last Modified                 | Last modified time  | fldXXXXXXXXXXXXXXX  | Auto                           |
| Created By                    | Created by          | fldXXXXXXXXXXXXXXX  | Auto                           |

**Quarter Select Options:**
- Q1-2025, Q2-2025, Q3-2025, Q4-2025
- Q1-2026, Q2-2026, Q3-2026, Q4-2026
- Q1-2027, Q2-2027, Q3-2027, Q4-2027

**Cross-Priority Dependencies Options:**
All M0 names (GBX, Trust, GCX, Payments, etc.)

---

## CODE CHANGES REQUIRED

### 1. Backend: Replace CSV Parser with Airtable Sync

**DELETE:**
- `app/csv_parser.py` (or keep for backup CSV export)
- `POST /api/upload-csv` endpoint

**ADD:**
- `app/airtable_sync.py` - Fetch all launches from Airtable

**NEW FILE: `app/airtable_sync.py`**
```python
"""
Sync Key Launches from Airtable to PostgreSQL
"""
from app.airtable_client import AirtableClient
from app.snapshot_manager import SnapshotManager
from typing import List, Dict

class AirtableSync:
    
    @staticmethod
    def fetch_all_launches(planning_cycle: str = None) -> List[Dict]:
        """
        Fetch all Key Launches from Airtable.
        
        Args:
            planning_cycle: Filter by planning cycle (e.g., "H2 2026")
        
        Returns:
            List of launch dicts
        """
        airtable = AirtableClient()
        table_id = 'tblXXXXXXXXXXXXXXX'  # Key Launches table
        
        # Build filter formula
        formula = None
        if planning_cycle:
            formula = f"{{Planning Cycle}} = '{planning_cycle}'"
        
        # Fetch all records (handles pagination)
        records = airtable._fetch_table(table_id, formula=formula)
        
        launches = []
        for record in records:
            fields = record.get('fields', {})
            
            # Parse linked records (M0, M1)
            m0_link = fields.get('fldXXX_M0_Link', [])
            m1_link = fields.get('fldXXX_M1_Link', [])
            
            # Fetch M0/M1 names from linked records
            m0_name = airtable.get_linked_record_name(m0_link[0]) if m0_link else ''
            m1_name = airtable.get_linked_record_name(m1_link[0]) if m1_link else ''
            
            # Parse select fields
            geo_category = fields.get('fldXXX_Geo_Category', {})
            if isinstance(geo_category, dict):
                geo_category = geo_category.get('name', '')
            
            # Parse multiple select
            target_geos = fields.get('fldXXX_Target_Geos', [])
            if isinstance(target_geos, list):
                target_geos = [g.get('name') if isinstance(g, dict) else g for g in target_geos]
            
            cross_deps = fields.get('fldXXX_Cross_Deps', [])
            if isinstance(cross_deps, list):
                cross_deps = [d.get('name') if isinstance(d, dict) else d for d in cross_deps]
            
            launch = {
                'airtable_id': record['id'],
                'm0_priority_name': m0_name,
                'm1_initiative_name': m1_name,
                'key_launch_name': fields.get('fldXXX_Launch_Name', ''),
                'original_start_quarter': fields.get('fldXXX_Original_Start', {}).get('name', ''),
                'original_end_quarter': fields.get('fldXXX_Original_End', {}).get('name', ''),
                'updated_start_quarter': fields.get('fldXXX_Start', {}).get('name', ''),
                'updated_end_quarter': fields.get('fldXXX_End', {}).get('name', ''),
                'geo_category': geo_category,
                'target_geos': ', '.join(target_geos),
                'target_geos_list': target_geos,
                'roadmap_change': fields.get('fldXXX_Change', {}).get('name', 'No Change'),
                'change_rationale': fields.get('fldXXX_Rationale', {}).get('name', ''),
                'change_rationale_comment': fields.get('fldXXX_Comment', ''),
                'cross_priority_dependencies': ', '.join(cross_deps),
                'cross_priority_dependencies_list': cross_deps,
                'planning_cycle': fields.get('fldXXX_Planning_Cycle', {}).get('name', ''),
                'last_modified': fields.get('fldXXX_Modified', ''),
            }
            
            # Detect shifted
            launch['shifted'] = (
                launch['original_start_quarter'] and 
                launch['updated_start_quarter'] and 
                launch['original_start_quarter'] != launch['updated_start_quarter']
            )
            
            launches.append(launch)
        
        return launches
    
    @staticmethod
    def sync_to_draft(planning_cycle: str) -> Dict:
        """
        Sync Airtable data to draft table.
        
        Args:
            planning_cycle: Planning cycle to sync
        
        Returns:
            Draft info
        """
        launches = AirtableSync.fetch_all_launches(planning_cycle)
        
        csv_data = {
            'launches': launches,
            'total_count': len(launches),
            'synced_from': 'airtable',
            'synced_at': datetime.utcnow().isoformat()
        }
        
        draft_info = SnapshotManager.save_draft(planning_cycle, csv_data)
        return draft_info
```

**UPDATE: `app/airtable_client.py`**
```python
def _fetch_table(self, table_id: str, fields: List[str] = None, formula: str = None) -> List[Dict]:
    """Fetch all records from a table with optional filter."""
    url = f'{self.base_url}/{table_id}'
    params = {}
    if fields:
        params['fields[]'] = fields
    if formula:
        params['filterByFormula'] = formula

    records = []
    offset = None

    while True:
        if offset:
            params['offset'] = offset

        response = requests.get(url, headers=self.headers, params=params, verify=False)
        response.raise_for_status()
        data = response.json()

        records.extend(data.get('records', []))

        offset = data.get('offset')
        if not offset:
            break

    return records

def get_linked_record_name(self, record_id: str) -> str:
    """Get name of linked record by ID (for M0/M1 lookups)."""
    # Cache linked record names to avoid repeated API calls
    cache_key = f'linked_record_{record_id}'
    cached = self._get_from_cache(cache_key)
    if cached:
        return cached
    
    # Determine which table this record belongs to
    # Try M0 table first, then M1
    for table_id in ['tblwZaISS19No2Ks3', 'tblmOUHPxzTFNV345']:
        try:
            url = f'{self.base_url}/{table_id}/{record_id}'
            response = requests.get(url, headers=self.headers, verify=False)
            if response.status_code == 200:
                data = response.json()
                # Get first text field as name
                fields = data.get('fields', {})
                name = list(fields.values())[0] if fields else ''
                self._set_cache(cache_key, name)
                return name
        except:
            continue
    
    return ''
```

**UPDATE: `app.py`**
```python
from app.airtable_sync import AirtableSync

@app.route('/api/sync-airtable', methods=['POST'])
def sync_airtable():
    """
    Manually sync Airtable data to draft.
    
    Request Body:
        - planning_cycle: Planning cycle to sync (e.g., "H2 2026")
    
    Response:
        - success: bool
        - message: str
        - draft_info: Draft metadata
    """
    try:
        data = request.json
        planning_cycle = data.get('planning_cycle', 'H2 2026')
        
        draft_info = AirtableSync.sync_to_draft(planning_cycle)
        
        return jsonify({
            'success': True,
            'message': f'Synced Airtable data for {planning_cycle}',
            'draft_info': draft_info
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error syncing Airtable: {str(e)}'
        }), 500

# Keep CSV upload as backup/migration tool
@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    """CSV upload (backup method for migration)."""
    # Keep existing implementation
    pass
```

---

### 2. Frontend: Replace CSV Upload with Sync Button

**UPDATE: `components/CSVUpload.tsx`** → **`components/AirtableSync.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface AirtableSyncProps {
  planningCycle: string;
  onSyncComplete: () => void;
}

export function AirtableSync({ planningCycle, onSyncComplete }: AirtableSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');

    try {
      const result = await apiClient.syncAirtable(planningCycle);
      setMessage(`✓ Synced ${result.draft_info.total_launches} launches from Airtable`);
      onSyncComplete();
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing from Airtable...' : 'Refresh from Airtable'}
      </Button>
      {message && (
        <span className={`text-sm ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
```

**UPDATE: `lib/api.ts`**
```typescript
class ApiClient {
  // ... existing methods
  
  async syncAirtable(planningCycle: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/sync-airtable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planning_cycle: planningCycle }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sync failed');
    }
    
    return response.json();
  }
  
  // Keep uploadCSV for backup
  async uploadCSV(file: File, planningCycle: string): Promise<UploadCSVResponse> {
    // existing implementation
  }
}
```

**UPDATE: `app/page.tsx`**
```typescript
import { AirtableSync } from '@/components/AirtableSync';

// Replace CSVUpload component with:
<AirtableSync
  planningCycle={selectedPlanningCycle}
  onSyncComplete={() => refetchRoadmapData()}
/>

// Keep CSV upload in "Settings" or "Admin" panel as backup
```

---

## SYNC STRATEGIES (CHOOSE ONE)

### Option 1: Manual Refresh (Simplest - MVP)
**How:** Dashboard has "Refresh from Airtable" button  
**When:** Users click when data updated in Airtable  
**Latency:** Up to user (could be hours/days stale)  
**Complexity:** Low (button → API call → sync)

**Pros:**
- Simplest to build (Day 1)
- No webhooks, no cron jobs
- Users control when to sync

**Cons:**
- Dashboard stale until manual refresh
- Users forget to sync
- No automatic updates

---

### Option 2: Scheduled Sync (Automated)
**How:** Cron job runs hourly/daily, syncs Airtable → PostgreSQL  
**When:** Every hour (configurable)  
**Latency:** Max 1 hour stale  
**Complexity:** Medium (cron + job queue)

**Implementation:**
```python
# Background job (cron or Celery)
@app.cli.command()
def sync_airtable_job():
    """Run Airtable sync for all active planning cycles."""
    cycles = ['H2 2026', 'Q3 2026', 'Q4 2026']  # Get from config
    for cycle in cycles:
        try:
            AirtableSync.sync_to_draft(cycle)
            print(f'Synced {cycle}')
        except Exception as e:
            print(f'Error syncing {cycle}: {e}')

# Crontab: 0 * * * * cd /app && python -m flask sync-airtable-job
```

**Pros:**
- Always fresh (max 1hr stale)
- No user action needed
- Predictable load

**Cons:**
- Unnecessary syncs if no changes
- Cron infrastructure needed
- Airtable API quota usage

---

### Option 3: Webhook (Real-time)
**How:** Airtable triggers webhook on record change → sync immediately  
**When:** Real-time (seconds delay)  
**Latency:** <10 seconds  
**Complexity:** High (webhook endpoint + security)

**Implementation:**
```python
@app.route('/api/airtable-webhook', methods=['POST'])
def airtable_webhook():
    """
    Airtable webhook endpoint.
    Triggered when Key Launches table changes.
    """
    # Verify webhook signature (Airtable doesn't natively support this)
    # Use Zapier/Make.com as intermediary for security
    
    payload = request.json
    planning_cycle = payload.get('planning_cycle')
    
    # Trigger sync
    AirtableSync.sync_to_draft(planning_cycle)
    
    return jsonify({'status': 'synced'})

# Setup in Airtable:
# 1. Create Automation: "When record updated in Key Launches"
# 2. Action: "Send webhook to https://your-app.com/api/airtable-webhook"
# 3. Pass planning_cycle in payload
```

**Pros:**
- Real-time updates
- No polling overhead
- Efficient (only sync on change)

**Cons:**
- Airtable native webhooks limited (use Automations)
- Security concerns (need signature verification)
- Complex error handling (webhook failures)

---

### Recommendation: **Option 1 (Manual) for MVP, Option 2 (Scheduled) for Production**

**Week 1 (MVP):** Manual refresh button  
**Week 2-3:** Add hourly cron sync  
**Post-launch:** Consider webhooks if real-time required

---

## WHAT BREAKS / WHAT STAYS

### BREAKS ❌
1. **CSV Upload UI** - Replace with Airtable sync button
2. **CSV Parser** - No longer used (keep for backup export)
3. **Validation logic** - Airtable enforces schema, not CSV parser
4. **Upload flow testing** - Now test Airtable sync flow

### STAYS ✅
1. **PostgreSQL schema** - RoadmapDraft/Snapshot unchanged (still store JSON)
2. **Frontend components** - Timeline, filters, cards all same
3. **Snapshot/approval workflow** - Exactly the same
4. **Data merger** - Still combines M0/M1 metadata with launches
5. **Filters** - No changes
6. **API endpoints** - Only `/upload-csv` → `/sync-airtable`

---

## NEW SPRINT TIMELINE

### WEEK 1: MVP WITH AIRTABLE SYNC

**Day 1 (Mon): Airtable Schema Setup**
**AM:**
- Create Key Launches table in Airtable
- Add all 15 fields (see schema above)
- Populate test data (20 launches from 2 teams)

**PM:**
- Get field IDs from Airtable API
- Update column mapping in code
- Test API fetch with Postman

**Deliverable:** Airtable table ready, field IDs captured

---

**Day 2 (Tue): Backend Sync Logic**
**AM:**
- Build `airtable_sync.py` - fetch_all_launches()
- Handle linked records (M0/M1 lookups)
- Parse select fields (geo, change status)

**PM:**
- Build sync_to_draft() - save to PostgreSQL
- Add `/api/sync-airtable` endpoint
- Test with real Airtable data

**Deliverable:** Backend can sync Airtable → PostgreSQL

---

**Day 3 (Wed): Frontend Sync UI**
**AM:**
- Build AirtableSync component (replace CSVUpload)
- Wire to `/api/sync-airtable` endpoint
- Show loading + success/error states

**PM:**
- Integrate in dashboard (replace upload button)
- Test full flow: Click sync → data appears in timeline
- Fix any mapping issues

**Deliverable:** Can sync from UI, timeline updates

---

**Day 4 (Thu): Data Validation + Error Handling**
**AM:**
- Validate Airtable data: Missing M0/M1 links, empty quarters
- Handle malformed data gracefully
- Error messages for users ("Launch XYZ missing M0")

**PM:**
- Test with bad data (missing fields, wrong types)
- Pagination testing (100+ launches)
- Performance check (400 launches sync time)

**Deliverable:** Robust error handling

---

**Day 5 (Fri): MVP Demo**
**AM:**
- Load real data from 3-5 teams into Airtable
- Sync to dashboard
- Test filters, approve snapshot

**PM:**
- Jordan demo: Edit launch in Airtable → Sync → See changes
- Note feedback
- Deploy to staging

**Deliverable:** Live demo with Airtable as source

---

### WEEK 2-3: Same as before (Production + Optimize)
- Day 6-10: Add scheduled sync, polish, deploy production
- Day 11-15: Performance, mobile, docs, onboarding

---

## ADVANTAGES OF AIRTABLE PRIMARY

**Now that data is in Airtable:**

1. **Collaborative editing** - Teams edit in Airtable, no CSV needed ✅
2. **Field validation** - Airtable enforces types (select, link, date) ✅
3. **Change history** - Airtable tracks who edited when ✅
4. **Comments** - Airtable native comments per launch ✅
5. **Mobile** - Teams can edit from Airtable mobile app ✅
6. **Relational data** - M0/M1 links auto-maintained ✅

**Still get benefits of PostgreSQL cache:**
- Fast dashboard reads (30-50ms)
- Snapshots work (freeze PostgreSQL, not Airtable)
- Resilient (if Airtable down, show last-synced data)

**Best of both worlds** ✅

---

## MIGRATION PLAN (CSV → AIRTABLE)

**Step 1:** Create Key Launches table in Airtable (Day 1)

**Step 2:** Migrate existing CSV data to Airtable
- Export current drafts from PostgreSQL
- Format as CSV
- Import to Airtable Key Launches table

**Step 3:** Train teams on Airtable editing (instead of CSV)

**Step 4:** Switch dashboard to Airtable sync (Day 2-3)

**Step 5:** Deprecate CSV upload (keep as backup for 1 month)

---

## RISKS & MITIGATION

**Risk 1:** Airtable field IDs change if table recreated  
**Mitigation:** Document field IDs, use environment variables

**Risk 2:** Linked record lookups slow (N+1 queries)  
**Mitigation:** Batch fetch all M0/M1 records once, cache mapping

**Risk 3:** 400 launches = 4 API requests (pagination)  
**Mitigation:** Acceptable for sync (happens in background), not per page load

**Risk 4:** Teams delete critical data in Airtable  
**Mitigation:** PostgreSQL snapshots preserve history, Airtable trash recovery

**Risk 5:** Airtable schema changes break sync  
**Mitigation:** Schema validation in code, error alerts, fallback to last-synced data

---

## FINAL ANSWER: WHAT CHANGES

**BUILD CHANGES:**
- **+1 day:** Airtable table setup + field mapping
- **+1 day:** Airtable sync logic (replace CSV parser)
- **+0.5 day:** Frontend sync button (replace upload UI)
- **Total: +2.5 days to Week 1**

**ARCHITECTURE CHANGES:**
- Input: CSV → Airtable
- Backend: CSVParser → AirtableSync
- Frontend: Upload button → Sync button
- Data flow: CSV file → Airtable API calls
- Validation: Code → Airtable schema

**WHAT DOESN'T CHANGE:**
- PostgreSQL cache (same schema)
- Snapshots (same workflow)
- Frontend visualization (Timeline, filters, cards)
- Dashboard UX (same for Jordan)

**NET IMPACT: +2-3 days build time, much better long-term (collaborative editing, validation, mobile)**

**Updated Week 1:**
- Day 1: Airtable schema + setup
- Day 2: Backend sync logic
- Day 3: Frontend sync UI
- Day 4: Error handling + testing
- Day 5: Demo (same)

**Still ships Week 1 MVP, just 2 days for Airtable integration instead of CSV parser (which was already built).**
