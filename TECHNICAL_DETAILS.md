# eBay REN - Technical Details

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                 │
│  - Timeline Visualization                                    │
│  - Filter Bar (M0, Market, Planning Cycle, Cross-Deps)     │
│  - Mode Toggle (Draft/Approved)                             │
│  - Launch Cards with Badges & Tooltips                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Python/Flask)                    │
│  - API Endpoints (7 routes)                                 │
│  - Airtable Integration (hourly cache)                      │
│  - CSV Upload & Validation                                  │
│  - Data Merging (Airtable + CSV)                           │
│  - Multi-Dimensional Filtering                              │
│  - Snapshot Management                                       │
└─────┬─────────────────────────────┬─────────────────────────┘
      │                             │
      ↓                             ↓
┌─────────────────┐       ┌──────────────────────┐
│  PostgreSQL DB  │       │   Airtable API       │
│  - Snapshots    │       │   - M0 Priorities    │
│  - Drafts       │       │   - M1 Plays         │
└─────────────────┘       └──────────────────────┘
```

---

## CSV Schema (13 Columns)

### Required Columns

| # | Column Name | Type | Values | Example |
|---|-------------|------|--------|---------|
| 1 | `m0_priority_name` | String | M0 team name | "FC Fashion", "GBX", "Trust" |
| 2 | `m1_initiative_name` | String | M1 play name | "Play 1: Fix the Fundamentals" |
| 3 | `key_launch_name` | String | Launch title | "Listing Quality (remove custom size)" |
| 4 | `original_start_quarter` | String | Q#-YYYY | "Q1-2026" |
| 5 | `original_end_quarter` | String | Q#-YYYY | "Q2-2026" |
| 6 | `updated_start_quarter` | String | Q#-YYYY | "Q2-2026" |
| 7 | `updated_end_quarter` | String | Q#-YYYY | "Q3-2026" |
| 8 | `geo_category` | String | Big 3, Remaining Big 4, Global | "Big 3" |
| 9 | `target_geos` | String (CSV) | US, UK, DE, FR, IT, AU, Global, etc. | "US,UK,DE" |
| 10 | `roadmap_change` | String | No Change, Accelerated, Deferred, New | "Deferred" |
| 11 | `change_rationale` | String | Prioritized, Deprioritized, Blocked due to eng capacity, Constrained, Not ready | "Blocked due to eng capacity" |
| 12 | `change_rationale_comment` | String (Free Text) | Any text | "Waiting for platform team to complete API updates" |
| 13 | `cross_priority_dependencies` | String (CSV) | M0 priority names | "C2C,Live" |

### Example CSV Row

```csv
FC Fashion,Play 1: Fix the Fundamentals,Listing Quality (remove custom size),Q1-2026,Q1-2026,Q2-2026,Q2-2026,Big 3,"US,UK,DE",Deferred,Blocked due to eng capacity,"Waiting for platform team to complete API updates","C2C"
```

---

## API Endpoints

### Base URL
- **Development:** `http://localhost:5000`
- **Production:** TBD

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "eBay REN API"
}
```

---

#### 2. Upload CSV
```http
POST /api/upload-csv
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: CSV file (multipart)
- `planning_cycle`: String (e.g., "H2 2026")

**Response:**
```json
{
  "success": true,
  "message": "CSV uploaded successfully for H2 2026",
  "total_launches": 42,
  "planning_cycle": "H2 2026",
  "draft_info": {
    "id": 1,
    "planning_cycle": "H2 2026",
    "last_uploaded_at": "2026-04-13T14:30:00Z",
    "uploaded_by": "Team",
    "total_launches": 42
  }
}
```

---

#### 3. Get Roadmap Data
```http
GET /api/roadmap
```

