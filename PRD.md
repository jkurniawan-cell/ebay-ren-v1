# eBay REN (Roadmap Intelligence Engine) - Product Requirements Document

**Target User:** Jordan (CCO - Chief Commercial Officer) & eBay VPs  
**Problem:** Manual slide creation for 16 team roadmaps → automated dashboard  
**Input:** Airtable + CSV uploads  
**Output:** Filterable, interactive timeline visualization

---

## 1. DATA ARCHITECTURE

### 1.1 Data Hierarchy (3-Tier)
```
M0 (Priority) - 3-5 year strategic initiative per team
  ├── M1 (Initiative) - Strategic plays within M0
  │     └── Key Launch - Deliverable driving M0 goals
```

### 1.2 Data Sources

**Primary: CSV Upload**
- Team-submitted roadmap data
- Column schema (actual CSV headers):
  - `M0` → M0 priority/team name
  - `M1 ` → M1 initiative name (note space)
  - `Key_Launch` → Key launch name
  - `Initial_start_Quarter`, `Initial_end_Quarter` → Original baseline
  - `Start_Quarter`, `End_Quarter` → Updated timeline
  - `Geo_Category` → Big 3 / Remaining Big 4 / Global
  - `Geo_Category_Details` → Comma-separated geo list
  - `roadmap_change` → No Change / Accelerated / Deferred / New
  - `change_rationale` → Dropdown selection (predefined)
  - `Change Rationale Comment` → Free-text explanation
  - `Cross_Priority_Dependency` → Comma-separated M0 names

**Secondary: Airtable (Optional Metadata)**
- **Priorities Table** (`tblwZaISS19No2Ks3`)
  - Priority Name (`fldSyO5bzcAjtf1pJ`)
  - Business Unit (`fldCkSSLFe4DaqtOi`)
- **Plays Table** (`tblmOUHPxzTFNV345`)
  - Play Name (`fldny2lfBzzb9zUVD`)
  - Start Quarter (`fldQ3MlMeNtSAH7vm`)
  - End Quarter (`fldjYqsZKRVy0vGQl`)
  - Target Markets/Geos (`fldIxHEa6RGPr48af`)

**Graceful Degradation:** If Airtable API unavailable → CSV-only mode (reduced metadata)

### 1.3 Database Models

**RoadmapDraft** (SQLite/PostgreSQL)
- `planning_cycle` - "H2 2026", "Q3 2026"
- `csv_data_json` - Full parsed CSV data
- `last_uploaded_at` - Timestamp
- `uploaded_by` - Uploader name

**RoadmapSnapshot** (SQLite/PostgreSQL)
- `planning_cycle` - Planning cycle name
- `version` - Auto-increment (1, 2, 3) for re-approvals
- `approved_by` - Default "Jordan"
- `approved_at` - Approval timestamp
- `csv_data_json` - Frozen CSV snapshot

---

## 2. CORE FEATURES (MVP - IMPLEMENTED)

### 2.1 Dual-Mode Dashboard

**Mode 1: Upcoming (Draft)**
- Live roadmap data
- Editable via CSV re-upload
- Current work-in-progress
- Status: "Planning"

**Mode 2: Approved (Locked)**
- Frozen snapshots
- Jordan-approved versions
- Historical tracking
- Version history (1, 2, 3...)
- Status: "Confirmed"

### 2.2 Timeline Visualization

**Layout:**
- Rows: M1 initiatives
- Columns: Quarters (Q1-2026, Q2-2026, Q3-2026, Q4-2026)
- Cells: Key launches (blocks)

**Key Launch Card Display:**
- Launch name
- Geo category badge (color-coded):
  - Big 3 (US/UK/DE): Royal Blue `#5B7FFF`
  - Remaining Big 4 (FR/IT/AU/ROW): Orange `#FFD6A5`
  - Global: Light Gray `#E8E8E8`
- Cross-priority badges (colored chips showing collaborating M0s)
- Change indicator:
  - Red border: Deferred `#FF5757`
  - Green border: Accelerated `#10B981`
  - Blue badge: New `#3B82F6`

**Shift Detection:**
- Compare `Initial_*_Quarter` vs `Start_/End_Quarter`
- Highlight moved launches
- Show original → current quarter

