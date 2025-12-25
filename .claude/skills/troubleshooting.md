---
name: troubleshooting
description: Quick reference for common NJCIC map issues and solutions
---

# Troubleshooting Skill

## When to Activate

Use when:
- Debugging user-reported issues
- Map not displaying correctly
- Data sync problems
- Deployment failures

## Quick Diagnosis

### Issue Categories

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Map blank/white | JS error | Check console, fix error |
| Markers missing | Fetch failed | Check network tab, verify JSON |
| Stale data | Cache | Hard refresh (Ctrl+Shift+R) |
| Wrong location | Bad coords | Check Airtable Lat/Long |
| Filter not working | Element missing | Verify filter IDs in HTML |
| Modal broken | Multi-grant bug | Check hasMultipleGrants handling |

## Data Issues

### "Grantee not appearing on map"

**Diagnosis:**
```bash
# Check if in grantees.json
cat data/grantees.json | jq '.grantees[] | select(.name | contains("OrgName"))'

# Check Airtable directly
curl -H "Authorization: Bearer $AIRTABLE_PAT" \
  "https://api.airtable.com/v0/appryDZWgPpP0GmZw/tblFADXYCq495smGH?filterByFormula=SEARCH('OrgName',{Grantee})"
```

**Common causes:**
1. `Returned/Cancelled grant?` checkbox is checked
2. Record not in MAP VIEW
3. Sync hasn't run since record added

**Fix:**
- Uncheck cancelled checkbox
- Verify record appears in MAP VIEW
- Trigger manual sync

### "Marker in wrong place"

**Diagnosis:**
```javascript
// In browser console
const grantee = allGrantees.find(g => g.name.includes('OrgName'));
console.log(grantee.lat, grantee.lng);
```

**Validation:**
```
Valid NJ coordinates:
- Latitude: 38.9 to 41.4
- Longitude: -75.6 to -73.9 (MUST be negative)

Common mistakes:
- Missing negative: 74.1724 should be -74.1724
- Swapped: lat/lng reversed
- DMS format: 40° 44' 8" should be 40.7357
```

**Fix:**
1. Go to https://www.latlong.net
2. Search for organization address
3. Update Lat/Long in Airtable
4. Trigger sync

### "Multi-grant org showing incorrectly"

**Check data structure:**
```javascript
const org = allGrantees.find(g => g.name === 'Org Name');
console.log({
    hasMultipleGrants: org.hasMultipleGrants,
    grantCount: org.grantCount,
    grants: org.grants
});
```

**Should see:**
```javascript
{
    hasMultipleGrants: true,
    grantCount: 2,
    grants: [
        { id: 1, years: ['2023'], amount: 50000, ... },
        { id: 2, years: ['2024'], amount: 75000, ... }
    ]
}
```

**If not consolidated:**
- Check Airtable naming: "Org: Project A" and "Org: Project B"
- Base name before colon must match exactly

## Sync Issues

### "Sync URL returns error"

**500 Internal Server Error:**
```bash
# Test manually
curl -v "https://njcivicinfo.org/map/sync.php?key=[SECRET]"

# Check for PHP errors in response body
```

**Causes:**
1. Airtable PAT expired → Regenerate in Airtable account
2. PHP syntax error → Check server logs
3. Memory limit → Reduce batch size

**401 Unauthorized:**
- Wrong secret key
- Secret key not URL-encoded

**404 Not Found:**
- sync.php missing from /public_html/map/
- Check FTP to verify file exists

### "GitHub Actions failing"

**Check workflow logs:**
1. Repository → Actions → Failed run
2. Click job → Expand steps
3. Look for error message

**Common issues:**
- `SYNC_URL` secret not set
- Network timeout (add retry logic)
- Sync URL returning non-200

### "Local sync fails"

```bash
# Missing PAT
export AIRTABLE_PAT="pat..."

# Wrong directory
cd /path/to/njcic-grantees-map

# Run sync
npm run sync

# Check output
cat data/grantees.json | jq '.metadata'
```

## Frontend Issues

### "Map not initializing"

**Browser console errors:**
```
Uncaught ReferenceError: L is not defined
→ Leaflet not loaded. Check CDN link in index.html

TypeError: Cannot read properties of null
→ DOM element missing. Check element IDs
```

**Debug:**
```javascript
// Check Leaflet loaded
console.log(typeof L); // should be 'object'

// Check map container
console.log(document.getElementById('map')); // should exist

// Check data loaded
console.log(allGrantees.length); // should be > 0
```

### "Filters not working"

**Check event binding:**
```javascript
// In browser console
const filter = document.getElementById('yearFilter');
console.log(filter); // Should exist
console.log(filter.value); // Should have value
```

**Check filter elements match IDs:**
- `yearFilter`
- `countyFilter`
- `focusFilter`
- `statusFilter`

### "Modal not opening"

**Debug:**
```javascript
// Check modal element
console.log(document.getElementById('granteeModal'));

// Test openModal
openModal(allGrantees[0]);
```

**Common issues:**
- CSS hiding modal permanently
- JavaScript error before modal code
- Modal content not set

## Caching Issues

### "Seeing old data after sync"

**Layer-by-layer check:**

1. **Server JSON updated?**
```bash
curl -I "https://njcivicinfo.org/map/data/grantees.json"
# Check Last-Modified header
```

2. **CDN serving stale?**
```bash
curl "https://njcivicinfo.org/map/data/grantees.json?nocache=$(date +%s)" | jq '.metadata.lastUpdated'
```

3. **Browser cache?**
- Hard refresh: Ctrl+Shift+R
- DevTools → Network → Disable cache → Reload

4. **Service Worker?**
- DevTools → Application → Service Workers → Unregister
- Reload page

### "JS changes not appearing"

After modifying app.js:
```html
<!-- index.html - increment version -->
<script src="js/app.js?v=2.0.0"></script>
<!-- Change to -->
<script src="js/app.js?v=2.1.0"></script>
```

## Performance Issues

### "Map loading slowly"

**Diagnosis:**
```javascript
// Time the fetch
console.time('fetch');
await fetch('data/grantees.json?v=' + Date.now());
console.timeEnd('fetch');

// Count markers
console.log('Markers:', visibleMarkers.length);
```

**Common causes:**
- Large grantees.json (100+ records is fine)
- Slow CDN response (use cache-busting sparingly)
- Too many DOM updates (batch marker operations)

### "Markers slow to render"

Ensure batch operations:
```javascript
// Good: Add all at once
markersCluster.addLayers(markers);

// Bad: Add individually
markers.forEach(m => markersCluster.addLayer(m));
```

## Quick Commands

```bash
# Test sync locally
export AIRTABLE_PAT="pat..." && npm run sync

# Check JSON validity
cat data/grantees.json | jq .

# Count grantees
cat data/grantees.json | jq '.grantees | length'

# Find specific grantee
cat data/grantees.json | jq '.grantees[] | select(.name | test("Newark"; "i"))'

# Check metadata
cat data/grantees.json | jq '.metadata'

# Start local server
npm start
```

## Escalation

If issue persists after troubleshooting:

**Technical issues:** Contact Joe Amditis (amditisj@montclair.edu)
**Airtable/data questions:** NJCIC staff

---
*Last updated: December 2025 | Quick reference guide*
