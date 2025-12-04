const fs = require('fs');
const path = require('path');

// County coordinates for New Jersey
const countyCoordinates = {
    'Atlantic County': { lat: 39.4643, lng: -74.5746 },
    'Bergen County': { lat: 40.9368, lng: -74.0781 },
    'Burlington County': { lat: 39.9526, lng: -74.7118 },
    'Camden County': { lat: 39.8084, lng: -75.0126 },
    'Cape May County': { lat: 39.0843, lng: -74.9060 },
    'Cumberland County': { lat: 39.3812, lng: -75.1549 },
    'Essex County': { lat: 40.7870, lng: -74.2392 },
    'Gloucester County': { lat: 39.7084, lng: -75.1549 },
    'Hudson County': { lat: 40.7453, lng: -74.0653 },
    'Hunterdon County': { lat: 40.5723, lng: -74.9026 },
    'Mercer County': { lat: 40.2732, lng: -74.7132 },
    'Middlesex County': { lat: 40.4462, lng: -74.4118 },
    'Monmouth County': { lat: 40.2943, lng: -74.1649 },
    'Morris County': { lat: 40.8568, lng: -74.4810 },
    'Ocean County': { lat: 39.9272, lng: -74.1965 },
    'Passaic County': { lat: 40.9668, lng: -74.2632 },
    'Salem County': { lat: 39.5723, lng: -75.4668 },
    'Somerset County': { lat: 40.5687, lng: -74.6188 },
    'Sussex County': { lat: 41.1812, lng: -74.6968 },
    'Union County': { lat: 40.6584, lng: -74.3057 },
    'Warren County': { lat: 40.8612, lng: -75.0371 },
    'Statewide': { lat: 40.0583, lng: -74.4057 },
    'South Jersey': { lat: 39.5501, lng: -75.0000 },
    'North Jersey': { lat: 40.9168, lng: -74.1718 },
    'Central Jersey': { lat: 40.4462, lng: -74.4118 }
};

// City coordinates (for more precise locations)
const cityCoordinates = {
    'Atlantic City': { lat: 39.3643, lng: -74.4229 },
    'Newark': { lat: 40.7357, lng: -74.1724 },
    'Jersey City': { lat: 40.7178, lng: -74.0431 },
    'Trenton': { lat: 40.2206, lng: -74.7597 },
    'Camden': { lat: 39.9259, lng: -75.1196 },
    'Paterson': { lat: 40.9168, lng: -74.1718 },
    'Hammonton': { lat: 39.6368, lng: -74.8021 },
    'Bridgeton': { lat: 39.4273, lng: -75.2341 },
    'Blairstown': { lat: 40.9812, lng: -74.9579 },
    'Bloomfield': { lat: 40.8068, lng: -74.1854 },
    'Old Bridge': { lat: 40.4115, lng: -74.3654 },
    'Asbury Park': { lat: 40.2204, lng: -74.0121 },
    'Montclair': { lat: 40.8576, lng: -74.1968 },
    'Cranford': { lat: 40.6584, lng: -74.3057 },
    'East Orange': { lat: 40.7673, lng: -74.2049 },
    'New Brunswick': { lat: 40.4862, lng: -74.4518 },
    'Morristown': { lat: 40.7968, lng: -74.4815 },
    'Wayne': { lat: 40.9254, lng: -74.2765 }
};

// Parse CSV properly handling quoted multi-line entries
function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"' && nextChar === '"' && inQuotes) {
            // Escaped quote
            currentField += '"';
            i++; // Skip next quote
        } else if (char === '"') {
            // Toggle quote mode
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            // Field separator
            currentRow.push(currentField.trim());
            currentField = '';
        } else if (char === '\n' && !inQuotes) {
            // Row separator
            currentRow.push(currentField.trim());
            if (currentRow.some(f => f)) { // Skip empty rows
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else if (char === '\r') {
            // Skip carriage returns
            continue;
        } else {
            currentField += char;
        }
    }

    // Add last field and row if not empty
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f)) {
            rows.push(currentRow);
        }
    }

    // Convert rows to grantee objects (skip header row)
    const grantees = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 6 && row[0] && row[1]) {
            grantees.push({
                name: row[0],
                amount: parseFloat(row[1].replace(/[\$,]/g, '')) || 0,
                description: row[2] || '',
                website: row[3] || '',
                years: row[4] ? row[4].split(',').map(y => y.trim()) : [],
                focusArea: row[5] || '',
                serviceArea: row[6] || '',
                cancelled: row[7] === 'checked',
                cancelReason: row[8] || ''
            });
        }
    }

    return grantees;
}

function determineStatus(grantee) {
    if (grantee.cancelled) {
        return 'cancelled';
    }

    const latestYear = Math.max(...grantee.years.map(y => parseInt(y)));
    return latestYear >= 2024 ? 'active' : 'completed';
}

function getCoordinates(grantee) {
    // Try to find city-specific coordinates first
    for (const city in cityCoordinates) {
        if (grantee.name.toLowerCase().includes(city.toLowerCase()) ||
            grantee.serviceArea.toLowerCase().includes(city.toLowerCase())) {
            return cityCoordinates[city];
        }
    }

    // Fall back to county coordinates
    if (countyCoordinates[grantee.serviceArea]) {
        return countyCoordinates[grantee.serviceArea];
    }

    // Default to NJ center
    return { lat: 40.0583, lng: -74.4057 };
}

function extractCity(grantee) {
    for (const city in cityCoordinates) {
        if (grantee.name.toLowerCase().includes(city.toLowerCase())) {
            return city;
        }
    }
    return null;
}

// Main processing function
function processCSV() {
    const csvPath = path.join(__dirname, '..', 'data', 'Grants-Grid view.csv');
    const jsonPath = path.join(__dirname, '..', 'data', 'grantees.json');

    // Read CSV
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const parsedGrantees = parseCSV(csvText);

    // Convert to JSON format with coordinates
    const grantees = parsedGrantees
        .filter(g => !g.cancelled) // Exclude cancelled grants
        .map(g => {
            const coords = getCoordinates(g);
            const city = extractCity(g);

            return {
                name: g.name,
                county: g.serviceArea,
                city: city,
                years: g.years,
                amount: g.amount,
                description: g.description.replace(/\s+/g, ' ').trim(),
                lat: coords.lat,
                lng: coords.lng,
                status: determineStatus(g),
                website: g.website,
                focusArea: g.focusArea
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    // Write to JSON
    const output = {
        grantees: grantees,
        metadata: {
            totalGrantees: grantees.length,
            totalFunding: grantees.reduce((sum, g) => sum + g.amount, 0),
            lastUpdated: new Date().toISOString(),
            dataSource: 'Grants-Grid view.csv'
        }
    };

    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));

    console.log(`✓ Processed ${grantees.length} grantees`);
    console.log(`✓ Total funding: $${output.metadata.totalFunding.toLocaleString()}`);
    console.log(`✓ Updated: ${jsonPath}`);
}

// Run the script
try {
    processCSV();
} catch (error) {
    console.error('Error processing CSV:', error);
    process.exit(1);
}