**Query Parameters:**
- `mode`: "draft" | "approved" (default: "draft")
- `snapshot_id`: Integer (required if mode=approved)
- `planning_cycle`: String (required if mode=draft)
- `m0_priorities[]`: Array of M0 names (multi-select)
- `markets[]`: Array of geo codes (multi-select)
- `planning_cycles[]`: Array of cycle names (multi-select)
- `roadmap_changes[]`: Array of change types (multi-select)
- `highlight_cross_dependencies[]`: Array of M0 names to highlight

**Example Request:**
```http
GET /api/roadmap?mode=draft&planning_cycle=H2%202026&m0_priorities[]=FC%20Fashion&markets[]=US&markets[]=UK&highlight_cross_dependencies[]=C2C
```

**Response:**
```json
{
  "data": [
    {
      "m0_priority": "FC Fashion",
      "business_unit": "Global Verticals",
      "m1_initiatives": [
        {
          "m1_name": "Play 1: Fix the Fundamentals",
          "start_quarter": "Q1-2026",
          "end_quarter": "Q4-2026",
          "key_launches": [
            {
              "name": "Listing Quality (remove custom size)",
              "original_quarter": "Q1-2026",
              "current_quarter": "Q2-2026",
              "shifted": true,
              "shift_direction": "deferred",
              "geo_category": "Big 3",
              "target_geos": ["US", "UK", "DE"],
              "roadmap_change": "Deferred",
              "change_rationale": "Blocked due to eng capacity",
              "change_rationale_comment": "Waiting for platform team",
              "cross_priority_dependencies": ["C2C"],
              "highlighted": true
            }
          ]
        }
      ]
    }
  ],
  "total_m0": 1,
  "total_launches": 1
}
```

---

#### 4. Get All Snapshots
```http
GET /api/snapshots
```

**Response:**
```json
{
  "snapshots": [
    {
      "id": 2,
      "planning_cycle": "H2 2026",
      "version": 2,
      "approved_by": "Jordan",
      "approved_at": "2026-04-08T10:00:00Z",
      "total_launches": 45
    },
    {
      "id": 1,
      "planning_cycle": "H2 2026",
      "version": 1,
      "approved_by": "Jordan",
      "approved_at": "2026-03-15T09:00:00Z",
      "total_launches": 42
    }
  ]
}
```

---

#### 5. Create Snapshot (Approve)
```http
POST /api/snapshots
Content-Type: application/json
```

**Request Body:**
```json
{
  "planning_cycle": "H2 2026",
  "approved_by": "Jordan"
}
```

**Response:**
```json
{
  "snapshot": {
    "id": 3,
    "planning_cycle": "H2 2026",
    "version": 3,
    "approved_by": "Jordan",
    "approved_at": "2026-04-13T14:35:00Z",
    "total_launches": 48
  }
}
```

---

#### 6. Get All Drafts
```http
GET /api/drafts
```

**Response:**
```json
{
  "drafts": [
    {
      "id": 1,
      "planning_cycle": "H2 2026",
      "last_uploaded_at": "2026-04-13T14:30:00Z",
      "uploaded_by": "Team",
      "total_launches": 48
    }
  ]
}
```

---

#### 7. Get M0 Priorities
```http
GET /api/priorities
```

**Response:**
```json
{
  "priorities": [
    {
      "id": "rec0POzFPtgNKTMiG",
      "name": "FC Fashion",
      "business_unit": "Global Verticals"
    },
    {
      "id": "rec0T866114npWfuz",
      "name": "Ads",
      "business_unit": "eBay Services"
    }
  ]
}
```

---

#### 8. Manual Cache Refresh
```http
POST /api/refresh
```

**Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

---

## Database Schema

### PostgreSQL Tables

#### 1. roadmap_snapshots
```sql
CREATE TABLE roadmap_snapshots (
  id SERIAL PRIMARY KEY,
  planning_cycle VARCHAR(50) NOT NULL,
  version INT NOT NULL,
  approved_by VARCHAR(100) DEFAULT 'Jordan',
  approved_at TIMESTAMP NOT NULL,
  csv_data_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_snapshots_cycle ON roadmap_snapshots(planning_cycle);
CREATE INDEX idx_snapshots_approved_at ON roadmap_snapshots(approved_at DESC);
```

