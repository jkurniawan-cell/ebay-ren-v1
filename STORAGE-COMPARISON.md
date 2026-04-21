# STORAGE ARCHITECTURE COMPARISON

## CURRENT: JSON IN DATABASE (PostgreSQL/SQLite)

**How It Works:**
```
CSV Upload → Parse → JSON blob in database
RoadmapDraft.csv_data_json = {launches: [...], total_count: 400}
RoadmapSnapshot.csv_data_json = {launches: [...]}
```

### PROS ✅
1. **Fast reads:** Single DB query, no API calls, <50ms response
2. **No rate limits:** PostgreSQL handles 1000s req/sec
3. **Full control:** Query optimization, indexing, schema changes
4. **Offline capable:** No external dependency, works if Airtable down
5. **Version control:** Snapshots stored as immutable JSON blobs
6. **Free:** PostgreSQL/SQLite = no usage costs
7. **Atomic writes:** CSV upload = 1 transaction, no partial failures
8. **Search/filter:** SQL JSON operators (`WHERE json_data->>'m0' = 'GBX'`)
9. **Backup/restore:** Standard DB tools, point-in-time recovery
10. **Low latency:** Same datacenter as app, <1ms network

### CONS ❌
1. **Manual sync:** CSV upload required, not live
2. **No collaborative editing:** Teams can't edit directly in UI
3. **Duplicate data:** Airtable still exists for M0/M1 metadata
4. **Schema validation:** Must validate CSV columns in code
5. **No versioning per field:** Entire snapshot, not granular change tracking

---

## OPTION: AIRTABLE AS PRIMARY STORAGE

**How It Would Work:**
```
Airtable tables:
- Priorities (M0) ✓ exists
- Plays (M1) ✓ exists
- Key Launches (NEW) ← main data
  - M0 (link to Priorities)
  - M1 (link to Plays)
  - Launch name
  - Start quarter, End quarter
  - Geo category
  - Cross-priority dependencies
  - etc.

Dashboard → Airtable API → Fetch all launches → Render
```

### PROS ✅
1. **Live data:** No CSV upload, teams edit Airtable directly
2. **Collaborative:** Multiple users edit simultaneously
3. **Built-in UI:** Airtable interface for teams who hate CSV
4. **Field validation:** Airtable enforces types (select, date, link)
5. **Change history:** Airtable tracks edit timestamps + user
6. **Relational:** Links between M0/M1/launches auto-maintained
7. **Permissions:** Airtable workspace roles (admin, editor, viewer)
8. **Comments:** Airtable native comment threads per record
9. **Automation:** Airtable automations (notify on change, etc)
10. **Mobile app:** Teams can edit from Airtable mobile

### CONS ❌
1. **Slow reads:** API call = 200-500ms (vs <50ms DB), worse if paginated
2. **Rate limits:** 5 req/sec, 100k records/base limit
3. **Expensive:** $20/user/month for Pro (vs free PostgreSQL)
4. **No snapshots:** Airtable doesn't natively version entire dataset
5. **Network dependency:** Dashboard down if Airtable API fails
6. **Limited filtering:** Airtable API filterByFormula is clunky vs SQL
7. **No transactions:** Can't atomically update 400 launches (must batch)
8. **Pagination:** 100 records/request, must loop for large datasets
9. **Vendor lock-in:** Can't migrate easily, API changes break app
10. **Cache required:** Must cache to avoid hitting rate limits = complexity

---

## OPTION: HYBRID (BEST OF BOTH)

**Architecture:**
```
Source of Truth: Airtable (live collaborative data)
                    ↓
               Nightly sync or webhook trigger
                    ↓
              PostgreSQL (cache)
                    ↓
          Dashboard reads from DB (fast)
```

### PROS ✅
1. **Fast reads:** Dashboard queries PostgreSQL (<50ms)
2. **Live editing:** Teams edit Airtable, sync to DB
3. **Resilient:** If Airtable down, DB has last-synced data
4. **Snapshots:** PostgreSQL stores historical versions
5. **Best UX:** Collaborative editing + fast dashboard

