const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Normalize organization name for comparison
function normalizeName(name) {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Group grantees by normalized name
const grouped = {};
const nameMap = {}; // Maps normalized name to canonical name

data.grantees.forEach(grantee => {
    const normalizedKey = normalizeName(grantee.name);

    if (!grouped[normalizedKey]) {
        grouped[normalizedKey] = [];
        nameMap[normalizedKey] = grantee.name; // Use first occurrence as canonical
    }

    grouped[normalizedKey].push(grantee);
});

// Consolidate duplicates
const consolidated = [];

Object.keys(grouped).forEach(normalizedKey => {
    const entries = grouped[normalizedKey];
    const canonicalName = nameMap[normalizedKey];

    if (entries.length === 1) {
        // No duplicates, add as-is (but use canonical name)
        const entry = { ...entries[0] };
        entry.name = canonicalName;
        consolidated.push(entry);
    } else {
        // Consolidate multiple entries
        console.log(`\nConsolidating ${entries.length} entries for: ${canonicalName}`);
        entries.forEach((e, i) => {
            console.log(`  ${i + 1}. ${e.name} - ${e.years.join(', ')} - $${e.amount.toLocaleString()}`);
        });

        // Use first entry as base
        const base = { ...entries[0] };
        base.name = canonicalName; // Use canonical name

        // Collect all grant information
        base.grants = entries.map((entry, index) => ({
            id: index + 1,
            years: entry.years,
            amount: entry.amount,
            description: entry.description,
            focusArea: entry.focusArea,
            status: entry.status
        }));

        // Combine years (remove duplicates, sort)
        const allYears = [...new Set(entries.flatMap(e => e.years))].sort();
        base.years = allYears;

        // Sum total amounts
        const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
        base.totalAmount = totalAmount;
        base.amount = totalAmount; // For display purposes

        // Use the most comprehensive description
        const longestDesc = entries.reduce((longest, e) =>
            e.description.length > longest.length ? e.description : longest,
            entries[0].description
        );
        base.description = longestDesc;

        // Combine focus areas
        const focusAreas = [...new Set(entries.map(e => e.focusArea))];
        base.focusAreas = focusAreas;
        if (focusAreas.length === 1) {
            base.focusArea = focusAreas[0];
        } else {
            base.focusArea = focusAreas.join('; ');
        }

        // Combine statuses - if any are active, mark as active
        const hasActive = entries.some(e => e.status === 'active');
        base.status = hasActive ? 'active' : entries[0].status;

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
data.metadata.note = 'Duplicate entries have been consolidated (case-insensitive). Organizations with multiple grants show combined information.';

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

const duplicateCount = Object.values(grouped).filter(g => g.length > 1).length;
const originalCount = data.grantees.length + Object.values(grouped).reduce((sum, g) => sum + (g.length > 1 ? g.length - 1 : 0), 0);

console.log(`\n✓ Consolidated from ${originalCount} entries to ${consolidated.length} unique organizations`);
console.log(`✓ ${duplicateCount} organizations had multiple grants`);