### 2.3 Multi-Dimensional Filtering

**Filter Dimensions:**
1. **M0 Priority** (Team) - multi-select dropdown
2. **Market/Geography** - multi-select (Big 3, Remaining Big 4, Global, or specific countries)
3. **Planning Cycle** - single select ("H2 2026", "Q3 2026")
4. **Roadmap Changes** - multi-select (No Change, New, Accelerated, Deferred)
5. **Cross-Priority Highlight** - select M0 to highlight collaborations

**Filter Behavior:**
- All filters cumulative (AND logic)
- Persist across mode switches (draft ↔ approved)
- URL param support for sharing

### 2.4 CSV Upload & Parsing

**Upload Flow:**
1. Drag-and-drop or file picker
2. Backend validation:
   - Skip first 2 rows (metadata)
   - Map CSV columns → internal fields
   - Validate required fields
3. Parse + store as draft
4. Immediate dashboard update

**Error Handling:**
- Column mismatch → show expected vs actual columns
- Missing required fields → highlight rows
- Invalid quarter format → validation message

### 2.5 Snapshot/Approval Workflow

**Approval Process:**
1. Jordan reviews draft mode
2. Clicks "Approve Planning Cycle"
3. System creates snapshot:
   - Freezes current draft data
   - Increments version number
   - Timestamps approval
4. Snapshot appears in Approved mode

**Versioning:**
- Same planning cycle can be re-approved → version++
- Example: "H2 2026 v1", "H2 2026 v2"

### 2.6 Launch Details Tooltip

**On Click/Hover:**
- Full launch name
- M0 priority
- M1 initiative
- Timeline: Original → Updated
- Geo category + target geos list
- Roadmap change status
- Change rationale (dropdown)
- Change rationale comment (free-text)
- Cross-priority dependencies (clickable chips)

### 2.7 Cross-Priority Dependencies

**Display:**
- Colored badges on launch cards
- Each badge = 1 collaborating M0
- Color mapping: deterministic hash → color palette
- Click badge → highlight filter applies

**Data:**
- Stored as comma-separated string in CSV
- Parsed to array: `cross_priority_dependencies_list`

---

## 3. FUTURE FEATURES (NOT YET IMPLEMENTED)

### 3.1 Commenting System

**VP/Jordan Comments on Launches:**
- Comment thread per key launch
- Markdown support
- @mentions for stakeholders
- Timestamps + author tracking

**Per-Priority Summary Comments:**
- Text box above each M0 priority section
- Storytelling context for CCO
- Explain strategic rationale per planning cycle
- Example: "GBX accelerating checkout revamp due to Q1 conversion metrics"

### 3.2 Change Log & Rationale Tracking

**Detailed Change History:**
- Track every CSV re-upload
- Diff view: what changed between versions
- Rationale field (existing) expanded to full changelog
- Strategic implications field
- Stakeholder impact notes

**Analytics:**
- % launches deferred vs accelerated
- Velocity trends (quarters slipping left/right)
- Cross-priority collaboration frequency

### 3.3 Blocked Status Filter

**Dependency Blocking:**
- Mark launches as "Blocked by [dependency]"
- Filter to show only blocked launches
- Visual indicator (lock icon?)
- Blocker resolution workflow

### 3.4 Airtable Field Readiness

**Additional Airtable Tables/Fields:**
- **Key Launches Table** (new):
  - Launch metadata
  - Owner/DRI
  - Dependencies
  - Blockers
  - Comments
- **Change Log Table** (new):
  - Timestamp
  - Changed field
  - Old → new value
  - Changed by
  - Rationale

**Direct Airtable Editing:**
- Two-way sync: Airtable ↔ Dashboard
- Edit launch details in UI → push to Airtable
- Airtable updates → refresh dashboard

### 3.5 Export & Reporting

**Export Formats:**
- PDF: Executive summary for CCO presentations
- PNG: Timeline screenshot
- Excel: Detailed data export
- PowerPoint: Auto-generated slide deck

**Report Templates:**
- Executive summary (1-pager)
- Team deep-dive (per M0)
- Cross-priority collaboration matrix
- Change trend analysis

### 3.6 Permissions & Access Control

