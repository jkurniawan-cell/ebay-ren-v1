# VERSION ROADMAP - MECE

## V1.1: JORDAN TESTER (Week 1)

**Goal:** Get feedback, de-risk, validate UX

### SCOPE
**Data:**
- CSV only (no Airtable integration)
- 5 teams: GCX, Shipping, C2C, FC: P&A, FC: Fashion
- Manual CSV upload

**Features:**
- Timeline visualization (M1 rows, quarter columns)
- Filters (accurate):
  - Geo (Big 3, Remaining Big 4, Global)
  - Priority M0 (5 teams only)
  - Roadmap change (No Change, New, Accelerated, Deferred)
  - Change rationale (dropdown values)
- Show quarter movement (red border = deferred, green = accelerated)
- Cross-priority dependency (maybe - if time permits)
- Click launch → tooltip (basic details)

**Deploy:**
- Static build → GitHub Pages
- No database, no backend
- Frontend only (Next.js export)

**Out of Scope:**
- Airtable sync
- All 16 teams
- Snapshots/approval workflow
- Planning cycle selector
- Auto-refresh
- Export buttons
- Backend API

---

### V1.1 SPRINT (5 DAYS)

**Day 1: Static Architecture**
- Next.js static export config
- Hardcode 5-team CSV data in JSON file
- No backend, all data client-side

**Day 2: Core UI**
- Timeline grid
- LaunchCard with geo colors
- Basic filters (M0, Geo)
- Quarter movement indicators

**Day 3: Filters + Tooltip**
- Roadmap change filter
- Change rationale filter
- Click tooltip (show launch details)

**Day 4: Cross-Priority (Optional)**
- Parse cross-priority field
- Show badges
- Filter by dependency (if time)

**Day 5: Deploy + Jordan Demo**
- Build static site
- Deploy to GitHub Pages
- Jordan walkthrough
- Capture feedback

**Deliverable:** Live URL, Jordan feedback logged

---

## V1: H2 PRODUCTION (Week 2-3)

**Goal:** All 16 teams, read-only dashboard, production-ready

### SCOPE
**Data:**
- Airtable input (all launches)
- All 16 teams
- Key Launches table (M0/M1 links, 15 fields)

**Features:**
✅ Timeline visualization (M1 rows, quarters)
✅ Read-only (no write access)
✅ Filters (multi-select):
  - Geo
  - Priority M0 (all 16)
  - Roadmap timing change
  - Change rationale
  - Planning cycle
✅ Planning cycles:
  - Live (draft mode)
  - Approved (snapshot mode)
  - Quarterly approval by Jordan
✅ Data freshness:
  - Auto-refresh hourly (cron job)
  - Manual refresh button
✅ Clickable launches:
  - Tooltip with full details (Airtable fields)
  - Launch name, M0, M1, quarters, geo, rationale, cross-deps
✅ Show quarter movement:
  - Compare Initial vs Current quarter
  - Visual indicators (red/green borders)
✅ Cross-priority dependency:
  - Badges on launch cards
  - Click to filter/highlight
✅ Export:
  - CSV ✅
  - PNG ✅
  - PDF ❌ (V2)
  - PPT ❌ (V2)

**Deploy:**
- Vercel (frontend)
- Railway/Heroku (backend)
- PostgreSQL database

**Out of Scope:**
- Write access (no editing in dashboard)
- Comments system
- Permissions & access control
- Audit log
- PDF/PPT export
- Real-time collaboration

---

### V1 SPRINT (10 DAYS)

**Day 6: Airtable Integration**
- Create Key Launches table (15 fields)
- Build airtable_sync.py
- Test sync with 16 teams

**Day 7: Backend API**
- /api/sync-airtable
- /api/roadmap (filters)
- /api/snapshots (approve)
- PostgreSQL cache

**Day 8: Planning Cycles**
- Draft vs Approved mode toggle
- Snapshot creation (Jordan approve button)
- Version history display

**Day 9: Auto-Refresh**
- Hourly cron job (sync Airtable → PostgreSQL)
- Manual refresh button
- Show last-synced timestamp

**Day 10: Full Filters**
- All 5 filter dimensions working
- Multi-select dropdowns
- Clear filters button

**Day 11: Launch Details**
- Click tooltip with all Airtable fields
- Cross-priority badges (colored chips)
- Highlight filter (click badge → filter)

**Day 12: Export Features**
- CSV export (backend endpoint)
- PNG export (html2canvas)
- Download buttons in Header

**Day 13: Testing + Polish**
- Load all 16 teams (400 launches)
- Test filters, approve flow
- Performance check (<3s load)
- Fix bugs

**Day 14: Deploy Production**
- Deploy Vercel + Railway
- PostgreSQL setup
- Environment variables
- HTTPS enabled

**Day 15: Jordan Final Review**
- Walkthrough all features
- 3 VPs test with real data
- Capture V2 requests

**Deliverable:** Production URL, all 16 teams live, Jordan approved

---

## V2: ANNUAL RELEASE (Month 2-3)

**Goal:** Collaborative editing, governance, advanced features

