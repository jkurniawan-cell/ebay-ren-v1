# 3-WEEK SPRINT PLAN

## WEEK 1: STABILIZE + TEST

**Goal:** Bug-free core features, error handling, loading states

### Day 1-2 (Mon-Tue): Backend Hardening
- Unit tests: CSV parser edge cases (malformed data, missing columns, encoding issues)
- Error handling: Airtable timeout/rate limit → graceful fallback
- Concurrent upload protection (lock draft during processing)
- API response validation (all endpoints return proper errors)
- Performance: Cache optimization, query tuning

### Day 3-4 (Wed-Thu): Frontend Polish
- Loading states: Skeleton screens (timeline), upload progress bar, filter debouncing
- Error boundaries: API failures show retry button + error message
- Empty states: No data → clear CTA, no filters match → adjust prompt
- Tooltip positioning: Prevent overflow, mobile-friendly
- Cross-priority badge overflow: Ellipsis if >5 badges

### Day 5 (Fri): Integration Testing
- E2E flows:
  - Upload CSV → view draft → apply filters → approve → view snapshot
  - Re-upload CSV → overwrites draft → changes visible
  - Multiple snapshots → version incrementing works
- Browser testing: Chrome, Safari, Firefox
- Fix blockers

---

## WEEK 2: OPTIMIZE + UX

**Goal:** Fast, responsive, delightful to use

### Day 6-7 (Mon-Tue): Performance
- Virtual scrolling: Render only visible timeline rows (500+ launches lag fix)
- Filter memoization: Prevent re-render entire dataset on every keystroke
- API caching: Frontend cache roadmap data, invalidate on upload/approve
- Bundle optimization: Code-split Timeline component, lazy-load tooltip
- Measure: Lighthouse score >90

### Day 8-9 (Wed-Thu): Responsive Design
- Mobile: Stack filters vertically, horizontal scroll timeline, expand launch cards on tap
- Tablet: 2-column filter layout, narrower timeline margins
- Desktop XL: Show 6 quarters instead of 4
- Touch targets: Min 44px for mobile buttons
- Test: iPhone, iPad, Android

### Day 10 (Fri): UX Improvements
- Filter presets: "Show only New launches", "Show Big 3 markets", "Show my M0"
- URL sharing: Filters → query params → shareable links
- Keyboard shortcuts: Arrow keys to navigate launches, Enter to open tooltip, Esc to close
- Export button (placeholder): "Coming soon" tooltip
- Micro-interactions: Smooth transitions, hover states, focus rings

---

## WEEK 3: DEPLOY + VALIDATE

**Goal:** Production-ready, user-validated

### Day 11-12 (Mon-Tue): Deployment Prep
- PostgreSQL setup: Migrate from SQLite, test on staging
- Environment config: Prod API keys (Airtable), CORS whitelist, HTTPS
- Docker: Containerize backend + frontend (optional if using managed hosting)
- CI/CD: GitHub Actions → auto-deploy on merge to main
- Monitoring: Sentry (errors), Uptime (health check), Airtable quota alerts

### Day 13 (Wed): Documentation
- User guide: How to upload CSV (step-by-step screenshots), how to approve, filter combos
- CSV template: Example file with 16 teams, validation checklist
- Admin guide: Restart server, clear cache, backup database
- Developer README: Local setup, API docs, troubleshooting

### Day 14-15 (Thu-Fri): User Testing
- Jordan walkthrough: Share staging link, observe workflow, note friction points
- 3 VP trial: Upload their team CSV, review draft, provide feedback
- Iterate: Fix top 5 pain points identified
- Final approval: Jordan signs off on production deploy

---

## DAILY SCHEDULE (TEMPLATE)

**Morning (9am-12pm):** Build/fix
- Focus block: No meetings, deep work on sprint goal
- Test as you build: Don't batch testing to end of day

**Afternoon (1pm-3pm):** Review/refine
- Code review, manual QA, UX polish
- Cross-check: Does it work with real data from 16 teams?

**Late Afternoon (3pm-5pm):** Unblock/plan
- Fix blockers for next day
- Update task list, commit code
- Sync with Jordan if needed (quick Slack)

**Evening (optional):** Think ahead
- What breaks if 1000 launches? If Airtable down for 1 day? If Jordan on vacation?
- Pre-load next day tasks

---

## PRIORITY RANKING (IF TIME CONSTRAINED)

**P0 (Must Have):**
- Error handling + loading states
- Backend unit tests (CSV parser)
- E2E testing (upload → approve flow)
- PostgreSQL deployment
- Jordan user testing + fixes

**P1 (Should Have):**
- Performance optimization (virtual scrolling)
- Mobile responsive
- Documentation (user guide + CSV template)
- URL sharing (filters in query params)

**P2 (Nice to Have):**
- Keyboard shortcuts
- Filter presets
- Micro-interactions
- Bundle optimization

**P3 (Defer to Post-Launch):**
- Commenting system
- Change log
- Export PDF/Excel
- Permissions/auth

---

## RISK MITIGATION

**Week 1 Risks:**
- CSV parser fails on real team data → Pair with 1 team to validate early
- Airtable fallback broken → Test by disabling API key, verify CSV-only mode works

**Week 2 Risks:**
- Performance still slow → Profile with Chrome DevTools, focus on biggest bottleneck first
- Mobile layout breaks → Test on real devices, not just browser resize

**Week 3 Risks:**
- Deployment issues → Staging environment exact copy of prod, test there first
- Jordan unavailable → VP as backup tester, record video demo for async review

---

## SUCCESS CRITERIA (END OF WEEK 3)

- [ ] Jordan uploads CSV in <2 min without help
- [ ] Dashboard loads 400 launches in <3 sec
- [ ] Zero API errors in 1 hour of usage
- [ ] Mobile works on iPhone/Android
- [ ] 3 snapshots approved, version history visible
- [ ] Filters work (all 5 dimensions tested)
- [ ] Production deployed, HTTPS enabled
- [ ] User guide published (Notion/Confluence)

**Ship it.**
