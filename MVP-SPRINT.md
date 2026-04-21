# 1-WEEK MVP + 2-WEEK PRODUCTION SPRINT

## WEEK 1: MVP (DEMO-ABLE)

**Goal:** Jordan can upload CSV, see timeline, approve snapshot. That's it.

### Day 1 (Mon): Backend Core
**AM:**
- CSV parser: Validate, parse, save draft ✓ (already done)
- Fix any bugs in existing parser
- Test with real CSV from 1 team

**PM:**
- Snapshot manager: Create/get snapshots ✓ (done)
- API endpoints: /upload-csv, /roadmap, /snapshots ✓ (done)
- Manual test all 3 endpoints with Postman
- Fix critical errors only

**Deliverable:** Backend accepts CSV, returns data, creates snapshots

---

### Day 2 (Tue): Frontend Foundation
**AM:**
- Timeline grid: M1 rows, quarter columns ✓ (done)
- LaunchCard: Name + geo color ✓ (done)
- Strip all fancy features: No tooltips, no cross-priority badges, no filters yet

**PM:**
- Mode toggle: Draft vs Approved ✓ (done)
- Connect to backend API
- Show loading spinner (simple)
- Show error if API fails

**Deliverable:** Can view timeline in browser

---

### Day 3 (Wed): Upload + Approve Flow
**AM:**
- CSV upload component ✓ (done)
- Wire to backend /upload-csv
- Show success/error message
- Auto-refresh timeline after upload

**PM:**
- Approve button ✓ (done)
- Wire to /snapshots POST
- Switch to approved mode after approval
- Version number displays

**Deliverable:** Full cycle: Upload → View Draft → Approve → View Snapshot

---

### Day 4 (Thu): Filters (Minimum)
**AM:**
- M0 filter dropdown (multi-select) ✓ (done)
- Apply filter to timeline
- Clear filters button

**PM:**
- Market filter (Big 3 / Remaining Big 4 / Global only, not individual countries)
- Planning cycle selector (draft mode)
- Snapshot selector (approved mode)

**Deliverable:** Can filter by M0 and Market

---

### Day 5 (Fri): Polish + Demo Prep
**AM:**
- Fix top 3 visual bugs
- Add loading states (skeleton or spinner)
- Error messages (API down, no data, invalid CSV)

**PM:**
- Deploy to staging (Vercel frontend + Heroku/Railway backend)
- Load real data from 2-3 teams
- **Jordan demo:** Walk through upload → filter → approve
- Note feedback, prioritize for Week 2

**Deliverable:** Live demo link, Jordan feedback captured

---

## MVP SCOPE (WHAT'S IN)
✅ CSV upload + validation
✅ Timeline visualization (M1 rows, quarters, launch cards)
✅ Geo color coding (Big 3 blue, Remaining Big 4 orange, Global gray)
✅ Draft vs Approved mode
✅ Snapshot creation + versioning
✅ M0 filter, Market filter, Planning cycle selector
✅ Basic loading + error states

## MVP SCOPE (WHAT'S OUT - DEFER TO WEEK 2+)
❌ Cross-priority badges
❌ Launch tooltip (hover/click details)
❌ Roadmap change filter
❌ Change rationale display
❌ Shifted launch indicators (red border)
❌ Airtable integration (CSV-only mode for MVP)
❌ Responsive mobile
❌ Export buttons
❌ Keyboard shortcuts

---

## WEEK 2: PRODUCTION-READY

**Goal:** All core features work, deployed to prod, 16 teams can use it

### Day 6 (Mon): Airtable Integration
**AM:**
- Airtable client: Get M0 priorities, M1 plays ✓ (done)
- Test with real API key
- Implement fallback if Airtable fails

**PM:**
- Data merger: Combine Airtable + CSV ✓ (done)
- Verify enriched data shows in timeline
- Test cache refresh endpoint

**Deliverable:** Airtable metadata appears (business unit, M1 quarters)

---

### Day 7 (Tue): Launch Details + Cross-Priority
**AM:**
- Tooltip component: Click launch → show details ✓ (done)
- Display: Name, M0, M1, quarters, geo, change rationale

