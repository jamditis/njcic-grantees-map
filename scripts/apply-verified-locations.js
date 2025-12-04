const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Verified location corrections based on web searches
const corrections = {
    'Black in Jersey': {
        city: 'Trenton',
        county: 'Statewide',
        lat: 40.2206,
        lng: -74.7597,
        reason: 'Black in Jersey is headquartered in Trenton, not Newark'
    },
    'Black In Jersey': {
        city: 'Trenton',
        county: 'Statewide',
        lat: 40.2206,
        lng: -74.7597,
        reason: 'Black In Jersey is headquartered in Trenton, not Newark'
    },
    'Corporation for New Jersey Local Media': {
        city: 'New Vernon',
        county: 'Morris County',
        lat: 40.7443,
        lng: -74.4729,
        reason: 'Actual address is 55 Woodland Rd, New Vernon, NJ 07976'
    },
    'DoverNow Magazine': {
        city: 'Dover',
        county: 'Morris County',
        lat: 40.8837,
        lng: -74.5622,
        reason: 'Confirmed at 7 N. Sussex St, Dover, NJ'
    },
    'Front Runner New Jersey': {
        city: 'Atlantic City',
        county: 'Atlantic County',
        lat: 39.3643,
        lng: -74.4229,
        reason: 'Confirmed at 3101 Boardwalk Unit 2412, Tower 2, Atlantic City'
    },
    'Hammonton Gazette': {
        city: 'Hammonton',
        lat: 39.6368,
        lng: -74.8021,
        reason: 'Confirmed at 14 Tilton Street, Hammonton'
    },
    'Montclair Local Nonprofit News': {
        city: 'Montclair',
        county: 'Essex County',
        lat: 40.8259,
        lng: -74.209,
        reason: 'Confirmed P.O. Box 752, Montclair'
    },
    'NJ Spotlight News': {
        city: 'Newark',
        county: 'Statewide',
        lat: 40.7357,
        lng: -74.1724,
        reason: 'Confirmed at 2 Gateway Center, Newark'
    }
};

let fixCount = 0;

// Apply corrections
data.grantees.forEach(grantee => {
    const correction = corrections[grantee.name];
    if (correction) {
        console.log(`✓ Updating ${grantee.name}:`);
        console.log(`  Reason: ${correction.reason}`);
        console.log(`  Old: ${grantee.city}, ${grantee.county} (${grantee.lat}, ${grantee.lng})`);

        if (correction.city) grantee.city = correction.city;
        if (correction.county) grantee.county = correction.county;
        if (correction.lat) grantee.lat = correction.lat;
        if (correction.lng) grantee.lng = correction.lng;

        console.log(`  New: ${grantee.city}, ${grantee.county} (${grantee.lat}, ${grantee.lng})`);
        console.log('');
        fixCount++;
    }
});

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✓ Applied ${fixCount} verified location corrections`);
