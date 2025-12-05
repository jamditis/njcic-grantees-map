# NJ Civic Information Consortium grantees map

An interactive web-based map visualizing grantees of the New Jersey Civic Information Consortium. This project displays journalism and civic engagement projects across New Jersey using CARTO Voyager tiles and Leaflet.js.

![screenshot of map](https://i.imgur.com/yoYai54.png)

## About the project

The New Jersey Civic Information Consortium supports local journalism, civic engagement, and information equity projects throughout New Jersey. This interactive map helps visualize the geographic distribution of grants, funding amounts, and project details.

![impact of njcic at a glance](https://i.imgur.com/AkmNypD.png)

## Features

- Interactive map powered by CARTO Voyager tiles and Leaflet.js
- Custom markers showing organization initials
- Marker clustering with hover-to-expand functionality for better performance
- Filter grantees by year (2021-2025), county, focus area, and project status
- Detailed modal popups showing grant information, descriptions, and website links
- Support for organizations with multiple grants showing individual project details
- Sequential navigation through all grantees with prev/next buttons
- Click-and-drag panning and pinch-to-zoom on mobile
- Statistics dashboard showing total grantees, funding, and active projects
- Comprehensive map legend explaining markers, clusters, and status indicators
- Status indicators: Active (2024+) and Completed (pre-2024)
- Responsive design optimized for mobile and desktop viewing
- NJCIC branding with logo and mission statement

## Getting started

### Prerequisites

- Node.js (v14 or higher) for running the development server
- Modern web browser with JavaScript enabled

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

### Running the application

Start the development server:
```bash
npm start
```

This will start a local HTTP server on port 8080 and open the application in your default browser at `http://localhost:8080`.

Alternatively, you can use any static file server:
```bash
npx http-server -p 8080
```

Or simply open `index.html` directly in a web browser (some browsers may have CORS restrictions with local file access).

## Project structure

```
njcic-map/
├── data/
│   ├── grantees.json          # Grantee data with locations and details
│   └── Grants-Grid view.csv   # Source data file
├── js/
│   └── app.js                 # Main application logic
├── scripts/
│   ├── process-csv.js         # CSV to JSON processing with geocoding
│   ├── consolidate-suffix-duplicates.js  # Consolidate business name variations
│   ├── smart-consolidate.js   # Consolidate projects under parent orgs
│   └── improved-geocoding.js  # Geocoding corrections for specific locations
├── styles/
│   └── main.css               # Styles for the application
├── docs/
│   └── CHANGELOG.md           # Detailed changelog of updates
├── index.html                 # Main HTML file
├── package.json               # Project metadata and dependencies
└── README.md                  # This file
```

## Data structure

The `data/grantees.json` file contains an array of grantee objects with the following structure:

**Single grant organization:**
```json
{
  "name": "Organization Name",
  "county": "County Name",
  "city": "City Name (optional)",
  "years": ["2021", "2022"],
  "amount": 100000,
  "description": "Project description",
  "lat": 40.1234,
  "lng": -74.5678,
  "status": "active|completed",
  "website": "https://example.org",
  "focusArea": "Civic news and information reporting"
}
```

**Multiple grants organization:**
```json
{
  "name": "Organization Name",
  "county": "County Name",
  "city": "City Name (optional)",
  "years": ["2021", "2022", "2024"],
  "amount": 250000,
  "hasMultipleGrants": true,
  "grantCount": 2,
  "totalAmount": 250000,
  "grants": [
    {
      "id": 1,
      "projectName": "Specific Project Name",
      "years": ["2021"],
      "amount": 100000,
      "description": "Project-specific description",
      "focusArea": "Focus area",
      "status": "completed"
    },
    {
      "id": 2,
      "projectName": "Another Project",
      "years": ["2024"],
      "amount": 150000,
      "description": "Another description",
      "focusArea": "Focus area",
      "status": "active"
    }
  ],
  "lat": 40.1234,
  "lng": -74.5678,
  "website": "https://example.org"
}
```

## Technologies used

- **Leaflet.js v1.9.4** - Interactive mapping library
- **CARTO Voyager** - Map tile provider
- **Leaflet.markercluster** - Marker clustering with hover-to-expand functionality
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Vanilla JavaScript (ES6)** - No framework dependencies
- **Custom CSS** - Additional responsive styling and animations

## Updating grantee data

### Automated process (recommended)

To update the map with new grants from the CSV source:

1. Edit `data/Grants-Grid view.csv` with new grant information
2. Run the processing script:
   ```bash
   npm run process-csv
   ```
3. The script will:
   - Parse the CSV file
   - Filter out cancelled/returned grants
   - Geocode locations to lat/lng coordinates
   - Generate updated `data/grantees.json`
4. (Optional) Run consolidation scripts if needed:
   ```bash
   node scripts/consolidate-suffix-duplicates.js
   node scripts/smart-consolidate.js
   ```
5. Refresh the browser to see changes

### Manual process

To manually edit the grantee data:

1. Edit `data/grantees.json` directly
2. Add new grantee objects with required fields (see Data structure above)
3. Use https://www.latlong.net/ or similar to get accurate coordinates
4. Refresh the browser to see changes

### Current statistics

- 73 unique organizations
- 19 organizations with multiple grants
- Total funding: $10,796,392.75
- Grant years: 2021-2025
- Status: Active (2024+) or Completed (pre-2024)

## Browser support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License

## Credits

Created by Joe Amditis for the Center for Cooperative Media at Montclair State University.

Data source: New Jersey Civic Information Consortium
