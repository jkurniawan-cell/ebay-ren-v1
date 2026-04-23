# Frontend Changes Needed for Airtable MCP Integration

## Files to Update

### 1. `/frontend/app/timeline/page.tsx`

**Remove these imports:**
```typescript
import { ModeToggle } from '@/components/ModeToggle';
import { CSVUpload } from '@/components/CSVUpload';
import { ApproveButton } from '@/components/ApproveButton';
```

**Remove these state variables:**
```typescript
const [mode, setMode] = useState<'upcoming' | 'approved'>('upcoming');
const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<string>('Q2 refresh 2026');
const [availableCycles, setAvailableCycles] = useState<string[]>([]);
const [uploadError, setUploadError] = useState<string | null>(null);
const [uploadSuccess, setUploadSuccess] = useState(false);
```

**Update fetchRoadmapData() function:**
```typescript
const fetchRoadmapData = async () => {
  try {
    // Fetch data from Airtable (read-only, always live)
    const unfilteredData = await apiClient.getRoadmapData({
      m0_priorities: [],
      markets: [],
      roadmap_changes: []
    });

    // Extract all available M0 priorities
    const priorities = Array.from(
      new Set(unfilteredData.data.map((m0) => m0.m0_priority))
    ).sort((a, b) => a.localeCompare(b));
    setM0Priorities(priorities);

    // Fetch filtered data
    const data = await apiClient.getRoadmapData({
      m0_priorities: selectedM0s,
      markets: selectedMarkets,
      roadmap_changes: selectedRoadmapChanges
    });

    setRoadmapData(data);
    // ... rest of filter extraction logic
```

**Remove from JSX:**
- `<ModeToggle />` component
- `<CSVUpload />` component
- `<ApproveButton />` component
- History mode dropdown

### 2. `/frontend/lib/api.ts`

**Simplify getRoadmapData:**
```typescript
export async function getRoadmapData(params: {
  m0_priorities?: string[];
  markets?: string[];
  roadmap_changes?: string[];
}): Promise<RoadmapResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.m0_priorities?.length) {
    params.m0_priorities.forEach(p => queryParams.append('m0_priorities[]', p));
  }
  if (params.markets?.length) {
    params.markets.forEach(m => queryParams.append('markets[]', m));
  }
  if (params.roadmap_changes?.length) {
    params.roadmap_changes.forEach(r => queryParams.append('roadmap_changes[]', r));
  }

  const response = await fetch(
    `${API_URL}/api/roadmap?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
```

**Remove these methods:**
- `uploadCSV()`
- `createSnapshot()`
- `getSnapshots()`
- `getDrafts()`

### 3. Delete These Component Files

```bash
rm frontend/components/ModeToggle.tsx
rm frontend/components/CSVUpload.tsx
rm frontend/components/ApproveButton.tsx
```

### 4. Update `/frontend/components/Header.tsx`

**Remove:**
- CSV upload UI
- Mode-specific titles
- Approve button

**Simplify to:**
```typescript
export function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            eBay REN - Roadmap Intelligence Engine
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Live data from Airtable
          </p>
        </div>
        {/* Export button stays */}
      </div>
    </div>
  );
}
```

---

## Summary of Changes

### What's Removed ❌
- CSV upload functionality
- Draft/Approved mode toggle
- Snapshot approval workflow
- History mode dropdown
- Planning cycle management

### What Stays ✅
- Filter bar (M0, Markets, Roadmap Changes)
- Timeline visualization
- Cross-priority badges
- Export functionality
- Change log view
- Charts and analytics

### New Behavior 🆕
- Always shows **live data** from Airtable
- No local state management
- Filters work on read-only Airtable data
- Simpler, cleaner UI

---

## Testing Checklist

After making these changes:

1. ✅ Verify Timeline loads with Airtable data
2. ✅ Test M0 filter dropdown
3. ✅ Test Markets filter
4. ✅ Test Roadmap Changes filter
5. ✅ Verify quarter spanning still works
6. ✅ Check cross-priority badges display
7. ✅ Test export functionality
8. ✅ Verify change log view works
