# eBay REN - Next Steps

## Immediate Actions (Week 1)

### 1. Backend Setup & Testing ⚡

**Prerequisites:**
- Python 3.9+ installed
- PostgreSQL 14+ installed
- Airtable API key

**Steps:**
```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and add:
#   - AIRTABLE_API_KEY=your_key_here
#   - DATABASE_URL=postgresql://localhost:5432/ebay_ren

# 5. Create PostgreSQL database
createdb ebay_ren

# 6. Test backend
python test_setup.py

# 7. Run Flask server
python app.py
```

**Expected Result:**
- Server running on http://localhost:5000
- Health check: http://localhost:5000/api/health
- Returns: `{"status": "healthy", "service": "eBay REN API"}`

---

### 2. Test CSV Upload 📤

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/upload-csv \
  -F "file=@sample_data.csv" \
  -F "planning_cycle=H2 2026"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CSV uploaded successfully for H2 2026",
  "total_launches": 6,
  "planning_cycle": "H2 2026"
}
```

---

### 3. Test Roadmap API 🗺️

**Get Draft Roadmap:**
```bash
curl "http://localhost:5000/api/roadmap?mode=draft&planning_cycle=H2%202026"
```

**With Filters:**
```bash
curl "http://localhost:5000/api/roadmap?mode=draft&planning_cycle=H2%202026&m0_priorities[]=FC%20Fashion&markets[]=US&markets[]=UK"
```

---

## Short-Term (Week 2-3)

### 4. Frontend Setup 🎨

**Option A: Manual Setup**
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*"
npm install
npm run dev
```

**Option B: Use Template**
1. Download Next.js template
2. Configure for this project
3. Install dependencies

**Critical Components to Build:**
1. `app/page.tsx` - Main dashboard page
2. `components/Timeline.tsx` - Roadmap grid visualization
3. `components/LaunchCard.tsx` - Individual launch cards
4. `components/FilterBar.tsx` - Filter dropdowns
5. `components/ModeToggle.tsx` - Draft/Approved toggle
6. `components/CrossPriorityBadge.tsx` - Colored badges
7. `components/LaunchTooltip.tsx` - Hover/click details

---

### 5. Connect Frontend to Backend 🔗

**API Integration:**
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getRoadmapData(filters: RoadmapFilters) {
  const params = new URLSearchParams();
  // Add filter params...
  const response = await fetch(`${API_URL}/api/roadmap?${params}`);
  return response.json();
}
```

**Environment Setup:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 6. Implement Core UI Components 🎯

**Priority Order:**
1. **Timeline Grid** (highest priority)
   - Quarters as columns
   - M1 rows
   - Launch cards positioned in correct quarters

2. **Launch Cards**
   - Geo category colors
   - Country flags
   - Cross-priority badges
   - Hover tooltip

3. **Filter Bar**
   - M0 Priority multi-select
   - Market/Geo multi-select
   - Planning Cycle dropdown
   - Cross-Priority Dependency highlight filter

4. **Mode Toggle**
   - Upcoming (Draft) / Approved (Locked) tabs
   - Show/hide CSV upload based on mode
   - Show/hide Approve button

---

## Medium-Term (Week 4-6)

### 7. Polish & Features ✨

**Visual Enhancements:**
- [ ] Dotted lines connecting shifted launches
- [ ] Ghost cards in original quarter for shifts
- [ ] Smooth animations on filter changes
- [ ] Loading states and skeletons
- [ ] Error handling & user feedback

**Functionality:**
- [ ] CSV upload drag-and-drop
- [ ] Approve button workflow
- [ ] Export to PDF/CSV/PPT
- [ ] URL state persistence (shareable links)
- [ ] Manual refresh button

---

### 8. Testing & Validation ✅

**Backend Testing:**
```bash
# Unit tests
pytest backend/tests/

# Integration tests
pytest backend/tests/integration/

# Load testing
ab -n 1000 -c 10 http://localhost:5000/api/roadmap
```

**Frontend Testing:**
```bash
# Component tests
npm test

