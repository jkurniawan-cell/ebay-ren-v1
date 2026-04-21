# eBay REN - Documentation Index

**Project:** Roadmap Intelligence Engine (REN)  
**Date:** April 13, 2026  
**Status:** Backend Complete ✅ | Frontend Pending 🚧

---

## 📚 Documentation Files

### 1. **[CONVERSATION_SUMMARY.md](./CONVERSATION_SUMMARY.md)** 📋
**Quick overview of what we built and why**
- What we're building
- Key decisions made
- What's complete vs. pending
- Important context
- Files created

**Read this first** to get oriented on the project.

---

### 2. **[NEXT_STEPS.md](./NEXT_STEPS.md)** 🚀
**Step-by-step guide for implementation**
- Immediate actions (Week 1)
- Short-term tasks (Week 2-3)
- Medium-term goals (Week 4-6)
- Long-term roadmap (Month 2+)
- Decision points
- Success checklist

**Read this next** to know what to do.

---

### 3. **[TECHNICAL_DETAILS.md](./TECHNICAL_DETAILS.md)** 🔧
**Complete technical specifications**
- Architecture diagrams
- CSV schema (13 columns)
- API endpoints (7 routes)
- Database schema
- Component structure
- TypeScript types
- Color palette
- Environment variables
- Dependencies
- Performance targets
- Security considerations

**Reference this** when implementing.

---

### 4. **[Product Requirements Document](/.claude/plans/cuddly-stargazing-teapot.md)** 📖
**Full PRD with all requirements**
- Complete feature list
- User stories
- UI mockups described
- Filtering logic
- Snapshot system details
- Testing scenarios
- Future enhancements

**Deep dive** for comprehensive understanding.

---

## 🎯 Quick Start

### For Developers:
1. Read **CONVERSATION_SUMMARY.md** (5 min)
2. Follow **NEXT_STEPS.md** → "Immediate Actions" section
3. Reference **TECHNICAL_DETAILS.md** as needed

### For Product/Jordan:
1. Read **CONVERSATION_SUMMARY.md** (5 min)
2. Review mockup screenshots (in conversation)
3. Test backend once deployed

### For QA/Testing:
1. Read **NEXT_STEPS.md** → "Testing & Validation" section
2. Reference **TECHNICAL_DETAILS.md** → "Manual Test Scenarios"
3. Follow testing checklist

---

## 📊 Current Status

### ✅ Complete (Backend)
- [x] Flask API (7 endpoints)
- [x] Airtable integration with caching
- [x] CSV parser (13 columns)
- [x] Data merger
- [x] Multi-dimensional filtering
- [x] Snapshot/versioning system
- [x] PostgreSQL models
- [x] Sample data & tests

### 🚧 In Progress
- [ ] PostgreSQL database setup
- [ ] Environment configuration
- [ ] Backend deployment

### 📋 Not Started (Frontend)
- [ ] Next.js setup
- [ ] Timeline visualization
- [ ] Launch cards
- [ ] Filter bar
- [ ] Mode toggle
- [ ] Tooltips
- [ ] Export functionality

---

## 🗂️ File Structure

```
REN_V3/
├── INDEX.md                         ← You are here
├── CONVERSATION_SUMMARY.md          ← High-level overview
├── NEXT_STEPS.md                    ← Implementation guide
├── TECHNICAL_DETAILS.md             ← Technical specs
├── README.md                        ← Project README
│
├── backend/                         ← Python Flask API
│   ├── app/
│   │   ├── airtable_client.py
│   │   ├── csv_parser.py
│   │   ├── data_merger.py
│   │   ├── database.py
│   │   ├── filters.py
│   │   └── snapshot_manager.py
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── sample_data.csv
│   ├── test_setup.py
│   └── README.md
│
├── frontend/                        ← React/Next.js (to be created)
│   └── (empty)
│
└── .claude/
    └── plans/
        └── cuddly-stargazing-teapot.md  ← Full PRD
```

---

## 🎨 Visual Reference

### Key Concepts

**Data Hierarchy:**
```
M0 (Priorities)
  └── M1 (Plays/Initiatives)
      └── Key Launches
```

**Example:**
```
FC Fashion (M0)
  └── Play 1: Fix the Fundamentals (M1)
      └── Listing Quality (remove custom size) (Key Launch)
```

**Geo Categories:**
- 🔵 **Big 3:** US, UK, DE (Blue)
- 🟠 **Remaining Big 4:** FR, IT, AU, ROW (Orange)
- ⚪ **Global:** All markets (Gray)

**Cross-Priority Dependencies:**
- 🟣 Purple badge = "C2C" collaboration
- 🟢 Green badge = "LIVE" collaboration
- Auto-colored for each M0 priority

---

## 💡 Key Features

1. **Dual-Mode Dashboard**
   - Upcoming (Draft) - editable
   - Approved (Locked) - frozen snapshots

2. **Snapshot Versioning**
   - H2 2026 v1, v2, v3
   - Auto-increment on re-approval

3. **Cross-Priority Dependencies**
   - Visual badges on launch cards
   - Highlight filter (dims non-matching)

4. **Change Tracking**
   - Dotted lines for shifted launches
   - Color-coded status badges
   - Free-text rationale comments

5. **Multi-Dimensional Filtering**
   - M0 Priority (16 teams)
   - Market/Geo (US, UK, DE, FR, etc.)
   - Planning Cycle (Annual, H1/H2, Quarterly)
   - Roadmap Change (New, Deferred, Accelerated)
   - Cross-Priority Dependencies

---

## 🔗 Quick Links

### Commands
```bash
# Backend setup
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend setup (when ready)
cd frontend && npm install && npm run dev

# Test backend
cd backend && python test_setup.py

# Create database
createdb ebay_ren
```

### URLs
- Backend: http://localhost:5000
- Frontend: http://localhost:3000 (when created)
- Health Check: http://localhost:5000/api/health

---

## 📞 Questions?

**"I need to understand the big picture"**  
→ Read **CONVERSATION_SUMMARY.md**

**"I need to start implementing"**  
→ Follow **NEXT_STEPS.md**

**"I need technical specifications"**  
→ Reference **TECHNICAL_DETAILS.md**

**"I need complete requirements"**  
→ Read **.claude/plans/cuddly-stargazing-teapot.md**

**"I need backend details"**  
→ Read **backend/README.md**

**"I need sample data"**  
→ See **backend/sample_data.csv**

---

## 🎯 Success Metrics

**Goal:** Jordan answers roadmap questions in < 30 seconds

**Targets:**
- ⚡ Load time: < 2 seconds
- ⚡ Filter response: < 500ms
- 📊 Usage: 3x per week
- ⭐ Satisfaction: 8+/10

---

**Last Updated:** April 13, 2026  
**Version:** 1.0 MVP (Backend Complete)  
**Next Milestone:** Frontend Development