**Role-Based Access:**
- **Admin (Jordan):** Full access, approve snapshots, edit all
- **VP:** View all, comment on own M0
- **Team Lead:** View own M0, upload CSV
- **Read-Only:** View approved snapshots only

**Audit Log:**
- Track who uploaded what CSV
- Who approved which snapshot
- All filter changes (for analytics)

---

## 4. TECHNICAL IMPLEMENTATION

### 4.1 Backend (Flask API)

**Modules:**
- `app.py` - Flask routes, CORS, error handling
- `app/airtable_client.py` - Airtable API wrapper, 1-hour cache
- `app/csv_parser.py` - CSV → JSON, column mapping, validation
- `app/data_merger.py` - Merge Airtable + CSV, fallback logic
- `app/filters.py` - Multi-dimensional filtering
- `app/snapshot_manager.py` - Draft/snapshot CRUD
- `app/database.py` - SQLAlchemy models, session management

**API Endpoints:**
```
GET  /api/health              - Health check
POST /api/refresh             - Clear Airtable cache
POST /api/upload-csv          - Upload CSV (multipart: file, planning_cycle)
GET  /api/roadmap             - Get filtered roadmap (mode, filters)
GET  /api/snapshots           - List all snapshots
POST /api/snapshots           - Create snapshot (approve draft)
GET  /api/drafts              - List all drafts
GET  /api/priorities          - Get M0 priorities (for filter dropdown)
```

**Dependencies:**
- Flask 3.0, flask-cors
- SQLAlchemy 2.0, psycopg2-binary (PostgreSQL)
- Pandas (CSV parsing)
- Requests (Airtable API)
- python-dotenv (env vars)

**Environment Variables:**
```
AIRTABLE_API_KEY          - Airtable personal access token
AIRTABLE_BASE_ID          - Base ID (default: appXFsy8DcRl4C5mx)
DATABASE_URL              - PostgreSQL URL (default: SQLite)
CACHE_TTL_SECONDS         - Airtable cache duration (default: 3600)
FLASK_DEBUG               - Debug mode (default: True)
PORT                      - Server port (default: 5000)
```

### 4.2 Frontend (Next.js + React)

**Stack:**
- Next.js 16.2.3 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components

**Components:**
- `Header.tsx` - Title, timestamp, export button
- `ModeToggle.tsx` - Upcoming/Approved tabs
- `FilterBar.tsx` - Multi-select filter controls
- `Timeline.tsx` - Main roadmap grid
- `LaunchCard.tsx` - Key launch block
- `LaunchTooltip.tsx` - Hover/click detail view
- `CrossPriorityBadge.tsx` - Collaborator chips
- `CSVUpload.tsx` - Drag-and-drop uploader
- `ApproveButton.tsx` - Snapshot creation

**Hooks:**
- `useRoadmapData.ts` - Fetch + filter roadmap
- `useSnapshots.ts` - Snapshot list
- `usePriorityColors.ts` - Color mapping for M0s

**API Client:**
- `lib/api.ts` - Typed API client class
- Methods: `getRoadmapData()`, `uploadCSV()`, `createSnapshot()`, etc.

**Environment Variables:**
```
NEXT_PUBLIC_API_URL       - Backend URL (default: http://localhost:5000)
```

### 4.3 Color Palette

**Geo Categories:**
- Big 3: `#5B7FFF` (Royal Blue)
- Remaining Big 4: `#FFD6A5` (Orange)
- Global: `#E8E8E8` (Light Gray)

**Roadmap Changes:**
- New: `#3B82F6` (Blue badge)
- Deferred: `#FF5757` (Red border)
- Accelerated: `#10B981` (Green border)
- No Change: Default card style

**Cross-Priority Badges:**
- Deterministic color hash per M0 name
- Palette: 12 distinct colors for visibility

---

## 5. WORK REQUIRED (MECE)

### 5.1 Data Preparation
- [ ] **Airtable schema setup:**
  - Validate Priorities table fields
  - Validate Plays table fields
  - Add Key Launches table (future)
  - Add Change Log table (future)
- [ ] **CSV template creation:**
  - Document column names exactly (including spaces)
  - Example CSV with 16 teams
  - Validation rules doc
