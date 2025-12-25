---
name: testing
description: Testing patterns and strategies for the NJCIC map codebase
---

# Testing Skill

## When to Activate

Use when:
- Adding test coverage to the codebase
- Writing unit tests for sync or filter logic
- Creating integration tests
- Setting up a testing framework
- Debugging test failures

## Current State

**Test coverage: 0%** - No test suite exists. Priority area for improvement.

## Recommended Stack

```json
{
    "devDependencies": {
        "vitest": "^1.0.0",      // Fast, modern test runner
        "@testing-library/dom": "^9.0.0",
        "jsdom": "^23.0.0"       // DOM simulation
    }
}
```

## Unit Test Targets

### Priority 1: Data Transformation (sync-airtable.js)

```javascript
// tests/sync.test.js
import { describe, it, expect } from 'vitest';
import {
    determineStatus,
    consolidateGrants,
    extractBaseName
} from '../scripts/sync-airtable.js';

describe('determineStatus', () => {
    it('returns active for current year grants', () => {
        expect(determineStatus(['2024', '2025'])).toBe('active');
    });

    it('returns completed for old grants', () => {
        expect(determineStatus(['2021', '2022'])).toBe('completed');
    });

    it('handles edge case of previous year', () => {
        const lastYear = String(new Date().getFullYear() - 1);
        expect(determineStatus([lastYear])).toBe('active');
    });
});

describe('extractBaseName', () => {
    it('extracts base from "Org: Project" format', () => {
        expect(extractBaseName('WNYC: Newark News')).toBe('WNYC');
    });

    it('returns full name when no colon', () => {
        expect(extractBaseName('NJ Spotlight News')).toBe('NJ Spotlight News');
    });

    it('handles multiple colons', () => {
        expect(extractBaseName('Org: Project: Phase 2'))
            .toBe('Org');
    });
});

describe('consolidateGrants', () => {
    it('merges multiple grants for same org', () => {
        const records = [
            { name: 'Org: Project A', amount: 50000, years: ['2023'] },
            { name: 'Org: Project B', amount: 75000, years: ['2024'] }
        ];
        const result = consolidateGrants(records);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Org');
        expect(result[0].totalAmount).toBe(125000);
        expect(result[0].grantCount).toBe(2);
    });
});
```

### Priority 2: Filter Logic (app.js)

```javascript
// tests/filters.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('applyFilters', () => {
    let dom;
    let window;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        window = dom.window;
        global.document = window.document;
    });

    it('filters by year correctly', () => {
        const grantees = [
            { name: 'A', years: ['2023'], county: 'Essex' },
            { name: 'B', years: ['2024'], county: 'Essex' },
            { name: 'C', years: ['2023', '2024'], county: 'Bergen' }
        ];

        const filtered = applyYearFilter(grantees, '2024');
        expect(filtered).toHaveLength(2);
        expect(filtered.map(g => g.name)).toEqual(['B', 'C']);
    });

    it('filters by county correctly', () => {
        const grantees = [
            { name: 'A', county: 'Essex' },
            { name: 'B', county: 'Bergen' },
            { name: 'C', county: 'Essex' }
        ];

        const filtered = applyCountyFilter(grantees, 'Essex');
        expect(filtered).toHaveLength(2);
    });

    it('combines multiple filters', () => {
        const grantees = [
            { name: 'A', years: ['2024'], county: 'Essex', status: 'active' },
            { name: 'B', years: ['2024'], county: 'Bergen', status: 'active' },
            { name: 'C', years: ['2023'], county: 'Essex', status: 'completed' }
        ];

        const filtered = applyAllFilters(grantees, {
            year: '2024',
            county: 'Essex',
            status: 'all'
        });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('A');
    });
});
```

### Priority 3: Icon Creation (app.js)