**PM:**
- Cross-priority badges ✓ (done)
- Parse CSV column → array
- Color-code badges
- Click badge → apply filter (highlight mode)

**Deliverable:** Rich launch details visible

---

### Day 8 (Wed): Roadmap Changes
**AM:**
- Detect shifted launches: Compare Initial vs Start/End quarters ✓ (done in parser)
- Visual indicator: Red border for deferred, green for accelerated
- "New" badge (blue)

**PM:**
- Roadmap change filter dropdown ✓ (done)
- Filter by: No Change, New, Accelerated, Deferred
- Highlight cross-priority filter ✓ (done)

**Deliverable:** Can filter and see all change types

---

### Day 9 (Thu): Error Handling + Testing
**AM:**
- Backend: Validate all CSV edge cases (empty rows, wrong columns, encoding)
- Frontend: Handle 500 errors, network failures, timeout
- Retry button on errors

**PM:**
- E2E test: Full cycle with 16 team CSVs
- Load 400+ launches → verify no crash
- Fix performance issues (if timeline slow, add basic optimization)

**Deliverable:** Stable under real load

---

### Day 10 (Fri): Deploy Production
**AM:**
- PostgreSQL setup (prod database)
- Environment variables (prod API keys)
- Deploy backend + frontend to production

**PM:**
- HTTPS enabled
- Test production with real data
- Invite Jordan + 2 VPs to test
- Monitor for errors (Sentry or logs)

**Deliverable:** Production URL live, users testing

---

## WEEK 2 SCOPE (WHAT'S ADDED)
✅ Airtable integration + fallback
✅ Launch tooltip with full details
✅ Cross-priority badges + highlight filter
✅ Roadmap change indicators (red/green borders, blue "New" badge)
✅ Shifted launch detection
✅ All 5 filter dimensions working
✅ Error handling + validation
✅ Production deployment (PostgreSQL, HTTPS)

---

## WEEK 3: OPTIMIZE + SCALE

**Goal:** Fast, polished, delightful. All 16 teams onboarded.

### Day 11 (Mon): Performance
**AM:**
- Profile with Chrome DevTools: Identify bottlenecks
- Virtual scrolling: Only render visible timeline rows
- Filter debouncing: Don't re-filter on every keystroke

**PM:**
- Code splitting: Lazy-load Timeline, Tooltip components
- API response caching (frontend)
- Measure: Page load <2s, filter response <500ms

**Deliverable:** Dashboard fast with 500+ launches

---

### Day 12 (Tue): Mobile Responsive
**AM:**
- Mobile layout: Stack filters, horizontal scroll timeline
- Touch-friendly: Larger buttons (44px), tap to expand launch

**PM:**
- Tablet: 2-column filters, narrower margins
- Test on iPhone, iPad, Android
- Fix broken layouts

**Deliverable:** Works on all devices

---

### Day 13 (Wed): UX Polish
**AM:**
- URL sharing: Filters → query params (/?mode=draft&m0=GBX,Trust)
- Copy link button
- Loading skeletons (better than spinners)

**PM:**
- Empty states: No launches → "Upload CSV to get started"
- Filter presets: Quick buttons ("Show Big 3", "Show New launches")
- Micro-animations: Smooth transitions, hover effects

**Deliverable:** Professional, polished UI

---

### Day 14 (Thu): Documentation + Training
**AM:**
- User guide: Step-by-step screenshots (Upload CSV, Apply filters, Approve)
- CSV template: Example file with all 16 teams, column definitions
- FAQ: Common errors, how to fix

**PM:**
- Admin guide: How to restart server, clear cache, backup DB
- Developer README: Local setup, API reference
- Record 5-min video walkthrough for teams

**Deliverable:** Self-serve docs ready

---

### Day 15 (Fri): Onboarding + Iteration
**AM:**
- Send docs + prod link to 16 teams
- Office hours: Answer questions, help with first upload
- Monitor errors (Sentry dashboard)

**PM:**
- Fix top 3 bugs reported
- Jordan final review
- Plan Week 4+ roadmap (commenting, export, changelog)

**Deliverable:** 16/16 teams using dashboard, <5 open bugs

---