- [ ] **Data migration:**
  - Historical roadmap data → CSV format
  - Baseline "Initial" quarters populated

### 5.2 Backend Development
- [x] Flask app setup + CORS
- [x] SQLAlchemy models (RoadmapDraft, RoadmapSnapshot)
- [x] Airtable client with caching
- [x] CSV parser with column mapping
- [x] Data merger (Airtable + CSV)
- [x] Multi-dimensional filters
- [x] Snapshot manager (CRUD)
- [x] API endpoints (all 8)
- [ ] **Unit tests:**
  - CSV parser edge cases
  - Filter combinations
  - Airtable fallback logic
- [ ] **Error handling:**
  - Airtable rate limits
  - CSV malformed data
  - Concurrent uploads
- [ ] **Deployment:**
  - PostgreSQL setup
  - Environment config
  - Docker containerization (optional)

### 5.3 Frontend Development
- [x] Next.js app setup + Tailwind
- [x] Timeline grid layout
- [x] LaunchCard component + tooltip
- [x] Mode toggle (draft/approved)
- [x] Multi-select filters
- [x] CSV upload UI
- [x] Approve button
- [x] Cross-priority badges
- [ ] **Loading states:**
  - Skeleton screens
  - Upload progress bar
- [ ] **Error handling:**
  - API failure messages
  - Retry logic
- [ ] **Responsive design:**
  - Mobile layout (stacked cards?)
  - Tablet optimization
- [ ] **Accessibility:**
  - Keyboard navigation
  - Screen reader labels
  - ARIA attributes
- [ ] **Performance:**
  - Virtual scrolling for large datasets
  - Debounced filter updates

### 5.4 Future Feature Implementation
- [ ] **Commenting system:**
  - Backend: Comment table, CRUD API
  - Frontend: Comment thread UI
  - Real-time updates (WebSocket?)
- [ ] **Per-priority summaries:**
  - Airtable schema: Summary field
  - Frontend: Rich text editor
  - Markdown rendering
- [ ] **Change log:**
  - Diff algorithm (launch A vs launch B)
  - Timeline history view
  - Export to PDF
- [ ] **Blocked status:**
  - Backend: Add `blocked` field
  - Frontend: Filter + visual indicator
  - Blocker resolution workflow
- [ ] **Export features:**
  - PDF generation (Puppeteer?)
  - Excel export (xlsx library)
  - PNG screenshot (html2canvas)
- [ ] **Permissions:**
  - Auth system (OAuth? API keys?)
  - Role-based access control
  - Audit log table

### 5.5 Testing & Validation
- [ ] **End-to-end tests:**
  - Upload CSV → view in draft → approve → view in snapshot
  - Apply filters → verify results
  - Cross-priority click → highlight filter
- [ ] **User acceptance testing:**
  - Jordan walkthrough
  - VP feedback session
  - 16 team leads trial upload
- [ ] **Performance testing:**
  - 1000+ launches rendering
  - Filter response time
  - Concurrent user load

### 5.6 Documentation & Training
- [ ] **User guide:**
  - How to upload CSV
  - How to approve snapshots
  - Filter combinations guide
- [ ] **Admin guide:**
  - Airtable setup
  - Database backup
  - Cache management
- [ ] **Developer docs:**
  - API reference
  - Component library
  - Deployment guide
- [ ] **Training materials:**
  - Video walkthrough
  - FAQ doc
  - Support contacts

### 5.7 Operations
- [ ] **Monitoring:**
  - API uptime alerts
  - Error rate tracking
  - Airtable API quota monitoring
- [ ] **Backup & Recovery:**
  - Database backups (daily)
  - Snapshot version retention policy
  - Disaster recovery plan
- [ ] **Security:**
  - API key rotation
  - HTTPS enforcement
  - SQL injection prevention (SQLAlchemy parameterized)
  - XSS prevention (React escaping)

---

## 6. SUCCESS METRICS

**Efficiency Gains:**
- Time to create roadmap slide: Manual (4 hours) → Automated (<5 min)
- Update frequency: Quarterly → On-demand

**Adoption:**
- 16/16 teams uploading CSV within 1 month
- Jordan using dashboard as primary roadmap view
- 5+ snapshot approvals per quarter

