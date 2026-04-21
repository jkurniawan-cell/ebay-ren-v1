# eBay REN - Conversation Summary

**Date:** April 13, 2026  
**Project:** eBay Roadmap Intelligence Engine (REN)  
**Audience:** Jordan (Chief Commercial Officer)

---

## What We're Building

A dashboard to visualize roadmap data across 16 eBay teams (M0 Priorities), enabling Jordan to:
- See quick snapshots of team planning cycles
- Identify at-risk/blocked/shifted launches
- Filter by markets, teams, and planning cycles
- Track changes and understand rationale
- Compare current plans vs. approved historical snapshots

---

## Key Decisions Made

### 1. **Tech Stack**
- **Frontend:** React + Next.js (TypeScript, Tailwind CSS)
- **Backend:** Python Flask API
- **Database:** PostgreSQL (for snapshots/versioning)
- **Data Sources:** Airtable API (M0/M1) + CSV upload (Key Launches)

### 2. **Dual-Mode Dashboard**
- **Upcoming (Draft):** Live, editable roadmap data
- **Approved (Locked):** Frozen historical snapshots with versioning (v1, v2, v3)

### 3. **Data Model**
**Hierarchy:** M0 (Priorities) → M1 (Plays/Initiatives) → Key Launches

**CSV Schema (13 columns):**
1. m0_priority_name
2. m1_initiative_name
3. key_launch_name
4. original_start_quarter
5. original_end_quarter
6. updated_start_quarter
7. updated_end_quarter
8. geo_category (Big 3, Remaining Big 4, Global)
9. target_geos (US, UK, DE, FR, IT, AU, etc.)
10. roadmap_change (No Change, Accelerated, Deferred, New)
11. change_rationale (Prioritized, Deprioritized, Blocked, Constrained, Not ready)
12. **change_rationale_comment** (FREE TEXT - NEW)
13. **cross_priority_dependencies** (C2C, Live, etc. - NEW)

### 4. **Cross-Priority Dependencies**
- Visual badges on launch cards showing collaborating M0 priorities
- Example: FC Fashion launch shows purple "C2C" badge, green "LIVE" badge
- Auto-assigned colors from palette
- Filter to highlight collaborations (dims non-matching)

### 5. **Geo Categories & Colors**
- **Big 3 (US, UK, DE):** Blue (#4169E1)
- **Remaining Big 4 (FR, IT, AU, ROW):** Orange (#FF8C42)
- **Global:** Gray (#E0E0E0)

### 6. **Change Tracking**
- Dotted red lines connect shifted launches (original → current quarter)
- Status badges: New (blue), Shifted (yellow), Deferred (red), Accelerated (green)

---

## What We Built (Backend Complete ✅)

### Backend Components
1. **Flask API** (`app.py`) - 7 REST endpoints
2. **Airtable Client** - Hourly caching, M0/M1 data fetching
3. **CSV Parser** - Validates & parses 13-column CSV
4. **Data Merger** - Joins Airtable + CSV data
5. **Filters** - Multi-dimensional filtering logic
6. **Snapshot Manager** - Draft/Approved versioning system
7. **Database Models** - PostgreSQL tables for snapshots

### API Endpoints
- `POST /api/upload-csv` - Upload key launch CSV
- `GET /api/roadmap` - Get filtered roadmap data
- `POST /api/snapshots` - Approve planning cycle (create snapshot)
- `GET /api/snapshots` - List all approved snapshots
- `GET /api/drafts` - List all drafts
- `GET /api/priorities` - Get M0 priorities for filters
- `POST /api/refresh` - Manual cache refresh

---

## What's Next (Frontend Pending 🚧)

### Frontend Components Needed
1. **Timeline Visualization** - Quarters as columns, M1 rows, launch cards
2. **Launch Cards** - With cross-priority badges, geo flags, status indicators
3. **Hover/Click Tooltips** - Show change rationale comments & full details
4. **Filter Bar** - M0, Market, Planning Cycle, Roadmap Change, Cross-Priority Dependency
5. **Mode Toggle** - Switch between Upcoming (Draft) and Approved (Locked)
6. **CSV Upload** - Drag-and-drop file upload component
7. **Approve Button** - Create snapshot from draft
8. **Export** - PDF, CSV, PPT download

---

## Key Features

### MVP (v1)
✅ Backend API complete  
🚧 Frontend dashboard (in progress)  
✅ CSV upload for key launches  
✅ Airtable integration (M0, M1)  
✅ Snapshot versioning system  
✅ Multi-dimensional filtering  
✅ Cross-priority dependency tracking  

### Post-MVP (v2+)
- Comments view (executive commentary)
- Change log table view
- Advanced analytics & insights
- Real-time Airtable sync
- Comparison view (v1 vs v2 snapshots)

---

## Important Context

### Planning Cycles
- **Annual:** 2026, 2027
- **Half-yearly:** H1 2026 (Q1+Q2), H2 2026 (Q3+Q4)
- **Quarterly:** Q1-2026, Q2-2026, Q3-2026, Q4-2026

### Airtable Structure
- **Base ID:** appXFsy8DcRl4C5mx ("Prod Ops")
- **Priorities (M0):** tblwZaISS19No2Ks3 (16 teams)
- **Plays (M1):** tblmOUHPxzTFNV345 (476 records)
- **Projects:** tblix4BAl1lr9dl1K (4,915 records)

### Markets/Geos
- **Big 3:** US, UK, DE
- **Remaining Big 4:** FR, IT, AU, ROW
- **Others:** CA, iCBT, GBH
- **Global:** All markets

---

## Success Metrics

**Goal:** Jordan answers "What's the status of GBX initiatives for Q2 2026 in the UK?" in < 30 seconds

**Targets:**
- Dashboard load time: < 2 seconds
- Filter response: < 500ms
- Jordan usage: 3x per week minimum
- User satisfaction: 8+/10

---

## Files Created

### Backend (Complete)
```
backend/
├── app.py                      # Flask API
├── app/
│   ├── airtable_client.py      # Airtable integration
│   ├── csv_parser.py           # CSV validation/parsing
│   ├── data_merger.py          # Data merging logic
│   ├── database.py             # PostgreSQL models
│   ├── filters.py              # Filtering logic
│   └── snapshot_manager.py     # Versioning system
├── requirements.txt
├── .env.example
├── sample_data.csv             # Example data
├── test_setup.py               # Backend tests
└── README.md
```

### Documentation
```
/
├── README.md                           # Project overview
├── CONVERSATION_SUMMARY.md             # This file
├── .claude/plans/cuddly-stargazing-teapot.md  # Full PRD
```

---

## Timeline

**Phase 1 (Complete):** Backend API ✅  
**Phase 2 (Next):** Frontend Dashboard 🚧  
**Phase 3 (Pending):** Integration & Polish  
**Phase 4 (Pending):** User Acceptance Testing  

---

## Open Questions

1. **Access Control:** Open access or login required?
2. **Deployment Domain:** ren.ebay.com or internal.ebay.com/ren?
3. **Geo Colors:** Confirm exact hex codes (currently Blue/Orange/Gray)
