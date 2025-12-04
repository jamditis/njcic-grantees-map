const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Remove common business suffixes for comparison
function removeBusinessSuffixes(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/,?\s*(inc\.?|llc\.?|incorporated|limited liability company|company|corp\.?|corporation)$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Group grantees by base name (without suffixes)
const grouped = {};
const nameMap = {}; // Maps base name to canonical full name

data.grantees.forEach(grantee => {
    const baseName = removeBusinessSuffixes(grantee.name);

    if (!grouped[baseName]) {
        grouped[baseName] = [];
        // Use the shorter name as canonical (without Inc., LLC, etc.)
        const currentName = grantee.name;
        const withoutSuffix = currentName.replace(/,?\s*(Inc\.?|LLC\.?|Incorporated|Limited Liability Company|Company|Corp\.?|Corporation)$/i, '').trim();
        nameMap[baseName] = withoutSuffix;
    }

    grouped[baseName].push(grantee);
});

// Consolidate
const consolidated = [];

Object.keys(grouped).forEach(baseName => {
    const entries = grouped[baseName];
    const canonicalName = nameMap[baseName];

    if (entries.length === 1) {
        // Single entry - use canonical name without suffix
        const entry = { ...entries[0] };
        entry.name = canonicalName;
        consolidated.push(entry);
    } else {
        // Multiple entries - consolidate
        console.log(`\nConsolidating ${entries.length} entries for: ${canonicalName}`);
        entries.forEach((e, i) => {
            console.log(`  ${i + 1}. ${e.name} - ${e.years.join(', ')} - $${e.amount.toLocaleString()}`);
        });

        // Use first entry as base
        const base = { ...entries[0] };
        base.name = canonicalName;

        // Collect all grant information
        base.grants = entries.map((entry, index) => {
            // Try to extract project name from description or focus area
            const projectName = entry.focusArea || 'General funding';

            return {
                id: index + 1,
                projectName: projectName,
                years: entry.years,
                amount: entry.amount,
                description: entry.description,
                focusArea: entry.focusArea,
                status: entry.status
            };
        });

        // Combine years (remove duplicates, sort)
        const allYears = [...new Set(entries.flatMap(e => e.years))].sort();
        base.years = allYears;

        // Sum total amounts
        const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
        base.totalAmount = totalAmount;
        base.amount = totalAmount;

        // Create comprehensive description
        base.description = `This organization received ${entries.length} grants totaling $${totalAmount.toLocaleString()}.`;

        // Combine focus areas
        const focusAreas = [...new Set(entries.map(e => e.focusArea))];
        base.focusAreas = focusAreas;
        base.focusArea = focusAreas.length === 1 ? focusAreas[0] : focusAreas.join('; ');

        // Status - active if any are active
        base.status = entries.some(e => e.status === 'active') ? 'active' : entries[0].status;

        // Use first entry's location
        base.lat = entries[0].lat;
        base.lng = entries[0].lng;
        base.city = entries[0].city;
        base.county = entries[0].county;
        base.website = entries[0].website;

        // Mark as having multiple grants
        base.hasMultipleGrants = true;
        base.grantCount = entries.length;

        console.log(`  → Total: $${totalAmount.toLocaleString()} over ${allYears.join(', ')}`);

        consolidated.push(base);
    }
});

// Update data
data.grantees = consolidated;

// Update metadata
data.metadata.totalGrantees = consolidated.length;
data.metadata.lastUpdated = new Date().toISOString();
data.metadata.note = 'Organizations with business suffix variations (Inc., LLC, etc.) have been consolidated. Project-specific details are preserved.';

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

const multiGrantOrgs = Object.values(grouped).filter(g => g.length > 1).length;
const originalCount = Object.values(grouped).reduce((sum, g) => sum + g.length, 0);

console.log(`\n✓ Consolidated from ${originalCount} entries to ${consolidated.length} unique organizations`);
console.log(`✓ ${multiGrantOrgs} organizations had suffix variations`);