**Data Quality:**
- <5% CSV upload errors
- 100% Airtable-CSV sync accuracy
- Zero lost drafts

**User Satisfaction:**
- Jordan feedback: "Saves time" + "Clear visibility"
- VP feedback: "Useful for cross-priority coordination"

---

## 7. CONSTRAINTS & ASSUMPTIONS

**Constraints:**
- Airtable API rate limits (5 requests/sec)
- Single-user approval (Jordan only)
- CSV must match exact schema
- SQLite for dev (not production-scale)

**Assumptions:**
- 16 teams = ~50-100 M1 initiatives
- ~200-400 key launches per planning cycle
- Quarterly planning cycle cadence
- Jordan approves within 1 week of draft upload
- VPs have Airtable access for metadata input

**Risks:**
- Airtable API downtime → CSV-only fallback
- Teams submit late CSVs → incomplete dashboard
- Jordan unavailable → approval bottleneck
- Data schema changes → parser breaks

---

## 8. OPEN QUESTIONS

1. **Airtable vs CSV source of truth?**
   - Current: CSV primary, Airtable secondary metadata
   - Future: Two-way sync?

2. **Historical data backfill:**
   - How many past planning cycles to import?
   - Where is baseline "Initial" quarter data?

3. **Comment moderation:**
   - Can anyone comment or just VPs/Jordan?
   - Comment approval workflow?

4. **Export schedule:**
   - Auto-generate weekly PDF for Jordan?
   - Push to Slack/email?

5. **Mobile access:**
   - Responsive web only or native app needed?

6. **Real-time collaboration:**
   - Do multiple users edit simultaneously?
   - Conflict resolution strategy?

---

## APPENDIX A: CSV Schema Reference

| CSV Column                  | Internal Field               | Type     | Required | Example               |
|-----------------------------|------------------------------|----------|----------|-----------------------|
| M0                          | m0_priority_name             | String   | Yes      | "GBX"                 |
| M1                          | m1_initiative_name           | String   | Yes      | "Checkout Revamp"     |
| Key_Launch                  | key_launch_name              | String   | Yes      | "1-Click Buy"         |
| Initial_start_Quarter       | original_start_quarter       | String   | No       | "Q1-2026"             |
| Initial_end_Quarter         | original_end_quarter         | String   | No       | "Q2-2026"             |
| Start_Quarter               | updated_start_quarter        | String   | Yes      | "Q2-2026"             |
| End_Quarter                 | updated_end_quarter          | String   | Yes      | "Q3-2026"             |
| Geo_Category                | geo_category                 | Enum     | Yes      | "Big 3"               |
| Geo_Category_Details        | target_geos                  | CSV List | No       | "US, UK, DE"          |
| roadmap_change              | roadmap_change               | Enum     | No       | "Accelerated"         |
| change_rationale            | change_rationale             | String   | No       | "Market demand"       |
| Change Rationale Comment    | change_rationale_comment     | Text     | No       | "Accelerated due..." |
| Cross_Priority_Dependency   | cross_priority_dependencies  | CSV List | No       | "Trust, GCX"          |

**Enum Values:**
- `geo_category`: Big 3, Remaining Big 4, Global
- `roadmap_change`: No Change, New, Accelerated, Deferred

---

## APPENDIX B: Airtable Table Mapping

**Priorities (M0) Table:** `tblwZaISS19No2Ks3`
| Field ID            | Field Name    | Type   | Used For          |
|---------------------|---------------|--------|-------------------|
| fldSyO5bzcAjtf1pJ   | Priority Name | Text   | M0 name           |
| fldCkSSLFe4DaqtOi   | Business Unit | Select | Business grouping |

**Plays (M1) Table:** `tblmOUHPxzTFNV345`
| Field ID            | Field Name       | Type   | Used For       |
|---------------------|------------------|--------|----------------|
| fldny2lfBzzb9zUVD   | Play Name        | Text   | M1 name        |
| fldQ3MlMeNtSAH7vm   | Start Quarter    | Select | M1 timeline    |
| fldjYqsZKRVy0vGQl   | End Quarter      | Select | M1 timeline    |
| fldIxHEa6RGPr48af   | Target Markets   | Multi  | Geo targeting  |

---

**END OF PRD**
