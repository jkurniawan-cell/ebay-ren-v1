# eBay REN (Roadmap Intelligence Engine)

Executive dashboard for visualizing roadmap data across 16 eBay teams (M0 Priorities).

## Project Structure

```
REN_V3/
├── backend/          # Python Flask API
│   ├── app/          # Application modules
│   ├── app.py        # Main Flask app
│   ├── requirements.txt
│   └── README.md
├── frontend/         # React Next.js dashboard
│   └── (to be created)
└── README.md         # This file
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Airtable API key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Airtable API key and database URL

# Create database
createdb ebay_ren

# Run server
python app.py
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

### ✅ Implemented
- ✅ Backend API with Flask
- ✅ Airtable integration (M0 Priorities, M1 Plays)
- ✅ CSV upload for Key Launch data
- ✅ Filtering (M0, Market, Planning Cycle, Roadmap Changes)
- ✅ Snapshot system (Draft vs. Approved modes)
- ✅ PostgreSQL database for versioning
- ✅ Cross-priority dependency badges
- ✅ Change rationale comments

### 🚧 In Progress
- 🚧 Frontend React/Next.js dashboard
- 🚧 Timeline visualization
- 🚧 Cross-priority dependency filter with highlighting
- 🚧 Export functionality (PDF/CSV/PPT)

### 📋 Roadmap
- Comments system
- Change log view
- Advanced analytics
- Real-time Airtable sync

## CSV Schema

Required columns (13 total):
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
12. `change_rationale_comment` (NEW)
13. `cross_priority_dependencies` (NEW)

See `backend/sample_data.csv` for examples.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/refresh` - Clear Airtable cache
- `POST /api/upload-csv` - Upload key launch CSV
- `GET /api/roadmap` - Get filtered roadmap data
- `GET /api/snapshots` - List approved snapshots
- `POST /api/snapshots` - Create new snapshot (approve)
- `GET /api/drafts` - List drafts
- `GET /api/priorities` - Get M0 priorities

## Development

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

See individual README files in `backend/` and `frontend/` for deployment instructions.

## Documentation

- [Product Requirements Document](/.claude/plans/cuddly-stargazing-teapot.md)
- [Backend API Documentation](/backend/README.md)
- Frontend Documentation (coming soon)

## Support

For issues or questions, contact the eBay Product Operations team.

## License

Internal eBay project - Confidential and Proprietary