```javascript
// tests/icons.test.js
describe('createCustomIcon', () => {
    it('creates two-letter initials from name', () => {
        const grantee = { name: 'Newark News Collaborative' };
        const icon = createCustomIcon(grantee);
        expect(icon.options.html).toContain('NN');
    });

    it('handles single word names', () => {
        const grantee = { name: 'WNYC' };
        const icon = createCustomIcon(grantee);
        expect(icon.options.html).toContain('WN');
    });

    it('handles names starting with numbers', () => {
        const grantee = { name: '70and73.com' };
        const icon = createCustomIcon(grantee);
        expect(icon.options.html).not.toContain('undefined');
    });

    it('shows NEW badge for new orgs', () => {
        const grantee = { name: 'Test Org', isNew: true };
        const icon = createCustomIcon(grantee);
        expect(icon.options.html).toContain('NEW');
        expect(icon.options.html).toContain('#E85021'); // orange
    });

    it('uses teal for regular orgs', () => {
        const grantee = { name: 'Test Org', isNew: false };
        const icon = createCustomIcon(grantee);
        expect(icon.options.html).toContain('#2EB5C0'); // teal
    });
});
```

## Integration Test Targets

### Map Initialization

```javascript
// tests/integration/map.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Map Integration', () => {
    let dom;

    beforeAll(async () => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <div id="map"></div>
            <select id="yearFilter"><option value="all">All</option></select>
            <select id="countyFilter"><option value="all">All</option></select>
        `, {
            runScripts: 'dangerously',
            resources: 'usable'
        });

        // Mock Leaflet
        dom.window.L = createLeafletMock();

        // Load app.js
        await loadScript(dom, '../js/app.js');
    });

    it('initializes map on DOMContentLoaded', () => {
        expect(dom.window.map).toBeDefined();
    });

    it('loads grantees data', async () => {
        await dom.window.init();
        expect(dom.window.allGrantees.length).toBeGreaterThan(0);
    });

    it('creates markers for all grantees', async () => {
        await dom.window.updateMarkers();
        expect(dom.window.visibleMarkers.length)
            .toBe(dom.window.filteredGrantees.length);
    });
});
```

## Test Data Fixtures

```javascript
// tests/fixtures/grantees.js
export const mockGrantees = [
    {
        name: 'Test News Org',
        county: 'Essex',
        city: 'Newark',
        years: ['2024'],
        amount: 100000,
        lat: 40.7357,
        lng: -74.1724,
        status: 'active',
        focusArea: 'Civic Information',
        description: 'Test grant',
        isNew: false
    },
    {
        name: 'Multi Grant Org',
        county: 'Bergen',
        city: 'Hackensack',
        years: ['2023', '2024'],
        hasMultipleGrants: true,
        grantCount: 2,
        totalAmount: 150000,
        grants: [
            { id: 1, years: ['2023'], amount: 75000 },
            { id: 2, years: ['2024'], amount: 75000 }
        ],
        lat: 40.8837,
        lng: -74.0440,
        status: 'active'
    }
];

export const mockMetadata = {
    totalGrantees: 2,
    totalFunding: 250000,
    totalGrants: 3,
    lastUpdated: '2025-01-01',
    dataSource: 'Test'
};
```

## Running Tests

```bash
# Add to package.json
"scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
}

# Run all tests
npm test

# Watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Coverage Goals

| Area | Current | Target |
|------|---------|--------|
| sync-airtable.js | 0% | 80% |
| app.js (filters) | 0% | 90% |
| app.js (icons) | 0% | 95% |
| Integration | 0% | 60% |

## Refactoring for Testability

Current code uses globals. For better testing, consider:

```javascript
// Before (global)
let allGrantees = [];
function applyFilters() {
    filteredGrantees = allGrantees.filter(...);
}

// After (injectable)
function applyFilters(grantees, filters) {
    return grantees.filter(g => {
        if (filters.year !== 'all' && !g.years.includes(filters.year)) {
            return false;
        }
        // ...
    });
}

// Usage
filteredGrantees = applyFilters(allGrantees, {
    year: yearFilter.value,
    county: countyFilter.value
});
```

## Key Files

- `package.json:1` - Add test scripts and devDependencies
- `js/app.js:1` - Main logic to test (910 LOC)
- `scripts/sync-airtable.js:1` - Sync logic to test (469 LOC)

---
*Last updated: December 2025 | Priority: High (0% coverage)*
