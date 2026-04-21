"""
Airtable API client with caching for eBay REN dashboard.
"""
import requests
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import urllib3

# Disable SSL warnings for development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class AirtableClient:
    """Client for fetching data from Airtable with hourly caching."""

    def __init__(self):
        self.api_key = os.getenv('AIRTABLE_API_KEY')
        self.base_id = os.getenv('AIRTABLE_BASE_ID', 'appXFsy8DcRl4C5mx')
        self.base_url = f'https://api.airtable.com/v0/{self.base_id}'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        self.cache = {}
        self.cache_ttl = int(os.getenv('CACHE_TTL_SECONDS', 3600))  # 1 hour default

    def _is_cache_valid(self, key: str) -> bool:
        """Check if cached data is still valid."""
        if key not in self.cache:
            return False
        cached_time, _ = self.cache[key]
        return datetime.now() - cached_time < timedelta(seconds=self.cache_ttl)

    def _get_from_cache(self, key: str) -> Optional[any]:
        """Get data from cache if valid."""
        if self._is_cache_valid(key):
            _, data = self.cache[key]
            return data
        return None

    def _set_cache(self, key: str, data: any):
        """Set data in cache with timestamp."""
        self.cache[key] = (datetime.now(), data)

    def clear_cache(self):
        """Manually clear all cache."""
        self.cache = {}

    def _fetch_table(self, table_id: str, fields: List[str] = None) -> List[Dict]:
        """Fetch all records from a table."""
        url = f'{self.base_url}/{table_id}'
        params = {}
        if fields:
            params['fields[]'] = fields

        records = []
        offset = None

        while True:
            if offset:
                params['offset'] = offset

            response = requests.get(url, headers=self.headers, params=params, verify=False)
            response.raise_for_status()
            data = response.json()

            records.extend(data.get('records', []))

            offset = data.get('offset')
            if not offset:
                break

        return records

    def get_priorities_m0(self) -> List[Dict]:
        """
        Get all M0 Priorities from Airtable.

        Returns:
            List of M0 priorities with id, name, and business unit
        """
        cache_key = 'priorities_m0'
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        table_id = 'tblwZaISS19No2Ks3'
        fields = ['fldSyO5bzcAjtf1pJ', 'fldCkSSLFe4DaqtOi']  # Priority Name, Business Unit

        records = self._fetch_table(table_id, fields)

        priorities = []
        for record in records:
            fields_data = record.get('fields', {})
            priorities.append({
                'id': record['id'],
                'name': fields_data.get('fldSyO5bzcAjtf1pJ', ''),
                'business_unit': fields_data.get('fldCkSSLFe4DaqtOi', {}).get('name', '') if isinstance(fields_data.get('fldCkSSLFe4DaqtOi'), dict) else fields_data.get('fldCkSSLFe4DaqtOi', '')
            })

        self._set_cache(cache_key, priorities)
        return priorities

    def get_plays_m1(self) -> List[Dict]:
        """
        Get all M1 Plays from Airtable.

        Returns:
            List of M1 plays with id, name, quarters, and target markets
        """
        cache_key = 'plays_m1'
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        table_id = 'tblmOUHPxzTFNV345'
        fields = [
            'fldny2lfBzzb9zUVD',  # Play Name
            'fldQ3MlMeNtSAH7vm',  # Start Quarter
            'fldjYqsZKRVy0vGQl',  # End Quarter
            'fldIxHEa6RGPr48af'   # Target Market/Geos
        ]

        records = self._fetch_table(table_id, fields)

        plays = []
        for record in records:
            fields_data = record.get('fields', {})
            plays.append({
                'id': record['id'],
                'name': fields_data.get('fldny2lfBzzb9zUVD', ''),
                'start_quarter': fields_data.get('fldQ3MlMeNtSAH7vm', {}).get('name', '') if isinstance(fields_data.get('fldQ3MlMeNtSAH7vm'), dict) else fields_data.get('fldQ3MlMeNtSAH7vm', ''),
                'end_quarter': fields_data.get('fldjYqsZKRVy0vGQl', {}).get('name', '') if isinstance(fields_data.get('fldjYqsZKRVy0vGQl'), dict) else fields_data.get('fldjYqsZKRVy0vGQl', ''),
                'target_markets': fields_data.get('fldIxHEa6RGPr48af', []) if isinstance(fields_data.get('fldIxHEa6RGPr48af'), list) else []
            })

        self._set_cache(cache_key, plays)
        return plays
