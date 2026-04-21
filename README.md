# eBay REN V3 (Roadmap Intelligence Engine)

Executive dashboard for visualizing roadmap data across 16 eBay teams (M0 Priorities). Full-stack application with Flask backend and Next.js frontend.

![eBay REN Dashboard](https://img.shields.io/badge/eBay-REN_V3-0064D2?style=for-the-badge)

## 🚀 Quick Start for New Users

### Prerequisites
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ebay-ren-v3.git
cd ebay-ren-v3
```

### Step 2: Backend Setup

```bash
cd backend

# Install Python dependencies
pip3 install flask flask-cors pandas requests python-dotenv sqlalchemy psycopg2-binary

# Configure environment (optional - Airtable integration)
cp .env.example .env
# Edit .env if you have an Airtable API key (optional - system works without it)

# Start the backend server
python3 app.py
```

✅ Backend is now running on **http://localhost:5000**

The database (SQLite) is created automatically on first run at `backend/ebay_ren.db`.

### Step 3: Frontend Setup

Open a **new terminal window** and run:

```bash
cd frontend

# Install Node dependencies (this may take a few minutes)
npm install

# Start the frontend dev server
npm run dev
```

✅ Frontend is now running on **http://localhost:3000**

### Step 4: Access the Dashboard

Open your browser and go to:
```
http://localhost:3000
```

You should see the eBay REN dashboard! 🎉

### Step 5: Upload Data (Optional)

1. Click on the "Upload CSV" button in the dashboard
2. Select a CSV file with roadmap data (see [CSV Schema](#csv-schema) below)
3. Choose a planning cycle (e.g., "H2 2026")
4. Click Upload

Sample CSV format:
- See `backend/sample_data.csv` for an example
- Or use the CSV template in the PRD documentation

## 📁 Project Structure

```
ebay-ren-v3/
├── backend/              # Flask API server
│   ├── app/              # Application modules
│   │   ├── airtable_client.py   # Airtable integration
│   │   ├── csv_parser.py        # CSV parsing logic
│   │   ├── data_merger.py       # Merge Airtable + CSV data
│   │   ├── filters.py           # Multi-dimensional filtering
│   │   ├── snapshot_manager.py  # Draft/Approved versioning
│   │   └── database.py          # SQLAlchemy models
│   ├── app.py            # Main Flask app
│   ├── requirements.txt  # Python dependencies
│   └── ebay_ren.db      # SQLite database (auto-created)
│
├── frontend/             # Next.js dashboard
│   ├── app/              # Next.js pages
│   │   ├── page.tsx             # Home page (M0 grid)
│   │   └── timeline/page.tsx    # Timeline view
│   ├── components/       # React components
│   │   ├── Timeline.tsx         # Main roadmap grid
│   │   ├── LaunchCard.tsx       # Individual launch cards
│   │   ├── FilterBar.tsx        # Multi-select filters
│   │   └── ...
│   ├── lib/              # Utilities
│   │   └── api.ts               # Backend API client
│   └── package.json      # Node dependencies
│
└── README.md             # This file
```

## 🎯 Features

### ✅ Core Features
- **Dual-Mode Dashboard**: Upcoming (Draft) vs Approved (Locked) snapshots
- **Multi-Quarter Spanning**: Launches display across all quarters they span
- **Cross-Priority Dependencies**: Visual badges showing collaborating M0 priorities
- **Airtable Integration**: Optional sync with M0/M1 metadata (graceful fallback to CSV-only)
- **Compact Landscape View**: Optimized for maximum content per screen
- **eBay Official Branding**: Multi-color logo (e, B, a, y)

### 🎨 Visualization
- **Timeline Grid**: Quarters as columns, M1 initiatives as rows
- **Launch Cards**: Geo-coded colors (Big 3, Remaining Big 4, Global)
- **Change Indicators**: New (Blue), Deferred (Red), Accelerated (Green)
- **Country Flags**: Target geo visualization
- **Hover Tooltips**: Detailed launch information on hover

### 🔧 Data Management
- **CSV Upload**: Drag-and-drop interface for roadmap data
- **Snapshot System**: Approve drafts to create frozen versions
- **Version History**: Track approved snapshots by planning cycle
- **Multi-Dimensional Filtering**: M0, Market, Planning Cycle, Roadmap Changes

## 📊 CSV Schema

Your CSV file should have these columns:

| Column Name | Description | Example |
|------------|-------------|---------|
| `Priority (M0)` | M0 Priority name | "Payments & FS" |
| `Play (M1)` | M1 Initiative name | "Enable sellers to grow" |
| `Roadmap Item` | Key Launch name | "US FaD UX" |
| `Original Start Quarter` | Initial start quarter | "Q1-2026" |
| `Original End Quarter` | Initial end quarter | "Q2-2026" |
| `Updated Start Quarter` | Current start quarter | "Q2-2026" |
| `Updated End Quarter` | Current end quarter | "Q4-2026" |
| `Geo Category` | Market category | "Big 3", "Remaining Big 4", "Global" |
| `Target Geos` | Target countries | "US, UK, Germany" |
| `Roadmap Change` | Change status | "No Change", "New", "Deferred", "Accelerated" |
| `Change Rationale` | Reason for change | "Resource constraints" |
| `Cross Priority Dependencies` | Collaborating M0s | "Trust, GBX" |

**Sample CSV:** See `backend/sample_data.csv` for a complete example.

**Quarter Format:** Must be `Q[1-4]-YYYY` (e.g., "Q2-2026", "Q4-2026")

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/refresh` - Clear Airtable cache
- `POST /api/upload-csv` - Upload key launch CSV
- `GET /api/roadmap` - Get filtered roadmap data
- `GET /api/snapshots` - List approved snapshots
- `POST /api/snapshots` - Create new snapshot (approve)
- `GET /api/drafts` - List drafts
- `GET /api/priorities` - Get M0 priorities

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/refresh` | Clear Airtable cache |
| `POST` | `/api/upload-csv` | Upload roadmap CSV |
| `GET` | `/api/roadmap` | Get filtered roadmap data |
| `GET` | `/api/snapshots` | List approved snapshots |
| `POST` | `/api/snapshots` | Create snapshot (approve draft) |
| `GET` | `/api/drafts` | List all drafts |
| `GET` | `/api/priorities` | Get M0 priorities |

## ⚙️ Configuration

### Backend Environment Variables (Optional)

Create `backend/.env` for Airtable integration:

```env
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
DATABASE_URL=sqlite:///ebay_ren.db
```

**Note:** The system works without Airtable by using CSV-only mode.

### Frontend Environment Variables (Optional)

Create `frontend/.env.local` to change API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Default is `http://localhost:5000` if not set.

## 🐛 Troubleshooting

### Backend won't start
- **Error:** `ModuleNotFoundError`
  - **Fix:** Run `pip3 install -r requirements.txt` in the backend folder

### Frontend shows "Loading..." forever
- **Error:** Cannot connect to backend
  - **Fix:** Make sure backend is running on port 5000
  - **Check:** Open http://localhost:5000/api/health in your browser

### No data showing
- **Error:** Empty dashboard
  - **Fix:** Upload a CSV file through the UI or use the sample data
  - **Check:** Verify CSV format matches the schema above

### Port already in use
- **Error:** `Address already in use`
  - **Fix:** Kill the process using the port:
    ```bash
    # Backend (port 5000)
    lsof -ti:5000 | xargs kill -9
    
    # Frontend (port 3000)
    lsof -ti:3000 | xargs kill -9
    ```

## 📚 Documentation

- [CLAUDE.md](CLAUDE.md) - Development guide for working with Claude Code
- [PRD.md](PRD.md) - Product Requirements Document
- [Backend README](backend/README.md) - Backend API details

## 🤝 Contributing

This is an internal eBay project. For questions or issues, contact the Product Operations team.

## 📄 License

Internal eBay project - Confidential and Proprietary

---

Built with ❤️ by the eBay Product Operations Team
