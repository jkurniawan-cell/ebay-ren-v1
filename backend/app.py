"""
eBay REN (Roadmap Intelligence Engine) - Flask API Server
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from app.airtable_client import AirtableClient
from app.csv_parser import CSVParser
from app.data_merger import DataMerger
from app.filters import RoadmapFilter
from app.snapshot_manager import SnapshotManager
from app.database import init_db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize database
init_db()

# Initialize Airtable client
airtable = AirtableClient()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'eBay REN API'})

@app.route('/api/refresh', methods=['POST'])
def refresh_cache():
    """Manually refresh Airtable cache."""
    airtable.clear_cache()
    return jsonify({'message': 'Cache cleared successfully'})

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    """
    Upload and validate CSV file.

    Request:
        - file: CSV file (multipart/form-data)
        - planning_cycle: Planning cycle name (e.g., "H2 2026")

    Response:
        - success: bool
        - message: str
        - total_launches: int
    """
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400

    file = request.files['file']
    planning_cycle = request.form.get('planning_cycle', 'H2 2026')

    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400

    try:
        # Read file content
        file_content = file.read().decode('utf-8')

        # Validate CSV
        is_valid, error_message = CSVParser.validate_csv(file_content)
        if not is_valid:
            return jsonify({'success': False, 'message': error_message}), 400

        # Parse CSV
        csv_data = CSVParser.csv_to_json(file_content)

        # Save as draft for the provided planning_cycle
        draft_info = SnapshotManager.save_draft(planning_cycle, csv_data)

        # ALSO save as snapshot (approved version)
        snapshot_info = SnapshotManager.create_snapshot(
            planning_cycle=planning_cycle,
            csv_data=csv_data,
            approved_by="System"
        )

        return jsonify({
            'success': True,
            'message': f'CSV uploaded successfully for {planning_cycle}',
            'total_launches': csv_data['total_count'],
            'planning_cycle': planning_cycle,
            'draft_info': draft_info,
            'snapshot_info': snapshot_info
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error processing CSV: {str(e)}'}), 500

@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    """
    Get roadmap data with filters.

    Query Params:
        - mode: "draft" or "approved" (default: "draft")
        - snapshot_id: Snapshot ID (required if mode=approved)
        - planning_cycle: Planning cycle name (required if mode=draft)
        - m0_priorities[]: M0 priority names (multi-select)
        - markets[]: Market/geo names (multi-select)
        - planning_cycles[]: Planning cycle filters (multi-select)
        - roadmap_changes[]: Roadmap change types (multi-select)

    Response:
        - data: Roadmap data
        - total_m0: int
        - total_launches: int
    """
    try:
        # Get mode
        mode = request.args.get('mode', 'draft')

        # Get CSV data based on mode
        if mode == 'approved':
            # Support fetching by planning_cycle OR snapshot_id
            planning_cycle = request.args.get('planning_cycle')
            snapshot_id = request.args.get('snapshot_id', type=int)

            if planning_cycle:
                # Fetch by planning cycle name (for History mode)
                snapshots = SnapshotManager.get_all_snapshots()
                matching = [s for s in snapshots if s['planning_cycle'] == planning_cycle]
                if not matching:
                    return jsonify({'error': f'No snapshot found for {planning_cycle}'}), 404
                # Get latest version if multiple exist
                snapshot = max(matching, key=lambda x: x['id'])
                csv_data = snapshot['csv_data']
            elif snapshot_id:
                # Fetch by snapshot ID (legacy support)
                snapshot = SnapshotManager.get_snapshot_by_id(snapshot_id)
                if not snapshot:
                    return jsonify({'error': 'Snapshot not found'}), 404
                csv_data = snapshot['csv_data']
            else:
                return jsonify({'error': 'planning_cycle or snapshot_id required for approved mode'}), 400
        else:  # draft mode
            planning_cycle = request.args.get('planning_cycle', 'H2 2026')
            draft = SnapshotManager.get_draft(planning_cycle)

            if not draft:
                return jsonify({'error': f'No draft found for {planning_cycle}'}), 404

            csv_data = draft['csv_data']

        # Get Airtable data (skip if API key not configured)
        if airtable.api_key:
            try:
                m0_priorities = airtable.get_priorities_m0()
                m1_plays = airtable.get_plays_m1()

                # Merge data
                merged_data = DataMerger.merge_data(
                    m0_priorities,
                    m1_plays,
                    csv_data.get('launches', [])
                )
            except Exception as e:
                # Fallback: use CSV data only
                print(f"Warning: Airtable fetch failed, using CSV data only: {e}")
                merged_data = DataMerger.csv_only_data(csv_data.get('launches', []))
        else:
            # No Airtable API key - use CSV data only
            merged_data = DataMerger.csv_only_data(csv_data.get('launches', []))

        # Apply filters
        m0_filter = request.args.getlist('m0_priorities[]')
        market_filter = request.args.getlist('markets[]')
        roadmap_change_filter = request.args.getlist('roadmap_changes[]')
        roadmap_ownership_filter = request.args.getlist('delivery_owners[]')
        beneficiary_filter = request.args.getlist('beneficiaries[]')

        filtered_data = RoadmapFilter.apply_filters(
            merged_data['data'],
            m0_filter=m0_filter if m0_filter else None,
            market_filter=market_filter if market_filter else None,
            roadmap_change_filter=roadmap_change_filter if roadmap_change_filter else None,
            roadmap_ownership_filter=roadmap_ownership_filter if roadmap_ownership_filter else None,
            beneficiary_filter=beneficiary_filter if beneficiary_filter else None
        )

        return jsonify({
            'data': filtered_data,
            'total_m0': len(filtered_data),
            'total_launches': sum(
                len(m1['key_launches'])
                for m0 in filtered_data
                for m1 in m0['m1_initiatives']
            )
        })

    except Exception as e:
        return jsonify({'error': f'Error fetching roadmap: {str(e)}'}), 500

@app.route('/api/snapshots', methods=['GET'])
def get_snapshots():
    """Get all approved snapshots."""
    try:
        snapshots = SnapshotManager.get_all_snapshots()
        return jsonify({'snapshots': snapshots})
    except Exception as e:
        return jsonify({'error': f'Error fetching snapshots: {str(e)}'}), 500

@app.route('/api/snapshots/list', methods=['GET'])
def list_snapshot_cycles():
    """Get unique planning cycles from snapshots for History dropdown."""
    try:
        snapshots = SnapshotManager.get_all_snapshots()
        # Extract unique planning cycles
        cycles = list(set([s['planning_cycle'] for s in snapshots]))
        cycles.sort()
        return jsonify({'planning_cycles': cycles})
    except Exception as e:
        return jsonify({'error': f'Error fetching planning cycles: {str(e)}'}), 500

@app.route('/api/snapshots', methods=['POST'])
def create_snapshot():
    """
    Create a new approved snapshot.

    Request Body:
        - planning_cycle: Planning cycle name
        - approved_by: Who approved (default: "Jordan")

    Response:
        - snapshot: Snapshot info
    """
    try:
        data = request.json
        planning_cycle = data.get('planning_cycle')
        approved_by = data.get('approved_by', 'Jordan')

        if not planning_cycle:
            return jsonify({'error': 'planning_cycle required'}), 400

        # Get current draft
        draft = SnapshotManager.get_draft(planning_cycle)
        if not draft:
            return jsonify({'error': f'No draft found for {planning_cycle}'}), 404

        # Create snapshot
        snapshot = SnapshotManager.create_snapshot(
            planning_cycle,
            draft['csv_data'],
            approved_by
        )

        return jsonify({'snapshot': snapshot})

    except Exception as e:
        return jsonify({'error': f'Error creating snapshot: {str(e)}'}), 500

@app.route('/api/drafts', methods=['GET'])
def get_drafts():
    """Get all drafts."""
    try:
        drafts = SnapshotManager.get_all_drafts()
        return jsonify({'drafts': drafts})
    except Exception as e:
        return jsonify({'error': f'Error fetching drafts: {str(e)}'}), 500

@app.route('/api/priorities', methods=['GET'])
def get_priorities():
    """Get all M0 priorities for filter dropdown."""
    try:
        priorities = airtable.get_priorities_m0()
        return jsonify({'priorities': priorities})
    except Exception as e:
        return jsonify({'error': f'Error fetching priorities: {str(e)}'}), 500

@app.route('/api/m0-summary', methods=['GET'])
def get_m0_summary():
    """Get M0 priorities with their M1 initiatives aggregated by quarter."""
    try:
        planning_cycle = request.args.get('planning_cycle', 'H2 2026')

        # Get draft data
        draft = SnapshotManager.get_draft(planning_cycle)
        if not draft:
            return jsonify({'error': f'No draft found for {planning_cycle}'}), 404

        csv_data = draft['csv_data']
        launches = csv_data.get('launches', [])

        # Get Airtable data for M0/M1 metadata
        if airtable.api_key:
            try:
                m0_priorities = airtable.get_priorities_m0()
                m1_plays = airtable.get_plays_m1()
            except Exception as e:
                print(f"Warning: Airtable fetch failed: {e}")
                m0_priorities = []
                m1_plays = []
        else:
            m0_priorities = []
            m1_plays = []

        # Pillar mapping based on M0 names (from actual CSV data)
        PILLAR_MAPPING = {
            # Strategic Priorities
            'C2C': 'Strategic',
            'eBay Live': 'Strategic',
            'Shipping': 'Strategic',
            'FC: Collectibles': 'Strategic',
            'FC: P&A': 'Strategic',
            'FC: Fashion': 'Strategic',
            'FC: Vehicles': 'Strategic',
            'FC: Electronics & HI': 'Strategic',
            'GBX': 'Strategic',
            'Global Buying Hub': 'Strategic',

            # Horizontal Innovation
            'Trust': 'Horizontal',
            'Payments & FS': 'Horizontal',
            'B2C': 'Horizontal',
            'B2C and Stores': 'Horizontal',
            'Buyer Experience': 'Horizontal',
            'E2E Regulatory': 'Horizontal',
            'E2E Regulatory & Compliance': 'Horizontal',
            'Compliance': 'Horizontal',
            'Ads': 'Horizontal',
            'Marketing Transformation': 'Horizontal',
            'eBay Memory': 'Horizontal',

            # Platform Priorities
            'Agentic Commerce': 'Platform',
            'Search of the Future': 'Platform',
            'Project Obsidian': 'Platform',
            'eBay Knowledge Platform': 'Platform',
            'Tokenization': 'Platform',
            'Discovery Platform': 'Platform',
            'eBay Merchant Services': 'Platform',
            'GCX Tech Transform': 'Platform',

            # Platform Essentials
            'Availability': 'Platform Essentials',
            'Security, RAI, DG and Compliance': 'Platform Essentials',
            'Essential Engineering': 'Platform Essentials',
            'Tech Velocity': 'Platform Essentials',
            'RTB': 'Platform Essentials',
        }

        # Organize data by M0 -> M1s with quarterly breakdown
        m0_summary = {}

        for launch in launches:
            m0_name = launch.get('m0_priority_name', 'Unknown')
            m1_name = launch.get('m1_initiative_name', 'Unknown')

            if m0_name not in m0_summary:
                # Find M0 metadata from Airtable
                m0_meta = next((p for p in m0_priorities if p.get('name') == m0_name), {})
                # Use pillar mapping, fallback to Airtable, then default to Strategic
                pillar = PILLAR_MAPPING.get(m0_name, m0_meta.get('pillar', 'Strategic'))
                m0_summary[m0_name] = {
                    'name': m0_name,
                    'business_unit': m0_meta.get('business_unit', ''),
                    'pillar': pillar,
                    'm1_initiatives': {}
                }

            if m1_name not in m0_summary[m0_name]['m1_initiatives']:
                # Find M1 metadata from Airtable
                m1_meta = next((p for p in m1_plays if p.get('name') == m1_name), {})
                m0_summary[m0_name]['m1_initiatives'][m1_name] = {
                    'name': m1_name,
                    'description': m1_meta.get('description', ''),
                    'start_quarter': launch.get('start_quarter', ''),
                    'end_quarter': launch.get('end_quarter', ''),
                    'quarters': set(),
                    'launch_count': 0,
                    'status': 'Planned'
                }

            # Add quarters this M1 spans
            start_q = launch.get('start_quarter', '')
            end_q = launch.get('end_quarter', '')
            if start_q and end_q:
                m0_summary[m0_name]['m1_initiatives'][m1_name]['quarters'].add(start_q)
                m0_summary[m0_name]['m1_initiatives'][m1_name]['quarters'].add(end_q)

            m0_summary[m0_name]['m1_initiatives'][m1_name]['launch_count'] += 1

        # Convert sets to lists for JSON serialization
        for m0 in m0_summary.values():
            for m1 in m0['m1_initiatives'].values():
                m1['quarters'] = sorted(list(m1['quarters']))

        # Convert to list format
        result = list(m0_summary.values())
        for m0 in result:
            m0['m1_initiatives'] = list(m0['m1_initiatives'].values())

        return jsonify(result)
    except Exception as e:
        print(f"Error in m0-summary: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
