/**
 * Populate Airtable with lat/lng coordinates from existing grantees.json
 *
 * This script reads the existing grantees.json file and updates matching
 * Airtable records with lat, lng, and city values.
 *
 * Usage:
 *   node scripts/populate-airtable-coords.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration - uses environment variables
const CONFIG = {
    PAT: process.env.AIRTABLE_PAT,
    BASE_ID: process.env.AIRTABLE_BASE_ID || 'appryDZWgPpP0GmZw',
    TABLE_ID: process.env.AIRTABLE_TABLE_ID || 'tblFADXYCq495smGH'
};

// Check for required credentials
if (!CONFIG.PAT) {
    console.error('ERROR: AIRTABLE_PAT environment variable is required');
    console.error('Set it in your .env file or environment');
    process.exit(1);
}

/**
 * Fetch all records from Airtable with pagination
 */
async function fetchAllRecords() {
    let allRecords = [];
    let offset = null;

    do {
        const records = await fetchPage(offset);
        allRecords = allRecords.concat(records.records);
        offset = records.offset;
        console.log(`Fetched ${allRecords.length} records...`);
    } while (offset);

    return allRecords;
}

/**
 * Fetch a single page of records
 */
function fetchPage(offset = null) {
    return new Promise((resolve, reject) => {
        let pathUrl = `/v0/${CONFIG.BASE_ID}/${CONFIG.TABLE_ID}?pageSize=100`;
        if (offset) {
            pathUrl += `&offset=${offset}`;
        }

        const options = {
            hostname: 'api.airtable.com',
            path: pathUrl,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CONFIG.PAT}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Update records in Airtable (batch of up to 10)
 */
function updateRecords(records) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ records });

        const options = {
            hostname: 'api.airtable.com',
            path: `/v0/${CONFIG.BASE_ID}/${CONFIG.TABLE_ID}`,
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${CONFIG.PAT}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(responseData));
                    } catch (e) {
                        resolve({ success: true });
                    }
                } else {
                    reject(new Error(`Update failed (${res.statusCode}): ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/**
 * Load existing grantees data
 */
function loadExistingData() {
    const dataPath = path.join(__dirname, '..', 'data', 'grantees.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return data.grantees || [];
}

/**
 * Normalize grantee name for matching
 */
function normalizeName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[,.']/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\binc\b/g, '')
        .replace(/\bllc\b/g, '')
        .replace(/\bcorp\b/g, '')
        .trim();
}

/**
 * Find matching grantee from existing data
 */
function findMatch(airtableName, existingGrantees) {
    const normalized = normalizeName(airtableName);

    // Exact match first
    for (const g of existingGrantees) {
        if (normalizeName(g.name) === normalized) {
            return g;
        }
    }

    // Partial match
    for (const g of existingGrantees) {
        const existingNorm = normalizeName(g.name);
        if (existingNorm.includes(normalized) || normalized.includes(existingNorm)) {
            return g;
        }
    }

    // Word-based match (at least 2 words match)
    const words = normalized.split(' ').filter(w => w.length > 2);
    for (const g of existingGrantees) {
        const existingWords = normalizeName(g.name).split(' ').filter(w => w.length > 2);
        const matchCount = words.filter(w => existingWords.includes(w)).length;
        if (matchCount >= 2) {
            return g;
        }
    }

    return null;
}

/**
 * Sleep for rate limiting
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function populateCoordinates() {
    console.log('=== Populating Airtable with coordinates ===\n');

    // Load existing data
    const existingGrantees = loadExistingData();
    console.log(`Loaded ${existingGrantees.length} grantees from grantees.json\n`);

    // Fetch all Airtable records
    console.log('Fetching Airtable records...');
    const airtableRecords = await fetchAllRecords();
    console.log(`\nFetched ${airtableRecords.length} records from Airtable\n`);

    // Match and prepare updates
    const updates = [];
    const noMatch = [];

    for (const record of airtableRecords) {
        const name = record.fields['Grantee'];
        const match = findMatch(name, existingGrantees);

        if (match && match.lat && match.lng) {
            updates.push({
                id: record.id,
                fields: {
                    // Use field IDs instead of names
                    'fldXBmRZZoCXp5M68': match.lat,  // lat field
                    'fldaDClMwhIEBuqeM': match.lng,  // lng field
                    'fldFKPPOed5phSskL': match.city || ''  // city field
                }
            });
        } else {
            noMatch.push(name);
        }
    }

    console.log(`Found coordinates for ${updates.length} grantees`);
    console.log(`No match for ${noMatch.length} grantees\n`);

    if (noMatch.length > 0) {
        console.log('Grantees without coordinate match:');
        noMatch.forEach(n => console.log(`  - ${n}`));
        console.log('');
    }

    // Update in batches of 10 (Airtable limit)
    console.log('Updating Airtable records...');
    const batchSize = 10;
    let updated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);

        try {
            await updateRecords(batch);
            updated += batch.length;
            console.log(`Updated ${updated}/${updates.length} records...`);

            // Rate limit: 5 requests per second
            if (i + batchSize < updates.length) {
                await sleep(250);
            }
        } catch (error) {
            console.error(`Error updating batch starting at ${i}:`, error.message);
        }
    }

    console.log(`\n=== Done! Updated ${updated} records with coordinates ===`);
}

// Run
populateCoordinates().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
