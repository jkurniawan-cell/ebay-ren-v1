# eBay REN - Quick Reference Card

**One-page cheat sheet for the most essential information**

---

## 🎯 What Is This?

Dashboard for Jordan (CCO) to visualize roadmap data across 16 eBay teams.

**Goal:** Answer "What's the status of GBX for Q2 2026 in UK?" in < 30 seconds

---

## 📊 Data Structure

```
M0 (16 Priorities/Teams) → M1 (Plays) → Key Launches
```

**Example:**
- **M0:** FC Fashion, GBX, Trust, Ads, etc.
- **M1:** "Play 1: Fix the Fundamentals"
- **Key Launch:** "Listing Quality (remove custom size)"

---

## 📂 CSV Schema (13 Columns)

| Column | Example |
|--------|---------|
| 1. m0_priority_name | "FC Fashion" |
| 2. m1_initiative_name | "Play 1: Fix the Fundamentals" |
| 3. key_launch_name | "Listing Quality" |
| 4. original_start_quarter | "Q1-2026" |
| 5. original_end_quarter | "Q2-2026" |
| 6. updated_start_quarter | "Q2-2026" |
| 7. updated_end_quarter | "Q3-2026" |
| 8. geo_category | "Big 3" |
| 9. target_geos | "US,UK,DE" |
| 10. roadmap_change | "Deferred" |
| 11. change_rationale | "Blocked due to eng capacity" |
| 12. change_rationale_comment | "Waiting for platform team" |
| 13. cross_priority_dependencies | "C2C,Live" |

---

## 🔌 API Endpoints (7 Routes)

```
POST   /api/upload-csv         Upload CSV
GET    /api/roadmap            Get filtered data
POST   /api/snapshots          Approve cycle
GET    /api/snapshots          List snapshots
GET    /api/drafts             List drafts
GET    /api/priorities         Get M0 list
POST   /api/refresh            Clear cache
```

---

## 🎨 Colors

**Geo Categories:**
- 🔵 Big 3 (US, UK, DE) = Blue `#4169E1`
- 🟠 Remaining 4 (FR, IT, AU, ROW) = Orange `#FF8C42`
- ⚪ Global = Gray `#E0E0E0`

**Status:**
- 🔵 New = Blue `#3B82F6`
- 🟡 Shifted = Yellow `#FFD700`
- 🔴 Deferred = Red `#DC2626`
- 🟢 Accelerated = Green `#10B981`

---

## 🚀 Quick Start

```bash
# 1. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with Airtable API key
createdb ebay_ren
python app.py

# 2. Test
curl http://localhost:5000/api/health

# 3. Upload CSV
curl -X POST http://localhost:5000/api/upload-csv \
  -F "file=@sample_data.csv" \
  -F "planning_cycle=H2 2026"
```

---

## 🔑 Environment Variables

**Backend (.env):**
```
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=appXFsy8DcRl4C5mx
DATABASE_URL=postgresql://localhost:5432/ebay_ren
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📋 File Locations

| What | Where |
|------|-------|
| Backend API | `backend/app.py` |
| CSV Parser | `backend/app/csv_parser.py` |
| Filters | `backend/app/filters.py` |
| Sample CSV | `backend/sample_data.csv` |
| Test Script | `backend/test_setup.py` |
| Full PRD | `.claude/plans/cuddly-stargazing-teapot.md` |

---

## ✅ Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete |
| CSV Upload | ✅ Complete |
| Airtable Integration | ✅ Complete |
| Filtering | ✅ Complete |
| Snapshots | ✅ Complete |
| Database | 🚧 Needs setup |
| Frontend | 🚧 Not started |
| Deployment | 🚧 Not started |

---

## 🎯 Next Actions

1. **Now:** Run `cd backend && python3 test_setup.py`
2. **Today:** Set up PostgreSQL database
3. **This Week:** Start frontend (Next.js)
4. **Next Week:** Build timeline visualization
5. **Week 3:** Deploy to production

---

## 💡 Key Features

**Dual-Mode:**
- Upcoming (Draft) = Editable
- Approved (Locked) = Frozen snapshots

**Filters:**
- M0 Priority (16 teams)
- Market/Geo
- Planning Cycle (Annual/H1/H2/Quarterly)
- Roadmap Change
- Cross-Priority Dependencies (highlight)

**Visual:**
- Timeline grid (quarters as columns)
- Launch cards (color-coded by geo)
- Cross-priority badges (purple C2C, green LIVE)
- Dotted lines (shifted launches)
- Tooltips (hover for details)

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **INDEX.md** | Documentation index |
| **CONVERSATION_SUMMARY.md** | High-level overview |
| **NEXT_STEPS.md** | Implementation guide |
| **TECHNICAL_DETAILS.md** | Full technical specs |
| **QUICK_REFERENCE.md** | This file |

---

## 🔍 Common Tasks

**Upload CSV:**
```bash
curl -X POST http://localhost:5000/api/upload-csv \
  -F "file=@my_data.csv" \
  -F "planning_cycle=H2 2026"
```

**Get Draft Roadmap:**
```bash
curl "http://localhost:5000/api/roadmap?mode=draft&planning_cycle=H2%202026"
```

**Filter by M0 + Market:**
```bash
curl "http://localhost:5000/api/roadmap?mode=draft&planning_cycle=H2%202026&m0_priorities[]=FC%20Fashion&markets[]=US"
```

**Approve Cycle:**
```bash
curl -X POST http://localhost:5000/api/snapshots \
  -H "Content-Type: application/json" \
  -d '{"planning_cycle":"H2 2026","approved_by":"Jordan"}'
```

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check virtual environment activated
- Check all dependencies installed
- Check .env file configured

**CSV upload fails:**
- Verify all 13 columns present
- Check column names match exactly
- Ensure no empty required fields

**Database errors:**
- Run `createdb ebay_ren`
- Check DATABASE_URL in .env
- Verify PostgreSQL running

**Airtable errors:**
- Check AIRTABLE_API_KEY valid
- Verify base ID correct
- Check internet connection

---

## 📞 Get Help

**Backend issues:** `backend/README.md`  
**Frontend issues:** `frontend/README.md` (coming soon)  
**Architecture questions:** `TECHNICAL_DETAILS.md`  
**Implementation questions:** `NEXT_STEPS.md`  
**General overview:** `CONVERSATION_SUMMARY.md`

---

**Version:** 1.0  
**Last Updated:** April 13, 2026  
**Status:** Backend Complete ✅
