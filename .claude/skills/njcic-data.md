---
name: njcic-data
description: Data validation, geocoding, and quality assurance for grantee data
---

# NJCIC Data Quality Skill

## When to Activate

Use when:
- Validating grantee coordinates
- Debugging "wrong location" issues
- Adding new grantees to Airtable
- Running coordinate population scripts
- Checking data integrity

## Data Structure

### grantees.json schema
```javascript
{
    "grantees": [{
        "name": "Organization Name",      // Required
        "county": "Essex",                // NJ county
        "city": "Newark",                 // City name
        "years": ["2023", "2024"],        // Grant years array
        "amount": 100000,                 // Total in dollars
        "lat": 40.7357,                   // Decimal degrees
        "lng": -74.1724,                  // Decimal degrees (negative for west)
        "status": "active",               // "active" or "completed"
        "website": "https://...",         // Optional
        "focusArea": "Civic Information", // Category
        "description": "Grant purpose...",
        "isNew": false,                   // Orange marker badge

        // Multi-grant orgs only:
        "hasMultipleGrants": true,
        "grantCount": 2,
        "totalAmount": 200000,
        "grants": [{
            "id": 1,
            "years": ["2023"],
            "amount": 100000,
            "description": "...",
            "focusArea": "...",
            "status": "active"
        }]
    }],
    "metadata": {
        "totalGrantees": 76,
        "totalFunding": 10800000,
        "totalGrants": 100,
        "lastUpdated": "2025-12-25",
        "dataSource": "Airtable"
    }
}
```

## Coordinate Validation

### Valid format
```
Latitude: 38.9 to 41.4 (NJ range)
Longitude: -75.6 to -73.9 (must be negative)

Examples:
✓ 40.7357, -74.1724 (Newark)
✓ 40.2206, -74.7597 (Trenton)
✗ 40° 44' 8" N (wrong format)
✗ 40.7357, 74.1724 (missing negative)
✗ -74.1724, 40.7357 (swapped)
```

### Validation function
```javascript
function validateCoordinates(lat, lng) {
    const errors = [];

    // Type check
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push('Coordinates must be numbers');
    }

    // NJ bounds check
    if (lat < 38.9 || lat > 41.4) {
        errors.push(`Latitude ${lat} outside NJ (38.9-41.4)`);
    }
    if (lng > -73.9 || lng < -75.6) {
        errors.push(`Longitude ${lng} outside NJ (-75.6 to -73.9)`);
    }

    // Precision check (at least 4 decimal places for ~11m accuracy)
    const latDecimals = String(lat).split('.')[1]?.length || 0;
    const lngDecimals = String(lng).split('.')[1]?.length || 0;
    if (latDecimals < 4 || lngDecimals < 4) {
        errors.push('Coordinates should have 4+ decimal places');
    }

    return errors;
}
```

## County Seat Fallbacks

When exact coordinates unavailable, use county seat:

```javascript
const COUNTY_SEATS = {
    'Atlantic': { lat: 39.3643, lng: -74.4229, city: 'Atlantic City' },
    'Bergen': { lat: 40.8837, lng: -74.0440, city: 'Hackensack' },
    'Burlington': { lat: 39.9526, lng: -74.8728, city: 'Mount Holly' },
    'Camden': { lat: 39.9259, lng: -75.1196, city: 'Camden' },
    'Cape May': { lat: 39.0926, lng: -74.8061, city: 'Cape May' },
    'Cumberland': { lat: 39.4015, lng: -75.0280, city: 'Bridgeton' },
    'Essex': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Gloucester': { lat: 39.7390, lng: -75.1077, city: 'Woodbury' },
    'Hudson': { lat: 40.7282, lng: -74.0776, city: 'Jersey City' },
    'Hunterdon': { lat: 40.5083, lng: -74.8604, city: 'Flemington' },
    'Mercer': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Middlesex': { lat: 40.4862, lng: -74.4518, city: 'New Brunswick' },
    'Monmouth': { lat: 40.2899, lng: -74.1774, city: 'Freehold' },
    'Morris': { lat: 40.7979, lng: -74.4815, city: 'Morristown' },
    'Ocean': { lat: 39.9537, lng: -74.1979, city: 'Toms River' },
    'Passaic': { lat: 40.9168, lng: -74.1718, city: 'Paterson' },
    'Salem': { lat: 39.5762, lng: -75.4671, city: 'Salem' },
    'Somerset': { lat: 40.4987, lng: -74.6242, city: 'Somerville' },
    'Sussex': { lat: 41.0534, lng: -74.7323, city: 'Newton' },
    'Union': { lat: 40.6639, lng: -74.3085, city: 'Elizabeth' },
    'Warren': { lat: 40.7581, lng: -75.1890, city: 'Belvidere' },
    'Statewide': { lat: 40.2206, lng: -74.7597, city: 'Trenton' }
};
```

