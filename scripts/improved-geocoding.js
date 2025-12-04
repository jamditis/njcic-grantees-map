const fs = require('fs');
const path = require('path');

// More specific coordinates based on organization names and locations
const specificLocations = {
    // Organizations with city names
    'Hammonton Gazette': { lat: 39.6368, lng: -74.8021, city: 'Hammonton' },
    'Morristown Green': { lat: 40.7968, lng: -74.4815, city: 'Morristown' },
    'Atlantic City Focus': { lat: 39.3643, lng: -74.4229, city: 'Atlantic City' },
    'Stories of Atlantic City': { lat: 39.3643, lng: -74.4229, city: 'Atlantic City' },
    'Newark News and Story Collaborative': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Newark Water Coalition': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Trenton Journal': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Asbury Park Media Collective': { lat: 40.2204, lng: -74.0121, city: 'Asbury Park' },
    'Front Runner New Jersey': { lat: 39.3643, lng: -74.4229, city: 'Atlantic City' },

    // Universities and schools
    'Montclair State University': { lat: 40.8647, lng: -74.1975, city: 'Montclair' },
    'Center for Cooperative Media at Montclair State University': { lat: 40.8647, lng: -74.1975, city: 'Montclair' },
    'Center for Cooperative Media: NJ News Commons Spanish Translation Service': { lat: 40.8647, lng: -74.1975, city: 'Montclair' },
    'Center for Cooperative Media: Research and Development': { lat: 40.8647, lng: -74.1975, city: 'Montclair' },
    'Center for Cooperative Media: Statewide Voting Guide': { lat: 40.8647, lng: -74.1975, city: 'Montclair' },
    'Center for Cooperative Media: South Jersey Information Equity Project': { lat: 40.8647, lng: -74.1975, city: 'Montclair' },
    'Montclair Local Nonprofit News': { lat: 40.8259, lng: -74.2090, city: 'Montclair' },
    'Cranford High School': { lat: 40.6546, lng: -74.2993, city: 'Cranford' },
    'Wayne Hills High School': { lat: 40.9472, lng: -74.2474, city: 'Wayne' },
    'Targum Publishing Company': { lat: 40.5008, lng: -74.4474, city: 'New Brunswick' },
    'The Daily Targum (Targum Publishing Co.)': { lat: 40.5008, lng: -74.4474, city: 'New Brunswick' },
    'Daily Targum': { lat: 40.5008, lng: -74.4474, city: 'New Brunswick' },
    'Saint Peter\'s University (Slice of Culture)': { lat: 40.7237, lng: -74.0468, city: 'Jersey City' },
    'Slice of Culture @ Saint Peter\'s University': { lat: 40.7237, lng: -74.0468, city: 'Jersey City' },
    'The College of New Jersey': { lat: 40.2651, lng: -74.7860, city: 'Ewing' },
    'The Tower at Princeton High School': { lat: 40.3573, lng: -74.6672, city: 'Princeton' },

    // Specific organizations with known locations
    'The Jersey Bee': { lat: 40.8068, lng: -74.1854, city: 'Bloomfield' },
    'Ridge View Echo': { lat: 40.9912, lng: -74.9471, city: 'Blairstown' },
    'Blairstown Enhancement Committee (Ridge View Echo)': { lat: 40.9912, lng: -74.9471, city: 'Blairstown' },
    'Hopeloft': { lat: 39.4273, lng: -75.2341, city: 'Bridgeton' },
    'Hopeloft, Inc.': { lat: 39.4273, lng: -75.2341, city: 'Bridgeton' },
    'coLAB Arts': { lat: 40.4922, lng: -74.4513, city: 'New Brunswick' },
    'Black in Jersey': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Black In Jersey': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'The Jersey Vindicator': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'New Jersey Center for Investigative Reporting (The Jersey Vindicator)': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Public Square Amplified': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Clinton Hill Community Action': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Chalkbeat Newark (Civic News Company)': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Radio Rouj & Ble': { lat: 40.7673, lng: -74.2049, city: 'East Orange' },
    'Patterson Alliance': { lat: 40.9168, lng: -74.1718, city: 'Paterson' },
    'Paterson Alliance': { lat: 40.9168, lng: -74.1718, city: 'Paterson' },
    'Old Bridge NJ Resident': { lat: 40.4115, lng: -74.3654, city: 'Old Bridge' },
    'Two River Times': { lat: 40.3943, lng: -74.0632, city: 'Red Bank' },
    'Camden Parent & Student Union (CPSU)': { lat: 39.9259, lng: -75.1196, city: 'Camden' },
    'Camden Parent & Student Union': { lat: 39.9259, lng: -75.1196, city: 'Camden' },
    'Camden Fireworks': { lat: 39.9259, lng: -75.1196, city: 'Camden' },
    'VietLead': { lat: 39.9259, lng: -75.1196, city: 'Camden' },
    'HudPost': { lat: 40.7178, lng: -74.0431, city: 'Jersey City' },
    'Beyond Expectations': { lat: 39.9526, lng: -74.7118, city: 'Mount Holly' },
    'Movimiento Cosecha': { lat: 40.5795, lng: -74.5089, city: 'New Brunswick' },
    'New Labor': { lat: 40.5008, lng: -74.4474, city: 'New Brunswick' },
    'The Conservatory of Music and Performing Arts Society': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Intersystemz': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Central Desi': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'New Jersey State House News Service': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Central New Jersey Network': { lat: 40.5693, lng: -74.6094, city: 'Somerville' },
    'Corporation for New Jersey Local Media': { lat: 40.8568, lng: -74.4810, city: 'Morristown' },
    'NJ Pen': { lat: 40.9168, lng: -74.1718, city: 'Paterson' },
    'Industry Media Arts': { lat: 39.9526, lng: -74.1937, city: 'Toms River' },
    'Mental Health Association of New Jersey': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Lens 15 Media': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'New Jersey YMCA State Alliance': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'WNET/NJ Spotlight News': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'NJ Spotlight News': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'Unidad Latina en Acción NJ': { lat: 40.5008, lng: -74.4474, city: 'New Brunswick' },
    'New Jersey Council for the Humanities and Journalism + Design': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'NJ Coalition to End Homelessness': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'DataSourceNJ Inc.': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'South Jersey Climate News Project': { lat: 39.9544, lng: -75.1621, city: 'Cherry Hill' },
    'Garden State Initiative': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'Healthy NewsWorks': { lat: 39.9259, lng: -75.1196, city: 'Camden' },
    'Inside Climate News': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'CAIR NJ': { lat: 40.0583, lng: -74.4057, city: 'New Jersey' },
    'New Jersey Urban News': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'VaccinateNJ.com': { lat: 40.0583, lng: -74.4057, city: 'Statewide' },
    '70and73.com': { lat: 39.5501, lng: -75.0000, city: 'South Jersey' },
    'Heady NJ': { lat: 40.0583, lng: -74.4057, city: 'Statewide' },
    'Latino Spirit Media': { lat: 40.0583, lng: -74.4057, city: 'Statewide' },
    'Muslim': { lat: 40.7357, lng: -74.1724, city: 'Newark' },
    'MercerMe': { lat: 40.2206, lng: -74.7597, city: 'Trenton' },
    'DoverNow Magazine': { lat: 40.8837, lng: -74.5622, city: 'Dover' },
    'Global Patriot Newspapers online': { lat: 40.9168, lng: -74.1718, city: 'Paterson' },
    'TAPinto Bayonne, Hamilton/Robbinsville, Hoboken, Jersey City, Paterson.': { lat: 40.7178, lng: -74.0431, city: 'Jersey City' },
    'TAPinto FairLawn/GlenRock': { lat: 40.9401, lng: -74.1321, city: 'Fair Lawn' },
    'TAPinto Hasbrouk Heights': { lat: 40.8584, lng: -74.0821, city: 'Hasbrouck Heights' },
    'TAPinto Raritan Bay (Sayreville/South Amboy) and TAPinto Scotch Plains-Fanwood': { lat: 40.4587, lng: -74.3610, city: 'Sayreville' },
    'New Jersey Hills Media Group': { lat: 40.7968, lng: -74.4815, city: 'Morristown' }
};

// Read the current grantees.json
const jsonPath = path.join(__dirname, '..', 'data', 'grantees.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Update coordinates for each grantee
let updated = 0;
data.grantees.forEach(grantee => {
    if (specificLocations[grantee.name]) {
        const location = specificLocations[grantee.name];
        grantee.lat = location.lat;
        grantee.lng = location.lng;
        if (location.city && !grantee.city) {
            grantee.city = location.city;
        }
        updated++;
    }
});

// Write back to file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log(`✓ Updated coordinates for ${updated} grantees`);
console.log(`✓ Total grantees in file: ${data.grantees.length}`);
