"""
eBay REN (Roadmap Intelligence Engine) - Flask API Server
Read-only Airtable integration via MCP
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from app.airtable_mcp import get_roadmap_data, get_unique_m0_priorities
from app.filters import RoadmapFilter
from app.data_merger import DataMerger

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'eBay REN API'})

@app.route('/api/refresh', methods=['POST'])
def refresh_cache():
    """No-op for backwards compatibility. Data is always fresh from Airtable."""
    return jsonify({'message': 'Data is always fresh from Airtable (read-only mode)'})


@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    """
    Get roadmap data from Airtable with filters (read-only).

    Query Params:
        - m0_priorities[]: M0 priority names (multi-select)
        - markets[]: Market/geo names (multi-select)
        - roadmap_changes[]: Roadmap change types (multi-select)

    Response:
        - data: Roadmap data grouped by M0 -> M1 -> Launches
        - total_m0: int
        - total_launches: int
    """
    try:
        # Fetch data from Airtable
        airtable_data = get_roadmap_data()

        if 'error' in airtable_data:
            return jsonify({'error': airtable_data['error']}), 500

        launches = airtable_data['launches']

        # Group launches by M0 -> M1 structure (use DataMerger for consistency)
        merged_data = DataMerger.csv_only_data(launches)

        # Apply filters
        m0_filter = request.args.getlist('m0_priorities[]')
        market_filter = request.args.getlist('markets[]')
        roadmap_change_filter = request.args.getlist('roadmap_changes[]')

        filtered_data = RoadmapFilter.apply_filters(
            merged_data['data'],
            m0_filter=m0_filter if m0_filter else None,
            market_filter=market_filter if market_filter else None,
            roadmap_change_filter=roadmap_change_filter if roadmap_change_filter else None
        )

        return jsonify({
            'data': filtered_data,
            'total_m0': len(filtered_data),
            'total_launches': sum(
                len(m1['key_launches'])
                for m0 in filtered_data
                for m1 in m0['m1_initiatives']
            ),
            'source': 'airtable_mcp'
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error fetching roadmap: {str(e)}'}), 500


@app.route('/api/priorities', methods=['GET'])
def get_priorities():
    """Get all unique M0 priorities for filter dropdown."""
    try:
        priorities = get_unique_m0_priorities()
        return jsonify({'priorities': priorities})
    except Exception as e:
        return jsonify({'error': f'Error fetching priorities: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
