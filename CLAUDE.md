# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**eBay REN (Roadmap Intelligence Engine)** - Executive dashboard for visualizing roadmap data across 16 eBay teams (M0 Priorities). This is a full-stack application with a Python Flask backend and React/Next.js frontend.

## Architecture

### Stack
- **Frontend**: Next.js 16.2.3 + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Flask 3.0 + SQLAlchemy 2.0 + Pandas
- **Database**: SQLite (development) or PostgreSQL (production)
- **External APIs**: Airtable API (optional - system gracefully degrades if unavailable)

### Data Flow
```
CSV Upload → Backend Parser → SQLite/PostgreSQL (drafts/snapshots)
                ↓
Airtable API (M0/M1 metadata) → Data Merger → Filters → Frontend
```

### Key Design Decisions

**Dual-Mode Dashboard**: The app operates in two modes:
- **Upcoming (Draft)**: Live roadmap data, editable via CSV upload
- **Approved (Locked)**: Frozen snapshots approved by executives with version history

**Graceful Degradation**: Airtable integration is optional. If the API key is missing or requests fail, the backend falls back to CSV-only mode with reduced metadata.

**CSV Format Handling**: The CSV parser is configured to:
- Skip first 2 rows (metadata headers)
- Map actual CSV column names (e.g., "M0", "M1 ", "Key_Launch") to internal field names
- Handle spaces in column names and varying formats

## Development Commands

### Backend (Flask API)

**Start development server:**
```bash
cd backend
python app.py
```
Server runs on `http://localhost:5000` with debug mode enabled.

**Install dependencies:**
```bash
cd backend
pip3 install flask flask-cors pandas requests python-dotenv sqlalchemy psycopg2-binary
```

**Manual database initialization** (happens automatically on first run):
```bash
cd backend
python -c "from app.database import init_db; init_db()"
```

**Clear Airtable cache:**
```bash
curl -X POST http://localhost:5000/api/refresh
```

**Test CSV upload:**
```bash
curl -X POST http://localhost:5000/api/upload-csv \
  -F "file=@/path/to/file.csv" \
  -F "planning_cycle=H2 2026"
```

### Frontend (Next.js)

**Start development server:**
```bash
cd frontend
npm run dev
```
Server runs on `http://localhost:3000`.

**Install dependencies:**
```bash
cd frontend
npm install
```

**Build for production:**
```bash
cd frontend
npm run build
npm start
```

**Lint:**
```bash
cd frontend
npm run lint
```

## Backend Architecture

### Module Breakdown

- **`app.py`** - Flask application entry point, route definitions, CORS configuration
- **`app/airtable_client.py`** - Airtable API wrapper with hourly caching (TTL: 3600s)
- **`app/csv_parser.py`** - CSV parsing with column mapping and validation
  - **Important**: Maps actual CSV columns (e.g., "M0", "M1 ", "Key_Launch") to internal fields
  - Skips first 2 rows for metadata headers
  - Required fields: m0_priority_name, m1_initiative_name, key_launch_name, updated quarters, geo_category
- **`app/data_merger.py`** - Merges Airtable M0/M1 metadata with CSV launch data
  - `merge_data()`: Full merge with Airtable
  - `csv_only_data()`: Fallback when Airtable unavailable
- **`app/filters.py`** - Multi-dimensional filtering logic (M0, market, planning cycle, roadmap changes, cross-priority highlighting)
- **`app/snapshot_manager.py`** - Snapshot creation, versioning, draft management
- **`app/database.py`** - SQLAlchemy models (RoadmapSnapshot, RoadmapDraft) and session management

### Database Models

**RoadmapSnapshot** - Approved, frozen roadmap versions
- `planning_cycle`: "H2 2026", "Q3 2026", etc.
- `version`: Auto-increments (1, 2, 3) for re-approvals
- `csv_data_json`: Full CSV data as JSON
- `approved_by`: Approver name (default: "Jordan")
- `approved_at`: Timestamp

**RoadmapDraft** - Current work-in-progress roadmap
- `planning_cycle`: Active planning cycle
- `csv_data_json`: Latest uploaded CSV data
- `last_uploaded_at`: Timestamp

### API Endpoints

All endpoints are prefixed with `/api`:

- `GET /health` - Health check
- `POST /refresh` - Clear Airtable cache
- `POST /upload-csv` - Upload CSV (multipart/form-data: file, planning_cycle)
- `GET /roadmap` - Get filtered roadmap data (query params: mode, snapshot_id/planning_cycle, filters)
- `GET /snapshots` - List all approved snapshots
- `POST /snapshots` - Create new snapshot (approve draft)
- `GET /drafts` - List all drafts
- `GET /priorities` - Get M0 priorities from Airtable

### CSV Schema

The actual CSV format uses these column names (mapped internally):
```
M0, M1 , Key_Launch, Initial_start_Quarter, Initial_end_Quarter, 
Start_Quarter, End_Quarter, Geo_Category, Geo_Category_Details, 
roadmap_change, change_rationale, Change Rationale Comment, 
Cross_Priority_Dependency
```

**Column mapping** is defined in `app/csv_parser.py`:
- "M0" → m0_priority_name
- "M1 " → m1_initiative_name (note the space!)
- "Key_Launch" → key_launch_name
- "Change Rationale Comment" → change_rationale_comment
- etc.

### Airtable Integration

**Tables used:**
1. **Priorities (M0)** - `tblwZaISS19No2Ks3`
   - `fldSyO5bzcAjtf1pJ`: Priority Name
   - `fldCkSSLFe4DaqtOi`: Business Unit
