const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Group grantees by name
const grouped = {};

data.grantees.forEach(grantee => {
    const key = grantee.name;
    if (!grouped[key]) {
        grouped[key] = [];
    }
    grouped[key].push(grantee);
});

// Consolidate duplicates
const consolidated = [];

Object.keys(grouped).forEach(name => {
    const entries = grouped[name];

    if (entries.length === 1) {
        // No duplicates, add as-is
        consolidated.push(entries[0]);
    } else {
        // Consolidate multiple entries
        console.log(`\nConsolidating ${entries.length} entries for: ${name}`);

        // Use first entry as base
        const base = { ...entries[0] };

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

        // Use the most recent/comprehensive description
        base.description = entries[entries.length - 1].description;

        // Combine focus areas
        const focusAreas = [...new Set(entries.map(e => e.focusArea))];
        base.focusAreas = focusAreas;
        if (focusAreas.length === 1) {
            base.focusArea = focusAreas[0];
        } else {
            base.focusArea = focusAreas.join('; ');
        }

        // Mark as having multiple grants
        base.hasMultipleGrants = true;
        base.grantCount = entries.length;

        console.log(`  Years: ${allYears.join(', ')}`);
        console.log(`  Total amount: $${totalAmount.toLocaleString()}`);
        console.log(`  Grant count: ${entries.length}`);

        consolidated.push(base);
    }
});

// Update data
data.grantees = consolidated;

// Update metadata
data.metadata.totalGrantees = consolidated.length;
data.metadata.lastUpdated = new Date().toISOString();
data.metadata.note = 'Duplicate entries have been consolidated. Organizations with multiple grants show combined information.';

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✓ Consolidated from ${data.grantees.length + (grouped.length - consolidated.length)} entries to ${consolidated.length} unique organizations`);
console.log(`✓ ${Object.values(grouped).filter(g => g.length > 1).length} organizations have multiple grants`);
