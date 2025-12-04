const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Extract base organization name (everything before : or |)
function getBaseName(name) {
    // Split on : or | and take first part
    const base = name.split(/[:|\|]/)[0].trim();
    return base.toLowerCase().replace(/\s+/g, ' ');
}

// Normalize for exact matching
function normalizeName(name) {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Group grantees by base organization name
const grouped = {};
const nameMap = {}; // Maps normalized name to canonical name

data.grantees.forEach(grantee => {
    const baseName = getBaseName(grantee.name);
    const normalizedFull = normalizeName(grantee.name);

    if (!grouped[baseName]) {
        grouped[baseName] = [];
        nameMap[baseName] = grantee.name.split(/[:|\|]/)[0].trim(); // Canonical base name
    }

    grouped[baseName].push(grantee);
});

// Consolidate
const consolidated = [];

Object.keys(grouped).forEach(baseName => {
    const entries = grouped[baseName];
    const canonicalBaseName = nameMap[baseName];

    if (entries.length === 1) {
        // Single entry
        consolidated.push(entries[0]);
    } else {
        // Multiple entries - check if they're truly duplicates or different projects
        const uniqueFullNames = [...new Set(entries.map(e => normalizeName(e.name)))];

        if (uniqueFullNames.length === 1) {
            // Exact duplicates (same full name)
            console.log(`\nConsolidating ${entries.length} duplicate entries for: ${canonicalBaseName}`);
        } else {
            // Same org, different projects
            console.log(`\nConsolidating ${entries.length} projects under: ${canonicalBaseName}`);
            entries.forEach((e, i) => {
                const projectName = e.name.includes(':') || e.name.includes('|')
                    ? e.name.split(/[:|\|]/)[1].trim()
                    : 'Main grant';
                console.log(`  ${i + 1}. ${projectName} - ${e.years.join(', ')} - $${e.amount.toLocaleString()}`);
            });
        }

        // Use first entry as base
        const base = { ...entries[0] };
        base.name = canonicalBaseName; // Use canonical base name without project specifiers

        // Collect all grant information with project names
        base.grants = entries.map((entry, index) => {
            const projectName = entry.name.includes(':') || entry.name.includes('|')
                ? entry.name.split(/[:|\|]/)[1].trim()
                : 'General funding';

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
        if (uniqueFullNames.length > 1) {
            base.description = `This organization received ${entries.length} grants for multiple projects totaling $${totalAmount.toLocaleString()}.`;
        } else {
            // Use longest description for true duplicates
            base.description = entries.reduce((longest, e) =>
                e.description.length > longest.length ? e.description : longest,
                entries[0].description
            );
        }

        // Combine focus areas
        const focusAreas = [...new Set(entries.map(e => e.focusArea))];
        base.focusAreas = focusAreas;
        base.focusArea = focusAreas.length === 1 ? focusAreas[0] : focusAreas.join('; ');

        // Status - active if any are active
        base.status = entries.some(e => e.status === 'active') ? 'active' : entries[0].status;

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
data.metadata.note = 'Organizations with multiple grants/projects have been consolidated. Project-specific details are preserved in grant information.';

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

const multiGrantOrgs = Object.values(grouped).filter(g => g.length > 1).length;
const originalCount = data.grantees.length + Object.values(grouped).reduce((sum, g) => sum + Math.max(0, g.length - 1), 0);

console.log(`\n✓ Consolidated from ${originalCount} entries to ${consolidated.length} unique organizations`);
console.log(`✓ ${multiGrantOrgs} organizations have multiple grants/projects`);