2. **Plays (M1)** - `tblmOUHPxzTFNV345`
   - `fldny2lfBzzb9zUVD`: Play Name
   - `fldQ3MlMeNtSAH7vm`: Start Quarter
   - `fldjYqsZKRVy0vGQl`: End Quarter
   - `fldIxHEa6RGPr48af`: Target Market/Geos

**Caching strategy**: 
- Cache TTL: 1 hour (configurable via `CACHE_TTL_SECONDS` env var)
- Manual refresh via `/api/refresh` endpoint
- Cache keys: `priorities_m0`, `plays_m1`

**SSL verification**: Disabled in development (`verify=False`) with urllib3 warnings suppressed.

## Frontend Architecture

### Directory Structure

- **`app/`** - Next.js app router pages
  - `page.tsx` - Main dashboard page (mode toggle, filters, timeline)
  - `layout.tsx` - Root layout with metadata
  - `globals.css` - Global styles
- **`components/`** - React components
  - `Header.tsx` - Title, timestamp, export button
  - `ModeToggle.tsx` - Upcoming/Approved tab switcher
  - `FilterBar.tsx` - Multi-select filter controls
  - `Timeline.tsx` - Main roadmap grid visualization
  - `LaunchCard.tsx` - Individual launch display with badges
  - `LaunchTooltip.tsx` - Hover/click detail view
  - `CrossPriorityBadge.tsx` - Colored badges for collaborating priorities
  - `CSVUpload.tsx` - Drag-and-drop CSV uploader
  - `ApproveButton.tsx` - Approve planning cycle button
- **`lib/`** - Utility libraries
  - `api.ts` - API client class (`apiClient`) for backend communication
- **`hooks/`** - React custom hooks
- **`types/`** - TypeScript type definitions
- **`utils/`** - Helper functions

### Key Frontend Patterns

**API Client Usage:**
```typescript
import { apiClient } from '@/lib/api';

// Get roadmap data
const data = await apiClient.getRoadmapData({
  mode: 'draft',
  planning_cycle: 'H2 2026',
  m0_priorities: ['GBX', 'Trust'],
  markets: ['US', 'UK'],
  // ... other filters
});

// Upload CSV
const result = await apiClient.uploadCSV(file, 'H2 2026');

// Create snapshot
const snapshot = await apiClient.createSnapshot('H2 2026', 'Jordan');
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:5000`)

### Styling

Uses **Tailwind CSS 4** with PostCSS configuration. Colors and design tokens should follow the design system defined in the PRD:
- Big 3 (US/UK/DE): Royal Blue (#4169E1)
- Remaining Big 4 (FR/IT/AU/ROW): Orange (#FF8C42)
- Global: Light Gray (#E0E0E0)
- Roadmap changes: New (Blue #3B82F6), Deferred (Red #DC2626), Accelerated (Green #10B981)

## Common Issues & Solutions

### Backend returns 500 on /api/roadmap
**Cause**: Likely Airtable API failure when API key is missing or invalid.
**Solution**: Check backend logs. System should auto-fallback to `csv_only_data()` mode. Verify fallback logic in `app.py` line 133-150.

### CSV upload succeeds but no data displays
**Cause**: Column name mismatch between CSV and parser.
**Solution**: Check `app/csv_parser.py` COLUMN_MAPPING. The CSV should have columns like "M0", "M1 ", "Key_Launch" (exact match including spaces).

### Frontend shows "Loading roadmap data..." indefinitely
**Cause**: Frontend can't connect to backend or API returns error.
**Solution**: 
1. Verify backend is running on port 5000
2. Check browser console for fetch errors
3. Check CORS is enabled in `app.py`
4. Verify draft exists for the selected planning cycle

### SSL certificate verification failed (Airtable)
**Cause**: Corporate proxy or network security.
**Solution**: Already handled - `verify=False` is set in `airtable_client.py`. If issues persist, check network/firewall.

### ModuleNotFoundError when starting backend
**Cause**: Missing `app/__init__.py` or dependencies not installed.
**Solution**: Ensure `backend/app/__init__.py` exists (even if empty). Run `pip3 install -r requirements.txt`.

## Testing CSV Upload End-to-End

1. Start backend: `cd backend && python app.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:3000`
4. Upload CSV through UI or via curl:
   ```bash
   curl -X POST http://localhost:5000/api/upload-csv \
     -F "file=@/Users/jkurniawan/Downloads/REN Fields - Final2.csv" \
     -F "planning_cycle=H2 2026"
   ```
5. Verify data appears in Timeline component
6. Check that launch cards show cross-priority badges and tooltips work

## Important Context from PRD

This project is documented in detail in `.claude/plans/cuddly-stargazing-teapot.md`. Key features:

- **Cross-Priority Dependencies**: Launches can show which other M0 priorities collaborate (displayed as colored badges)
- **Change Rationale**: Two separate fields - dropdown selection + free-text comment
- **Snapshot/Approval Workflow**: Jordan approves drafts to create versioned snapshots
- **Filtering**: Multi-select filters for M0, market, planning cycle, roadmap changes, and cross-priority highlighting
- **Geo Categories**: Big 3, Remaining Big 4, Global (color-coded)

## Database Location

Development database is at: `backend/ebay_ren.db` (SQLite)

To inspect:
```bash
cd backend
sqlite3 ebay_ren.db
.tables
SELECT * FROM roadmap_draft;
.exit
```

For production, set `DATABASE_URL` environment variable to PostgreSQL connection string.
