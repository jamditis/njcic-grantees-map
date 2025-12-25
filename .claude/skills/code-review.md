---
name: code-review
description: Code review guidelines and patterns for NJCIC map contributions
---

# Code Review Skill

## When to Activate

Use when:
- Reviewing PRs or code changes
- Checking code quality before commit
- Ensuring consistency with project patterns
- Validating accessibility and security

## Review Checklist

### Data Integrity
- [ ] Airtable field names match exactly (some have trailing colons)
- [ ] Coordinate validation for NJ bounds (38.9-41.4, -75.6 to -73.9)
- [ ] Multi-grant consolidation logic preserved
- [ ] Cache-busting maintained on data fetches

### Map Functionality
- [ ] Marker clustering behavior unchanged
- [ ] Filter combinations work correctly
- [ ] Modal handles both single and multi-grant orgs
- [ ] Keyboard navigation preserved (Arrow, Escape, +/-)

### Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Focus management in modals
- [ ] `aria-live` regions for dynamic updates
- [ ] `prefers-reduced-motion` respected

### Security
- [ ] No secrets in committed code
- [ ] Airtable PAT only in sync.php (server-side)
- [ ] SYNC_URL only in GitHub secrets
- [ ] Input validation on user data

### Performance
- [ ] No unnecessary re-renders
- [ ] Efficient marker updates (batch operations)
- [ ] Service worker cache versions updated if needed
- [ ] JS version bumped if app.js changed

## Code Patterns to Enforce

### ✅ Good Patterns

```javascript
// Cache-busting for data freshness
const cacheBust = new Date().getTime();
fetch(`data/grantees.json?v=${cacheBust}`);

// Safe element access
const element = document.getElementById('filter');
if (element) {
    element.addEventListener('change', handler);
}

// Multi-grant aware
if (grantee.hasMultipleGrants) {
    // Handle array of grants
} else {
    // Handle single grant
}

// Coordinate validation
if (lat >= 38.9 && lat <= 41.4 && lng >= -75.6 && lng <= -73.9) {
    // Valid NJ coordinates
}
```

### ❌ Anti-Patterns

```javascript
// Missing cache-busting
fetch('data/grantees.json'); // Will serve stale CDN data

// Unsafe element access
document.getElementById('filter').addEventListener(...); // Throws if null

// Ignoring multi-grant structure
const amount = grantee.amount; // Undefined for multi-grant orgs

// Hardcoded secrets
const PAT = 'pat...'; // NEVER commit secrets

// Magic numbers without constants
setTimeout(fn, 3000); // What does 3000 mean?
```

## Style Guidelines

### Naming
- Functions: `verbNoun()` - `applyFilters()`, `updateMarkers()`
- Variables: camelCase - `filteredGrantees`, `currentMarkerIndex`
- Constants: UPPER_SNAKE - `NJ_BOUNDS`, `CACHE_NAME`

### Comments
```javascript
// Explain WHY, not WHAT
// Bad: Loop through grantees
// Good: Filter out cancelled grants before rendering

// Document edge cases
// Edge case: Names like "70and73.com" have no uppercase letters
```

### Error Handling
```javascript
// Wrap async operations
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
} catch (error) {
    console.error('Failed to fetch:', error);
    showErrorState(error.message);
}
```

## Common Review Issues

### 1. Filter Logic Bugs

```javascript
// Bug: Doesn't handle multi-grant year arrays
if (grantee.years.includes(year)) { ... }

// Fix: Check both structures
const years = grantee.years ||
    (grantee.grants?.flatMap(g => g.years) || []);
if (years.includes(year)) { ... }
```

### 2. Modal Content Issues

```javascript
// Bug: Accessing undefined properties
content.innerHTML = `<p>${grantee.description}</p>`;

// Fix: Check for multi-grant structure
const description = grantee.hasMultipleGrants
    ? `${grantee.grantCount} grants totaling ${formatCurrency(grantee.totalAmount)}`
    : grantee.description;
```

### 3. Missing Version Bump

After modifying app.js:
```html
<!-- Before -->
<script src="js/app.js?v=2.0.0"></script>

<!-- After - must increment! -->
<script src="js/app.js?v=2.1.0"></script>
```

### 4. Sync Field Mapping

```javascript
// Bug: Field name mismatch
const years = record.fields['Years granted']; // undefined

// Fix: Use exact Airtable field names
const years = record.fields['Year(s) granted:']; // Note trailing colon
```

## Pre-Commit Checklist

```bash
# 1. Local test
npm start
# Test filters, markers, modal, keyboard nav

# 2. Check for secrets
grep -r "pat" --include="*.js" .
grep -r "key=" --include="*.js" .

# 3. Validate JSON (if modified)
cat data/grantees.json | jq . > /dev/null

# 4. Check version bump (if app.js modified)
grep "app.js?v=" index.html
```

## Deployment Review

Before merging to main:
- [ ] Changes tested locally
- [ ] No console.log statements (except errors)
- [ ] Service worker version updated if needed
- [ ] Documentation updated if behavior changed
- [ ] Commit message describes the change

## Key Files Reference

| File | Key Concerns |
|------|--------------|
| `js/app.js` | Filters, markers, modal, accessibility |
| `scripts/sync-airtable.js` | Field mapping, consolidation |
| `index.html` | Version params, ARIA labels |
| `.htaccess` | Cache headers, security |
| `sw.js` | Cache version |

---
*Last updated: December 2025 | Use for all code changes*