---

#### 2. roadmap_draft
```sql
CREATE TABLE roadmap_draft (
  id SERIAL PRIMARY KEY,
  planning_cycle VARCHAR(50) NOT NULL,
  csv_data_json JSONB NOT NULL,
  last_uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by VARCHAR(100) DEFAULT 'Team'
);
```

**Indexes:**
```sql
CREATE INDEX idx_draft_cycle ON roadmap_draft(planning_cycle);
```

---

## Frontend Component Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main dashboard page
├── components/
│   ├── Timeline.tsx               # Main roadmap grid
│   ├── LaunchCard.tsx             # Individual launch card
│   ├── CrossPriorityBadge.tsx     # Colored badge component
│   ├── LaunchTooltip.tsx          # Hover/click tooltip
│   ├── FilterBar.tsx              # Multi-select filters
│   ├── ModeToggle.tsx             # Draft/Approved tabs
│   ├── CSVUpload.tsx              # File upload component
│   ├── ApproveButton.tsx          # Approve planning cycle
│   ├── Header.tsx                 # Page header
│   └── Sidebar.tsx                # Navigation sidebar
├── hooks/
│   ├── useRoadmapData.ts          # Fetch roadmap API
│   ├── useSnapshots.ts            # Snapshot management
│   ├── usePriorityColors.ts       # Auto-assign badge colors
│   └── useFilters.ts              # Filter state management
├── lib/
│   ├── api.ts                     # API client
│   └── utils.ts                   # Utility functions
├── types/
│   └── roadmap.ts                 # TypeScript types
└── utils/
    └── exporters.ts               # PDF/CSV/PPT export
```

---

## TypeScript Types

```typescript
// types/roadmap.ts

export interface KeyLaunch {
  name: string;
  original_quarter: string;
  current_quarter: string;
  shifted: boolean;
  shift_direction?: 'deferred' | 'accelerated';
  geo_category: 'Big 3' | 'Remaining Big 4' | 'Global';
  target_geos: string[];
  roadmap_change: 'No Change' | 'Accelerated' | 'Deferred' | 'New';
  change_rationale?: string;
  change_rationale_comment?: string;
  cross_priority_dependencies: string[];
  highlighted?: boolean;
}

export interface M1Initiative {
  m1_name: string;
  start_quarter?: string;
  end_quarter?: string;
  key_launches: KeyLaunch[];
}

export interface M0Priority {
  m0_priority: string;
  business_unit: string;
  m1_initiatives: M1Initiative[];
}

export interface RoadmapData {
  data: M0Priority[];
  total_m0: number;
  total_launches: number;
}

export interface RoadmapFilters {
  mode: 'draft' | 'approved';
  snapshot_id?: number;
  planning_cycle?: string;
  m0_priorities?: string[];
  markets?: string[];
  planning_cycles?: string[];
  roadmap_changes?: string[];
  highlight_cross_dependencies?: string[];
}

export interface Snapshot {
  id: number;
  planning_cycle: string;
  version: number;
  approved_by: string;
  approved_at: string;
  total_launches: number;
}
```

---

## Color Palette

### Geo Categories
```typescript
const GEO_COLORS = {
  'Big 3': '#4169E1',           // Royal Blue
  'Remaining Big 4': '#FF8C42', // Orange/Peach
  'Global': '#E0E0E0'            // Light Gray
};
```

### Roadmap Change Status
```typescript
const STATUS_COLORS = {
  'New': '#3B82F6',              // Blue
  'Shifted': '#FFD700',          // Yellow
  'Deferred': '#DC2626',         // Red
  'Accelerated': '#10B981'       // Green
};
```

### Cross-Priority Badge Colors
```typescript
const PRIORITY_COLORS = [
  '#A855F7', // Purple (C2C)
  '#10B981', // Green (Live)
  '#14B8A6', // Teal
  '#F59E0B', // Yellow
  '#EC4899', // Pink
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316'  // Orange
];
```

---

## Environment Variables

### Backend (.env)
```bash
# Airtable
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=appXFsy8DcRl4C5mx

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ebay_ren

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key