## Finding Coordinates

### Manual lookup (for staff)
1. Go to https://www.latlong.net
2. Search for organization address
3. Copy decimal latitude and longitude
4. Enter in Airtable Lat/Long fields

### Programmatic geocoding
```javascript
// Using Nominatim (free, rate-limited)
async function geocode(address) {
    const encoded = encodeURIComponent(address + ', New Jersey');
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    const response = await fetch(url, {
        headers: { 'User-Agent': 'NJCIC-Grantees-Map' }
    });
    const data = await response.json();

    if (data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            city: data[0].display_name.split(',')[0]
        };
    }
    return null;
}
```

## Pushing Coordinates to Airtable

```bash
# Set credentials
export AIRTABLE_PAT="pat..."

# Run update script
npm run sync:coords
```

Script batches updates (max 10 per request):
```javascript
const AIRTABLE_FIELD_IDS = {
    LAT: 'fldXBmRZZoCXp5M68',
    LONG: 'fldaDClMwhIEBuqeM',
    CITY: 'fldFKPPOed5phSskL'
};

// PATCH to Airtable API with field IDs (not names)
const updates = records.map(r => ({
    id: r.id,
    fields: {
        [AIRTABLE_FIELD_IDS.LAT]: coords.lat,
        [AIRTABLE_FIELD_IDS.LONG]: coords.lng,
        [AIRTABLE_FIELD_IDS.CITY]: coords.city
    }
}));
```

## Data Quality Checks

### Sync script warnings
```javascript
// Track grantees using fallback coordinates
const warnings = [];
if (usedFallback) {
    warnings.push({
        name: grantee.name,
        county: grantee.county,
        reason: 'Using county seat coordinates'
    });
}

// Output summary
console.log(`⚠️ ${warnings.length} grantees using fallback coordinates:`);
warnings.forEach(w => console.log(`  - ${w.name} (${w.county})`));
```

### Validation script
```javascript
// Run after sync to check data quality
const issues = [];
grantees.forEach((g, i) => {
    const coordErrors = validateCoordinates(g.lat, g.lng);
    if (coordErrors.length > 0) {
        issues.push({ index: i, name: g.name, errors: coordErrors });
    }

    if (!g.name || g.name.trim() === '') {
        issues.push({ index: i, error: 'Missing name' });
    }

    if (!g.years || g.years.length === 0) {
        issues.push({ index: i, name: g.name, error: 'Missing years' });
    }
});
```

## Common Data Issues

### "Marker in wrong location"
1. Check Airtable Lat/Long values
2. Verify decimal format (not DMS)
3. Confirm longitude is negative
4. Re-run sync to pull updated coords

### "Organization not consolidating"
Names must match exactly for consolidation:
- "Org: Project A" and "Org: Project B" → consolidates
- "Org Inc: Project" and "Org: Project" → does NOT consolidate

### "New badge not showing"
1. Check "New org?" checkbox in Airtable
2. Re-run sync
3. Verify `isNew: true` in grantees.json

## Key Files

- `scripts/sync-airtable.js:200` - Coordinate fallback logic
- `scripts/populate-airtable-coords.js:1` - Push coords to Airtable
- `scripts/improved-geocoding.js:1` - Manual coord database
- `data/grantees.json:1` - Current data with coords

---
*Last updated: December 2025 | Applies to: data validation and geocoding*