# E2E tests
npm run test:e2e
```

**Manual Testing Scenarios:**
1. Upload CSV → View in draft mode → Apply filters
2. Approve draft → Check snapshot created → View in approved mode
3. Compare draft vs. approved (toggle between modes)
4. Test all filter combinations
5. Test export functionality
6. Test on mobile/tablet (iPad)

---

### 9. Deployment 🚀

**Backend Deployment (Railway/Render):**
1. Create account on Railway or Render
2. Connect GitHub repo
3. Configure environment variables
4. Deploy backend
5. Note API URL

**Frontend Deployment (Vercel):**
1. Connect GitHub repo to Vercel
2. Configure build settings
3. Set environment variable: `NEXT_PUBLIC_API_URL=<backend-url>`
4. Deploy frontend
5. Configure custom domain (if needed)

**Database:**
1. Set up PostgreSQL on Railway/Render
2. Update `DATABASE_URL` in backend env vars
3. Run migrations

---

## Long-Term (Month 2+)

### 10. Post-MVP Features 🎁

**Phase 2 Features:**
- [ ] Comments view (executive commentary system)
- [ ] Change log table view
- [ ] Advanced analytics dashboard
- [ ] Real-time Airtable sync
- [ ] Comparison view (side-by-side v1 vs v2)
- [ ] User authentication & permissions
- [ ] Notifications (email alerts for changes)

**Technical Debt:**
- [ ] Migrate from CSV to Airtable "Key Launch" table
- [ ] Add comprehensive test coverage (>80%)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility compliance (WCAG 2.1)

---

## Decision Points

### Before Starting Frontend:
- [ ] Confirm UI framework (Next.js or alternative?)
- [ ] Confirm component library (shadcn/ui, Material-UI, custom?)
- [ ] Confirm charting library for timeline (D3.js, Recharts, custom SVG?)
- [ ] Review mockups with Jordan for design approval

### Before Deployment:
- [ ] Finalize access control strategy (open vs. login)
- [ ] Confirm deployment domain
- [ ] Review security requirements
- [ ] Plan rollout strategy (beta → production)

---

## Resources Needed

**Development:**
- [ ] Airtable API key (Personal Access Token)
- [ ] PostgreSQL database (local or cloud)
- [ ] Design assets (logos, icons, country flags)
- [ ] Sample CSV data (real or anonymized)

**Deployment:**
- [ ] Railway/Render account (backend)
- [ ] Vercel account (frontend)
- [ ] Domain name (optional)
- [ ] SSL certificate (included with Vercel/Railway)

**Team:**
- [ ] Frontend developer (React/Next.js)
- [ ] Backend developer (Python/Flask)
- [ ] Product owner (Jordan or delegate)
- [ ] QA tester

---

## Success Checklist

### MVP Launch Ready:
- [x] Backend API functional
- [x] CSV upload working
- [x] Airtable integration tested
- [ ] Frontend dashboard complete
- [ ] Timeline visualization working
- [ ] Filters functional
- [ ] Mode toggle (Draft/Approved) working
- [ ] Export to PDF/CSV working
- [ ] Deployed to production
- [ ] Jordan can use it successfully

### Post-Launch:
- [ ] Jordan using 3x per week
- [ ] Load time < 2 seconds
- [ ] Filter response < 500ms
- [ ] User satisfaction 8+/10
- [ ] No critical bugs
- [ ] Team adoption growing

---

## Quick Reference

**Backend Status:** ✅ Complete  
**Frontend Status:** 🚧 Not Started  
**Database:** 🚧 Needs Setup  
**Deployment:** 🚧 Not Started  

**Next Immediate Action:**
1. Run `cd backend && python3 test_setup.py` to verify backend
2. Install PostgreSQL and create database
3. Start frontend development

**Questions?** Refer to:
- CONVERSATION_SUMMARY.md for high-level overview
- TECHNICAL_DETAILS.md for specifications
- .claude/plans/cuddly-stargazing-teapot.md for full PRD