## WEEK 3 SCOPE (WHAT'S ADDED)
✅ Performance optimization (virtual scroll, debouncing, code splitting)
✅ Mobile + tablet responsive
✅ URL sharing with filters
✅ Loading skeletons, empty states, filter presets
✅ Documentation (user guide, CSV template, FAQ, admin guide)
✅ Video walkthrough
✅ 16-team onboarding + support

---

## DAILY ROUTINE (ALL 3 WEEKS)

**8:30-9:00am:** Review yesterday, plan today tasks (write 3-5 bullets)

**9:00am-12:00pm:** DEEP WORK
- No Slack, no email
- Build/fix from AM task list
- Test as you code (don't batch)

**12:00-1:00pm:** Lunch + manual QA
- Use the app as Jordan would
- Find 1-2 UX friction points, note them

**1:00-3:00pm:** ITERATE
- Fix bugs found in AM
- Code review, refactor messy code
- PM task list

**3:00-4:00pm:** INTEGRATE + TEST
- Pull latest, merge conflicts
- E2E test: Does full flow still work?
- Deploy to staging (daily)

**4:00-5:00pm:** UNBLOCK TOMORROW
- What's blocking next day? Fix now or escalate
- Update task tracker, commit code
- Quick Jordan sync if needed (Slack/5min call)

**5:00pm:** STOP
- Don't burn out
- Sleep on hard problems

---

## CUT SCOPE IF BEHIND (PRIORITY ORDER)

**Week 1 (MVP) - Cannot cut:**
- Upload CSV
- View timeline
- Approve snapshot
- M0 filter

**Week 2 (Production) - Can defer:**
- Cross-priority highlight filter → Week 3
- Airtable integration → Week 3 (CSV-only for now)

**Week 3 (Optimize) - Can defer:**
- Mobile responsive → Post-launch
- URL sharing → Post-launch
- Filter presets → Post-launch
- Video walkthrough → Post-launch

**Never cut:**
- Error handling
- Loading states
- Production deployment
- Jordan testing session

---

## RISK MITIGATION

**Week 1 Risks:**
- CSV parser breaks on real data → Test with real CSV Day 1
- Backend/frontend integration issues → Daily integration tests starting Day 2
- Jordan unavailable for Friday demo → Schedule Monday instead, keep building

**Week 2 Risks:**
- Airtable API limits hit → Implement caching + fallback immediately
- 400 launches crash browser → Add virtual scrolling Day 9 (don't wait for Week 3)
- Production deploy fails → Test on staging Wednesday/Thursday, deploy Friday AM

**Week 3 Risks:**
- Teams don't upload CSVs → Pair with 1-2 teams Monday, unblock them first
- Performance still slow → Focus on biggest bottleneck only (likely Timeline render)
- Too many feature requests → Park in "Post-Launch Backlog", don't scope creep

---

## SUCCESS METRICS (END OF 3 WEEKS)

**Week 1 (MVP):**
- [ ] Jordan completes upload → approve flow without help
- [ ] 2 snapshots created, version history visible
- [ ] M0 + Market filters work

**Week 2 (Production):**
- [ ] All 5 filter dimensions functional
- [ ] Cross-priority badges display
- [ ] Change indicators (red/green borders) visible
- [ ] Production deployed, HTTPS live
- [ ] 3 VPs tested, feedback captured

**Week 3 (Optimize):**
- [ ] Dashboard loads 500 launches <3 sec
- [ ] Works on mobile (iPhone tested)
- [ ] URL sharing works
- [ ] 10+ teams uploaded CSVs
- [ ] User guide published + shared
- [ ] <5 open bugs

**SHIP IT.**

---

## WHAT COMES AFTER (WEEK 4+)

**P1 (Next Sprint):**
- Commenting system (VP/Jordan comments on launches)
- Export PDF (executive summary for presentations)
- Per-priority summary text (storytelling context)

**P2 (Later):**
- Change log + diff view
- Blocked status filter
- Keyboard shortcuts
- Advanced analytics (% deferred, velocity trends)

**P3 (Future):**
- Permissions/auth (role-based access)
- Two-way Airtable sync
- Real-time collaboration
- Mobile native app
