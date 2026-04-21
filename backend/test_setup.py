"""
Quick test script to verify backend setup is working.
"""
import sys
sys.path.insert(0, '.')

from app.csv_parser import CSVParser
from app.data_merger import DataMerger
from app.filters import RoadmapFilter

# Test CSV parsing
print("Testing CSV Parser...")
with open('sample_data.csv', 'r') as f:
    csv_content = f.read()

is_valid, error = CSVParser.validate_csv(csv_content)
if not is_valid:
    print(f"❌ CSV Validation Failed: {error}")
    sys.exit(1)

print("✅ CSV Validation Passed")

# Parse CSV
csv_data = CSVParser.csv_to_json(csv_content)
print(f"✅ Parsed {csv_data['total_count']} key launches")

# Test data merger
print("\nTesting Data Merger...")
mock_m0 = [
    {'name': 'FC Fashion', 'business_unit': 'Global Verticals'},
    {'name': 'GBX', 'business_unit': 'Buyer & Community'},
    {'name': 'Trust', 'business_unit': 'eBay Services'}
]

mock_m1 = [
    {'name': 'Play 1: Fix the Fundamentals Buying experience'},
    {'name': 'Play 2: Set Trust Standard AG/Auth'},
    {'name': 'User preferences for international settings'},
    {'name': 'Risk Management'}
]

merged = DataMerger.merge_data(mock_m0, mock_m1, csv_data['launches'])
print(f"✅ Merged data for {merged['total_m0']} M0 priorities")

# Test filtering
print("\nTesting Filters...")
filtered = RoadmapFilter.apply_filters(
    merged['data'],
    m0_filter=['FC Fashion'],
    market_filter=['US', 'UK']
)
print(f"✅ Filtered to {len(filtered)} M0(s)")

# Show sample output
if filtered:
    sample_m0 = filtered[0]
    print(f"\nSample Output for '{sample_m0['m0_priority']}':")
    print(f"  Business Unit: {sample_m0['business_unit']}")
    print(f"  M1 Initiatives: {len(sample_m0['m1_initiatives'])}")
    if sample_m0['m1_initiatives']:
        sample_m1 = sample_m0['m1_initiatives'][0]
        print(f"  Sample M1: {sample_m1['m1_name']}")
        print(f"  Key Launches: {len(sample_m1['key_launches'])}")
        if sample_m1['key_launches']:
            sample_launch = sample_m1['key_launches'][0]
            print(f"\n  Sample Launch:")
            print(f"    Name: {sample_launch['key_launch_name']}")
            print(f"    Geo Category: {sample_launch['geo_category']}")
            print(f"    Target Geos: {', '.join(sample_launch['target_geos_list'])}")
            print(f"    Roadmap Change: {sample_launch['roadmap_change']}")
            print(f"    Change Rationale: {sample_launch['change_rationale']}")
            if sample_launch.get('change_rationale_comment'):
                print(f"    Comment: {sample_launch['change_rationale_comment']}")
            if sample_launch.get('cross_priority_dependencies_list'):
                print(f"    Cross-Priority Deps: {', '.join(sample_launch['cross_priority_dependencies_list'])}")

print("\n✅ All backend tests passed!")
print("\nNext steps:")
print("1. Set up PostgreSQL database: createdb ebay_ren")
print("2. Configure .env file with Airtable API key")
print("3. Run: python app.py")