### SCOPE
**Write Access:**
- Edit launches in dashboard (not just Airtable)
- Inline editing (click to edit name, quarters, etc)
- Two-way sync (Dashboard ↔ Airtable)

**Comments:**
- Comment threads per launch
- @mentions, markdown support
- Comment approval workflow (only Jordan/VPs can comment)

**Change Log & Rationale:**
- Track every field change (who, when, what)
- Diff view (v1 vs v2)
- Rationale required for changes
- Strategic implications field

**Real-Time Collaboration:**
- Multiple users editing simultaneously
- Conflict resolution (last-write-wins or merge)
- Live cursors (show who's viewing)
- WebSocket updates

**Permissions & Access Control:**
- Role-based access:
  - Admin (Jordan): Full access
  - VP: Edit own M0, comment all
  - Team Lead: Edit own M1, view all
  - Read-only: View approved snapshots only
- Audit log:
  - Track CSV uploads
  - Track approvals
  - Track edits (who changed what)
  - Export audit trail

**Advanced Export:**
- PDF (multi-page, pagination)
- PowerPoint (editable slides)
- Scheduled reports (weekly PDF to Jordan)

**Blocked Status:**
- Mark launches as "Blocked by [dependency]"
- Filter to show blocked only
- Blocker resolution workflow

**Per-Priority Summaries:**
- Text box above each M0 section
- Storytelling context for CCO
- Markdown editing
- Version history

---

### V2 FEATURES (MECE)

**Write & Edit:**
- Inline editing in dashboard
- Save to Airtable (two-way sync)
- Validation on save
- Undo/redo

**Governance:**
- Permissions (4 roles: Admin, VP, Team Lead, Read-only)
- Comment approval (only Jordan/VP can approve comments)
- Audit log (track all changes)
- Approval workflow (multi-stage)

**Collaboration:**
- Real-time updates (WebSocket)
- Conflict resolution (merge strategy)
- Live cursors
- Change notifications

**Advanced Tracking:**
- Change log with diff view
- Rationale required for edits
- Strategic implications field
- Blocked status filter

**Export & Reporting:**
- PDF export (multi-page)
- PowerPoint export (editable)
- Scheduled reports
- Executive summary (1-pager)

---

## FEATURE MATRIX (MECE)

| Feature                          | V1.1 Tester | V1 Production | V2 Annual |
|----------------------------------|-------------|---------------|-----------|
| **Data Source**                  |             |               |           |
| CSV upload                       | ✅          | ✅ (backup)   | ✅        |
| Airtable sync                    | ❌          | ✅            | ✅        |
| Auto-refresh (hourly)            | ❌          | ✅            | ✅        |
| Manual refresh button            | ❌          | ✅            | ✅        |
| **Scope**                        |             |               |           |
| Teams                            | 5           | 16            | 16        |
| **Visualization**                |             |               |           |
| Timeline grid                    | ✅          | ✅            | ✅        |
| Geo color coding                 | ✅          | ✅            | ✅        |
| Quarter movement indicators      | ✅          | ✅            | ✅        |
| Cross-priority badges            | Maybe       | ✅            | ✅        |
| **Filters**                      |             |               |           |
| Geo                              | ✅          | ✅            | ✅        |
| Priority M0                      | ✅ (5)      | ✅ (16)       | ✅        |
| Roadmap change                   | ✅          | ✅            | ✅        |
| Change rationale                 | ✅          | ✅            | ✅        |
| Planning cycle                   | ❌          | ✅            | ✅        |
| Cross-priority highlight         | ❌          | ✅            | ✅        |
| Blocked status                   | ❌          | ❌            | ✅        |
| **Planning Cycles**              |             |               |           |
| Live (draft) mode                | ❌          | ✅            | ✅        |
| Approved (snapshot) mode         | ❌          | ✅            | ✅        |
| Version history                  | ❌          | ✅            | ✅        |
| Quarterly approval               | ❌          | ✅            | ✅        |
| **Interactivity**                |             |               |           |
| Click launch → tooltip           | ✅ (basic)  | ✅ (full)     | ✅        |
| Read-only                        | ✅          | ✅            | ❌        |
| Write access (edit in dashboard) | ❌          | ❌            | ✅        |
| Comments                         | ❌          | ❌            | ✅        |
| **Export**                       |             |               |           |
| CSV                              | ❌          | ✅            | ✅        |
| PNG                              | ❌          | ✅            | ✅        |
| PDF                              | ❌          | ❌            | ✅        |
| PowerPoint                       | ❌          | ❌            | ✅        |
| **Governance**                   |             |               |           |
| Permissions & access control     | ❌          | ❌            | ✅        |
| Audit log                        | ❌          | ❌            | ✅        |
| Comment approval                 | ❌          | ❌            | ✅        |
| **Collaboration**                |             |               |           |
| Real-time updates                | ❌          | ❌            | ✅        |
| Conflict resolution              | ❌          | ❌            | ✅        |
| Change log tracking              | ❌          | ❌            | ✅        |
| **Deployment**                   |             |               |           |
| Platform                         | GitHub Pages| Vercel        | Vercel    |
| Backend                          | None        | Railway       | Railway   |
| Database                         | None        | PostgreSQL    | PostgreSQL|

---

## TIMELINE SUMMARY

**Week 1 (5 days):** V1.1 Tester
- CSV only, 5 teams, static site
- Jordan demo Friday
- De-risk UX decisions

**Week 2-3 (10 days):** V1 Production
- Airtable sync, 16 teams, Vercel deploy
- All filters, planning cycles, export CSV/PNG
- Production-ready, Jordan approved

**Month 2-3 (4-6 weeks):** V2 Annual
- Write access, comments, permissions
- Real-time collaboration, audit log
- PDF/PPT export, change log

---

## V1.1 vs V1 vs V2 (ONE SENTENCE EACH)

**V1.1:** Static tester with 5 teams, CSV only, validate UX with Jordan  
**V1:** Production dashboard, 16 teams, Airtable sync, read-only, hourly refresh, CSV/PNG export  
**V2:** Full collaboration, write access, comments, permissions, audit log, PDF/PPT, real-time

---

## CUT SCOPE DECISIONS (ALREADY MADE)

**V1.1 → V1:**
- ❌ Static site → ✅ Full-stack (backend + DB)
- ❌ 5 teams → ✅ 16 teams
- ❌ CSV → ✅ Airtable

**V1 → V2:**
- ❌ PDF export (1-2 weeks) → V2
- ❌ PPT export (1-2 weeks) → V2
- ❌ Permissions/audit log → V2
- ❌ Comments → V2
- ❌ Write access → V2

**Smart cuts:**
- PDF/PPT deferred (use PNG workaround)
- Permissions deferred (single-user Jordan for V1)
- Comments deferred (use Airtable native comments for V1)

---

## SUCCESS METRICS (PER VERSION)

**V1.1 Success:**
- [ ] Jordan completes walkthrough in <10 min
- [ ] Filters return correct results (spot-checked)
- [ ] 5-team data loads without crash
- [ ] Feedback captured for V1 changes

**V1 Success:**
- [ ] All 16 teams' data synced from Airtable
- [ ] Dashboard loads 400 launches <3s
- [ ] Hourly auto-refresh working
- [ ] Jordan approves 1 snapshot successfully
- [ ] CSV export works, PNG export works
- [ ] Zero P0 bugs after 1 week of usage

**V2 Success:**
- [ ] 10+ users editing simultaneously (no conflicts)
- [ ] Audit log tracks all changes
- [ ] Comment approval workflow used by Jordan
- [ ] PDF export used in exec presentation
- [ ] Role-based access enforced (4 roles working)

---

## DEPENDENCIES (WHAT BLOCKS WHAT)

**V1.1 → V1:**
- V1.1 feedback required before V1 design finalization
- CSV schema becomes Airtable schema (must match)

**V1 → V2:**
- V1 usage patterns inform V2 collaboration features
- Audit log requirements from V1 governance gaps

**V2 Internal:**
- Permissions must exist before comment approval (roles needed)
- Real-time sync must exist before conflict resolution (WebSocket foundation)

---

## RISK MATRIX

| Risk                               | V1.1 | V1  | V2  | Mitigation                          |
|------------------------------------|------|-----|-----|-------------------------------------|
| Jordan doesn't like UX             | High | Med | Low | V1.1 early feedback                 |
| Airtable schema breaks sync        | -    | High| Med | Schema validation, error alerts     |
| 16 teams' data quality poor        | -    | High| Med | Data validation, team training      |
| Performance slow (400 launches)    | Low  | Med | Med | Virtual scrolling, caching          |
| Auto-refresh hits rate limits      | -    | Med | Low | Hourly sync (not per-request)       |
| Export features don't work         | -    | Med | Low | Fallback: PNG always works          |
| Multi-user conflicts break data    | -    | -   | High| Last-write-wins + audit log         |
| Permissions misconfigured          | -    | -   | High| Role testing, default deny          |

---

## OPEN QUESTIONS (ASK JORDAN)

**For V1.1:**
1. Which 5 teams have cleanest data for demo?
2. Preferred filter order (top to bottom)?
3. Tooltip: Hover or click?

**For V1:**
1. Approve quarterly, half-yearly, or ad-hoc?
2. Hourly refresh acceptable or need real-time?
3. Who else besides Jordan should test before launch?

**For V2:**
1. Comment approval: Jordan only or VPs too?
2. Permissions: 4 roles enough or more granular?
3. Real-time: Critical or nice-to-have?

---

## FINAL DELIVERABLES (PER VERSION)

**V1.1:**
- Live URL (GitHub Pages)
- Jordan feedback doc
- 5-team CSV template

**V1:**
- Production URL (Vercel)
- User guide (how to sync, filter, approve)
- Airtable schema doc (field IDs)
- CSV export feature
- PNG export feature

**V2:**
- Permissions admin panel
- Audit log viewer
- Comment moderation UI
- PDF/PPT export
- Developer API docs (for integrations)

**Done.**
