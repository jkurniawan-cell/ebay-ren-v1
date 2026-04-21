# eBay REN Backend API

Flask-based API server for the eBay Roadmap Intelligence Engine (REN) dashboard.

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
AIRTABLE_API_KEY=your_actual_api_key
AIRTABLE_BASE_ID=appXFsy8DcRl4C5mx
DATABASE_URL=postgresql://username:password@localhost:5432/ebay_ren
```

### 3. Set Up PostgreSQL Database

```bash
# Create database
createdb ebay_ren

# Or using psql
psql
CREATE DATABASE ebay_ren;
\q
```

### 4. Run the Server

```bash
python app.py
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Manual Cache Refresh
```
POST /api/refresh
```

### Upload CSV
```
POST /api/upload-csv
Content-Type: multipart/form-data

Form data:
- file: CSV file
- planning_cycle: "H2 2026"
```

### Get Roadmap Data
```
GET /api/roadmap?mode=draft&planning_cycle=H2 2026&m0_priorities[]=GBX&markets[]=US&planning_cycles[]=Q2-2026&roadmap_changes[]=Deferred
```

### Get All Snapshots
```
GET /api/snapshots
```

### Create Snapshot (Approve)
```
POST /api/snapshots
Content-Type: application/json

{
  "planning_cycle": "H2 2026",
  "approved_by": "Jordan"
}
```

### Get All Drafts
```
GET /api/drafts
```

### Get M0 Priorities
```
GET /api/priorities
```

## CSV Schema

Required columns:
1. `m0_priority_name`
2. `m1_initiative_name`
3. `key_launch_name`
4. `original_start_quarter`
5. `original_end_quarter`
6. `updated_start_quarter`
7. `updated_end_quarter`
8. `geo_category`
9. `target_geos`
10. `roadmap_change`
11. `change_rationale`
12. `cross_priority_dependencies`

Example CSV:
```csv
m0_priority_name,m1_initiative_name,key_launch_name,original_start_quarter,original_end_quarter,updated_start_quarter,updated_end_quarter,geo_category,target_geos,roadmap_change,change_rationale,cross_priority_dependencies
GBX,User preferences for international settings,Risk GBX Model optimizations,Q1-2026,Q1-2026,Q1-2026,Q2-2026,Big 3,"US,UK,DE",No Change,,"Shipping,Trust"
```

## Development

### Run with auto-reload
```bash
FLASK_DEBUG=True python app.py
```

### Clear cache
```bash
curl -X POST http://localhost:5000/api/refresh
```

## Deployment

See deployment guides for:
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [Heroku](https://heroku.com/)
