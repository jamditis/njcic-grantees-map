---
name: airtable-sync
description: Expert patterns for NJCIC Airtable-to-map data synchronization
---

# Airtable Sync Skill

## When to Activate

Use when:
- Modifying sync-airtable.js or sync logic
- Debugging data not appearing on map
- Adding new Airtable fields to the map
- Troubleshooting "map not updating" issues
- Working with grantees.json structure

## Core Architecture

```
Airtable (MAP VIEW) → sync.php (server) → grantees.json → app.js renders
                         ↑
              GitHub Actions triggers daily 7am ET
```

**Critical path**: Changes in Airtable take up to 24 hours to appear. For immediate sync, trigger manually via sync URL or GitHub Actions.

## Airtable Configuration

```javascript
const CONFIG = {
    BASE_ID: 'appryDZWgPpP0GmZw',
    TABLE_ID: 'tblFADXYCq495smGH',
    VIEW_ID: 'viwjXro41ehrvxTfs'  // MAP VIEW - filters active records
};

const FIELDS = {
    NAME: 'Grantee',
    DESCRIPTION: 'Grant purpose',
    YEARS: 'Year(s) granted:',      // Note: trailing colon
    AMOUNT: 'Total awarded',
    FOCUS: 'Focus area',
    COUNTY: 'Service area',
    WEBSITE: 'Grantee website',
    LAT: 'Lat',
    LONG: 'Long',
    CITY: 'City',
    CANCELLED: 'Returned/Cancelled grant?',
    NEW_ORG: 'New org?'
};
```

## Data Transformation Rules

### Multi-Grant Organizations

Organizations with multiple grants use "Org: Project" naming in Airtable:
```
"Newark News and Story Collaborative: Main Operations"
"Newark News and Story Collaborative: Community Outreach"
```

Sync consolidates to single marker:
```javascript
{
    "name": "Newark News and Story Collaborative",
    "hasMultipleGrants": true,
    "grantCount": 2,
    "totalAmount": 150000,
    "grants": [
        { "id": 1, "years": ["2023"], "amount": 75000, ... },
        { "id": 2, "years": ["2024"], "amount": 75000, ... }
    ]
}
```

### Status Determination

```javascript
function determineStatus(years) {
    const currentYear = new Date().getFullYear();
    return years.some(y => parseInt(y) >= currentYear - 1)
        ? 'active'
        : 'completed';
}
// 2024+ = active, 2023 or earlier = completed
```

### Coordinate Fallback Chain

1. Airtable Lat/Long fields (exact)
2. Match existing grantees.json by name
3. Partial name match (substring)
4. County seat coordinates
5. Statewide default: Trenton (40.2206, -74.7597)

## Common Issues & Fixes

### "Grantee not showing on map"

1. Check `Returned/Cancelled grant?` checkbox in Airtable (should be unchecked)
2. Verify record is in MAP VIEW (filter may exclude it)
3. Check Lat/Long values are decimal format (40.7357, not 40° 44' 8")
4. Force sync: visit sync URL or trigger GitHub Actions

### "Wrong location"

Coordinates must be decimal degrees:
- Correct: `40.7357` latitude, `-74.1724` longitude
- Wrong: `40° 44' 8"` (degree-minute-second format)
- Wrong: `40.7357° N` (includes direction)

Use https://www.latlong.net to find correct coordinates.

### "Data is stale"

1. Sync runs daily at 7am ET (12:00 UTC)
2. Manual trigger: `curl "https://njcivicinfo.org/map/sync.php?key=[SECRET]"`
3. GitHub Actions: Repository → Actions → sync-airtable → Run workflow
4. Clear browser cache: Ctrl+F5 (app.js adds cache-busting but CDN may cache)

### "Sync returns 500 error"

- Airtable PAT may have expired (regenerate in Airtable account settings)
- Check server logs via Nestify dashboard
- Verify sync.php exists at /public_html/map/sync.php

## Adding New Fields

1. Add field constant:
```javascript
const FIELDS = {
    // ... existing
    NEW_FIELD: 'Airtable Field Name',
};
```

2. Map in transformation:
```javascript
const grantee = {
    // ... existing
    newField: record.fields[FIELDS.NEW_FIELD] || 'default',
};
```

3. Update app.js to use new field in popups/filters

## Testing Locally

```bash
export AIRTABLE_PAT="pat..."
npm run sync
# Outputs to data/grantees.json
```

Verify output:
```bash
cat data/grantees.json | jq '.metadata'
# Check totalGrantees, totalGrants, lastUpdated
```

## Key Files

- `scripts/sync-airtable.js:1` - Main sync logic (469 LOC)
- `scripts/populate-airtable-coords.js:1` - Push coords to Airtable
- `.github/workflows/sync-airtable.yml:1` - Daily trigger
- `data/grantees.json:1` - Output data file

---
*Last updated: December 2025 | Applies to: sync-airtable.js, sync.php*
