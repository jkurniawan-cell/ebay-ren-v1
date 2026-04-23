# Airtable to REN App Field Mapping

**Base ID:** `appXFsy8DcRl4C5mx`  
**Table:** Roadmap Item Local Table (`tblV23SJ1OBxebWrt`)  
**Total Records:** 514 launches

## Field Mapping

| REN App Field | Airtable Field Name | Field ID | Type | Sample Data |
|---------------|---------------------|----------|------|-------------|
| **key_launch_name** | Roadmap Item Name | `flduuIoUIZojWLFtU` | singleLineText | "Increase fast shipping coverage (EDD)" |
| **m0_priority_name** | Priorities (M0) | `fldCVODBAs5vPPBEg` | multipleRecordLinks | [{"name": "Shipping"}] |
| **m1_initiative_name** | Plays | `fldQdiUN8PTEzsRYj` | multipleRecordLinks | [{"name": "PLAY-388: C2C Monetization..."}] |
| **initial_start_quarter** | Original Start Quarter | `fldm7H8hz5zA9Yrb5` | singleSelect | ❌ Missing in sample data |
| **initial_end_quarter** | Original End Quarter | `fldYDyACiCaxKBiKe` | singleSelect | ❌ Missing in sample data |
| **start_quarter** | Start Quarter | `flddxxHSZ604WOvKA` | singleSelect | {"name": "Q1-2026"} |
| **end_quarter** | End Quarter | `fldxjqD6sQiBOwn9u` | singleSelect | {"name": "Q3-2026"} |
| **geo_category** | Geo | `fldnAHV614gkQF1ex` | multipleSelects | [{"name": "Global"}] |
| **roadmap_change** | Roadmap Timing Change | `fldS9Crp4RZmAC4Hk` | singleSelect | ❌ Missing in sample data |
| **change_rationale** | Change Rationale Status | `fldYO25QKXiWhbgqR` | singleSelect | ❌ Missing in sample data |
| **change_rationale_comment** | Change Rationale Comments | `fld2yy4n9BhH9NY7X` | multilineText | ❌ Missing in sample data |
| **play_raw_name** | PLAY RAW NAME | `fldOfNNWTC7oDyzeS` | multilineText | "Horizontal Capabilities and Tech Foundations" |

## Missing Fields (Not in Airtable)

These fields from CSV are **NOT** in your Airtable structure:

| REN App Field | Status | Recommendation |
|---------------|--------|----------------|
| **geo_category_details** | ❌ Not found | Create new field or use "Geo Category Details" from Projects table |
| **cross_priority_dependency** | ❌ Not found | Create new multipleSelects field in Airtable |

## Sample Data Verification

### Record 1: "Increase fast shipping coverage (EDD)"
```json
{
  "key_launch_name": "Increase fast shipping coverage (EDD)",
  "m0_priority_name": "Shipping",
  "m1_initiative_name": null,  // ⚠️ No Play linked
  "start_quarter": "Q1-2026",
  "end_quarter": "Q3-2026",
  "geo_category": ["Global"],
  "play_raw_name": "Horizontal Capabilities and Tech Foundations"
}
```

### Record 2: "Increase Seller & Inventory"
```json
{
  "key_launch_name": "Increase Seller & Inventory (e.g. Total Store Promotion)",
  "m0_priority_name": "Ads",
  "m1_initiative_name": "PLAY-388: C2C Monetization...",
  "start_quarter": "Q4-2026",
  "end_quarter": "Q4-2026",
  "geo_category": ["Global"]
}
```

### Record 3: "Lean in on Luxury Consignment"
```json
{
  "key_launch_name": "Lean in on Luxury Consignment via retail partnership",
  "m0_priority_name": "FC: Fashion",
  "m1_initiative_name": "PLAY-363: Unlock the Consumer Closet",
  "start_quarter": "Q3-2026",
  "end_quarter": "Q4-2026",
  "geo_category": ["US"]
}
```

## Data Quality Issues to Address

1. **Original Start/End Quarters** - These fields exist in Airtable but are empty in the sample data
2. **Roadmap Change fields** - Empty in sample data (may be populated for some records)
3. **Some launches missing M1/Play links** - Record 1 has no Play linked
4. **Cross-Priority Dependency** - Doesn't exist in Airtable yet

## Next Steps

**Before I build the integration, please confirm:**

1. ✅ Are the **field names and mappings** correct?
2. ❓ Should I create the missing fields (`cross_priority_dependency`, `geo_category_details`) in Airtable via MCP?
3. ❓ How should I handle launches with **no M1/Play** linked?
4. ❓ Do you want me to fetch a larger sample to see if Original Start/End Quarter fields are populated?

---

**To reconfirm the 1-1 matching, please:**
- Review the sample data above
- Tell me if any field mappings are wrong
- Let me know if you want to see more sample records to verify data completeness