### CONS ❌
1. **Sync complexity:** Need cron job or webhook to sync Airtable → DB
2. **Eventual consistency:** Dashboard data stale until next sync
3. **Two systems:** Airtable + PostgreSQL both need maintenance
4. **Conflict resolution:** What if DB edited during sync?

---

## PERFORMANCE COMPARISON

### Scenario: Load roadmap with 400 launches

| Storage          | Read Time | Write Time | Concurrent Users | Cost/Month |
|------------------|-----------|------------|------------------|------------|
| **PostgreSQL**   | 30-50ms   | 20ms       | 1000+            | $0-25      |
| **Airtable API** | 800-2000ms| 500ms      | 50 (rate limit)  | $320 (16 users) |
| **Hybrid**       | 30-50ms   | 500ms sync | 1000+            | $320       |

### Scenario: Filter by M0 + Market

| Storage          | Filter Time | Complexity |
|------------------|-------------|------------|
| **PostgreSQL**   | <10ms       | SQL WHERE clause |
| **Airtable API** | 500-1000ms  | filterByFormula string building + API call |
| **Hybrid**       | <10ms       | SQL on cached DB |

### Scenario: Approve snapshot (create immutable version)

| Storage          | Approach | Time |
|------------------|----------|------|
| **PostgreSQL**   | INSERT new row with JSON blob | 20ms |
| **Airtable API** | Must copy 400 records to new table/base | 2-5min |
| **Hybrid**       | INSERT from PostgreSQL cache | 20ms |

---

## AIRTABLE SPECIFIC PROBLEMS

### 1. Rate Limits
**Limit:** 5 requests/second per base
**Problem:** Dashboard with 5 concurrent users → each loads roadmap → 5 API calls/sec = maxed out
**Solution:** Cache in PostgreSQL or Redis

### 2. Pagination Hell
**Limit:** 100 records per API request
**Problem:** 400 launches = 4 API requests, sequential not parallel
**Code:**
```python
records = []
offset = None
while True:
    response = airtable.get('Key_Launches', offset=offset)
    records += response['records']
    offset = response.get('offset')
    if not offset:
        break
# 4 API calls = 800-2000ms total
```

### 3. No Snapshot Feature
**Problem:** Airtable doesn't version entire base at specific timestamp
**Workaround:** 
- Use Airtable API to fetch all data, store in PostgreSQL (defeats purpose)
- Create duplicate base per snapshot (manual, messy)
- Use Airtable Sync (paid add-on, not true versioning)

### 4. Filter Performance
**Problem:** Complex filters slow or impossible
**Example:** "Show launches where (M0=GBX OR M0=Trust) AND (Market=US OR Market=UK) AND roadmap_change=Deferred"
**Airtable filterByFormula:**
```javascript
filterByFormula: "AND(OR({M0}='GBX',{M0}='Trust'),OR({Market}='US',{Market}='UK'),{roadmap_change}='Deferred')"
// Still requires fetching ALL records, filtering client-side
```
**PostgreSQL:**
```sql
SELECT * FROM launches 
WHERE m0 IN ('GBX','Trust') 
  AND market IN ('US','UK') 
  AND roadmap_change = 'Deferred'
-- Indexed, <10ms
```

### 5. Cost Scaling
**16 users × $20/month = $320/month**
**PostgreSQL (Heroku/Railway):** $0-25/month for hobby tier, $50/month for production

---

## RECOMMENDATION: KEEP CURRENT (JSON IN DB)

**Why:**
1. **Performance wins:** 30-50ms reads vs 800-2000ms Airtable API
2. **No rate limits:** Handle 100s concurrent users
3. **Snapshot feature works:** PostgreSQL immutable versioning
4. **Free/cheap:** No per-user costs
5. **Graceful degradation:** Already built Airtable fallback

