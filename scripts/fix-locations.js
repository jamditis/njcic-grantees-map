const fs = require('fs');
const path = require('path');

// Read the grantees.json file
const granteesPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(granteesPath, 'utf8'));

// Location fixes
const fixes = [
    {
        name: '70and73.com',
        issue: 'City is "South Jersey" - not a real city',
        newCity: 'Vineland',
        newCounty: 'Cumberland County',
        newLat: 39.4863,
        newLng: -75.0257
    },
    {
        name: 'CAIR NJ',
        issue: 'City is "New Jersey" - not a real city',
        newCity: 'Newark',
        newCounty: 'Statewide',
        newLat: 40.7357,
        newLng: -74.1724
    },
    {
        name: 'Heady NJ',
        issue: 'City is "Statewide" - not a real city',
        newCity: 'Trenton',
        newCounty: 'Statewide',
        newLat: 40.2206,
        newLng: -74.7597
    },
    {
        name: 'Healthy NewsWorks',
        issue: 'City is "Philadelphia border" - not a real city',
        newCity: 'Camden',
        newCounty: 'Statewide',
        newLat: 39.9259,
        newLng: -75.1196
    },
    {
        name: 'Latino Spirit Media',
        issue: 'City is "Statewide" - not a real city',
        newCity: 'Newark',
        newCounty: 'Statewide',
        newLat: 40.7357,
        newLng: -74.1724
    },
    {
        name: 'Muslim',
        issue: 'City is "Statewide" - not a real city',
        newCity: 'Newark',
        newCounty: 'Statewide',
        newLat: 40.7357,
        newLng: -74.1724
    },
    {
        name: 'Movimiento Cosecha',
        issue: 'New Brunswick listed as Union County - should be Middlesex County',
        newCity: 'New Brunswick',
        newCounty: 'Middlesex County',
        newLat: 40.4922,
        newLng: -74.4513
    },
    {
        name: 'The Tower at Princeton High School',
        issue: 'Princeton listed as Gloucester County - should be Mercer County',
        newCity: 'Princeton',
        newCounty: 'Mercer County',
        newLat: 40.3573,
        newLng: -74.6672
    },
    {
        name: 'VaccinateNJ.com',
        issue: 'City is "Statewide" - not a real city',
        newCity: 'Newark',
        newCounty: 'Statewide',
        newLat: 40.7357,
        newLng: -74.1724
    }
];

let fixCount = 0;

// Apply fixes
data.grantees.forEach(grantee => {
    const fix = fixes.find(f => grantee.name === f.name);
    if (fix) {
        console.log(`✓ Fixing ${grantee.name}:`);
        console.log(`  Issue: ${fix.issue}`);
        console.log(`  Old: ${grantee.city}, ${grantee.county} (${grantee.lat}, ${grantee.lng})`);

        grantee.city = fix.newCity;
        grantee.county = fix.newCounty;
        grantee.lat = fix.newLat;
        grantee.lng = fix.newLng;

        console.log(`  New: ${grantee.city}, ${grantee.county} (${grantee.lat}, ${grantee.lng})`);
        console.log('');
        fixCount++;
    }
});

// Write back to file
fs.writeFileSync(granteesPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✓ Fixed ${fixCount} location issues`);