# Cache
CACHE_TTL_SECONDS=3600
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Dependencies

### Backend (requirements.txt)
```
flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
requests==2.31.0
pandas==2.1.4
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "recharts": "^2.10.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "pptxgenjs": "^3.12.0"
  }
}
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial page load | < 2 seconds | TBD |
| Filter application | < 500ms | TBD |
| API response time | < 300ms | TBD |
| Handles launches | 500+ | TBD |
| Concurrent users | 50+ | TBD |
| Airtable cache TTL | 60 minutes | ✅ |

---

## Security Considerations

1. **API Authentication:** Currently open access (MVP)
2. **CORS:** Configured for frontend domain only
3. **Input Validation:** CSV schema validation on upload
4. **SQL Injection:** Using parameterized queries (SQLAlchemy)
5. **XSS Prevention:** React escapes by default
6. **HTTPS:** Required in production (Vercel/Railway default)

---

## Testing Strategy

### Backend Tests
```bash
# Unit tests
pytest backend/tests/test_csv_parser.py
pytest backend/tests/test_filters.py
pytest backend/tests/test_data_merger.py

# Integration tests
pytest backend/tests/integration/test_api.py
```

### Frontend Tests
```bash
# Component tests
npm test components/LaunchCard.test.tsx

# E2E tests
npm run test:e2e
```

### Manual Test Scenarios
1. Upload CSV → Verify draft created
2. Filter by M0 → Verify correct data shown
3. Approve draft → Verify snapshot created
4. Switch to approved mode → Verify read-only
5. Highlight cross-deps → Verify visual treatment
6. Export to PDF → Verify file generated

---

## Deployment Architecture

### Production Setup
```
┌──────────────┐
│   Vercel     │ ← Frontend (Next.js)
│  Frontend    │
└──────┬───────┘
       │ HTTPS
       ↓
┌──────────────┐
│  Railway/    │ ← Backend (Flask API)
│   Render     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  PostgreSQL  │ ← Database (managed)
│   Database   │
└──────────────┘
       ↑
       │
┌──────────────┐
│   Airtable   │ ← External data source
│     API      │
└──────────────┘
```

---

## Monitoring & Logging

### Backend Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Metrics to Track
- API response times
- CSV upload success rate
- Filter query performance
- Airtable API call count
- Cache hit rate
- Error rates by endpoint

---

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- iPad Safari (primary tablet target)

---

## Accessibility

- WCAG 2.1 Level AA compliance (future)
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios (4.5:1 minimum)
- Focus indicators on all interactive elements

---

## Known Limitations (MVP)

1. No real-time Airtable sync (hourly cache)
2. No user authentication
3. No comments system
4. No change log view
5. CSV upload only (no Airtable Key Launch table)
6. Desktop/tablet only (no mobile phone optimization)
7. Single language (English)

---

## Future API Extensions

### Planned Endpoints (v2)
- `POST /api/comments` - Add executive comments
- `GET /api/changelog` - Get change log table
- `GET /api/insights` - AI-generated insights
- `POST /api/export` - Server-side export (better quality)
- `GET /api/compare` - Compare two snapshots
- `POST /api/notifications` - Configure email alerts

---

## Reference Links

- **Airtable API Docs:** https://airtable.com/developers/web/api/introduction
- **Flask Docs:** https://flask.palletsprojects.com/
- **Next.js Docs:** https://nextjs.org/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Support Contacts

- **Backend Issues:** Check backend/README.md
- **Frontend Issues:** Check frontend/README.md (when created)
- **Airtable Access:** Contact eBay IT
- **Database Issues:** Contact DevOps

---

**Last Updated:** April 13, 2026  
**Version:** 1.0 (MVP Backend Complete)