**When to Switch to Airtable Primary:**
- Jordan explicitly says "I want teams to edit in Airtable, not upload CSV"
- Collaborative editing is critical (multiple users editing same launch)
- CSV upload UX is too painful for teams

**Better Approach If CSV Upload Painful:**
Build web form in dashboard (not Airtable):
```
Dashboard → "Add Launch" button → Form → POST to backend → Save to PostgreSQL
```
- Still fast reads (PostgreSQL)
- No CSV needed
- Full control over UX
- Free

---

## AIRTABLE'S BEST USE: METADATA ONLY (CURRENT)

**Keep Airtable for:**
- M0 Priorities (small table, rarely changes, collaborative)
- M1 Plays (medium table, quarterly updates)
- Reference data (business units, quarters, geos)

**Keep PostgreSQL for:**
- Key Launches (large dataset, frequent reads)
- Snapshots (immutable versions)
- Drafts (work-in-progress)

**Why This Works:**
- Airtable = 2 small tables, <100 records total, cached 1 hour
- PostgreSQL = 400+ launches, 10+ snapshots, queried every page load
- Combined data via DataMerger (already built)

---

## EFFICIENCY SUMMARY

**Most Efficient (Speed):** PostgreSQL JSON
- Reads: 30-50ms
- Filters: <10ms SQL
- Snapshots: 20ms INSERT
- No API latency

**Most Efficient (Development):** PostgreSQL JSON (current)
- Already built ✓
- No Airtable schema changes needed
- No pagination loops
- No rate limit handling

**Most Efficient (User Experience):** Depends
- **If CSV upload OK:** PostgreSQL (current)
- **If collaborative editing required:** Hybrid (Airtable → sync → PostgreSQL)

**Most Efficient (Cost):** PostgreSQL
- $0-50/month vs $320/month Airtable

---

## MIGRATION PATH (IF NEEDED)

**Phase 1 (Current):** CSV → PostgreSQL, Airtable metadata
**Phase 2 (Future):** Web form → PostgreSQL (skip CSV)
**Phase 3 (If demanded):** Airtable primary → PostgreSQL cache (hybrid)

**Don't jump to Phase 3 unless:**
- Jordan says "CSV upload too hard for teams"
- 5+ teams complaining about CSV
- Collaborative editing blocks adoption

---

## THE REAL QUESTION: WHAT'S THE WORKFLOW?

**Workflow A: CSV Upload (Current)**
- Team leads fill CSV monthly
- Upload to dashboard
- Jordan reviews, approves
→ **Best storage:** PostgreSQL

**Workflow B: Live Collaborative Editing**
- 50 people edit launches in real-time
- Dashboard always shows latest
- No "approve" step, always live
→ **Best storage:** Airtable primary or Hybrid

**Workflow C: Dashboard Direct Editing**
- Teams use dashboard form (not CSV, not Airtable)
- Edit in UI, save to DB
- Jordan approves via dashboard
→ **Best storage:** PostgreSQL

**Ask Jordan:** "Do teams prefer CSV upload or editing in Airtable/Dashboard?"

If CSV upload is fine → Keep current architecture (fastest)
If Airtable editing required → Build hybrid sync
If dashboard editing preferred → Add web forms (no Airtable needed)

---

## FINAL ANSWER

**Fastest/Most Efficient: Current approach (JSON in PostgreSQL)**

**Problems with Airtable as primary:**
1. 10-40x slower reads (800ms vs 30ms)
2. Rate limits (5 req/sec)
3. Pagination complexity (100 records/request)
4. No native snapshots
5. Expensive ($320/month vs $25/month)
6. Vendor lock-in

**Only use Airtable primary if:**
- Collaborative real-time editing is non-negotiable
- Teams refuse CSV upload
- Worth 10x performance hit for editing UX

**Otherwise: Keep current. It's fastest.**
