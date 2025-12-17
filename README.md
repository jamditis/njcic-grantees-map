# NJ Civic Information Consortium grantees map

An interactive map displaying grantees of the New Jersey Civic Information Consortium. The map automatically syncs with Airtable, so NJCIC staff can update grantee information in Airtable and see changes reflected on the map daily.

**Live site:** https://njcivicinfo.org/map/

![screenshot of map](https://i.imgur.com/yoYai54.png)

## About the project

The New Jersey Civic Information Consortium supports local journalism, civic engagement, and information equity projects throughout New Jersey. This interactive map visualizes the geographic distribution of grants, funding amounts, and project details across the state.

The map data is powered by Airtable and syncs automatically every morning at 7am ET.

![impact of njcic at a glance](https://i.imgur.com/AkmNypD.png)

## Features

- Interactive map powered by Leaflet.js and CARTO Voyager tiles
- **Live sync with Airtable** - Update grantees in Airtable, see changes on the map
- Custom markers showing organization initials
- Marker clustering with hover-to-expand functionality
- Filter by year (2021-2025), county, focus area, and status
- Detailed popups showing grant information, descriptions, and website links
- Support for organizations with multiple grants
- Sequential navigation through grantees with prev/next buttons
- Mobile-friendly with touch gestures
- Status indicators: Active (2024+) and Completed (pre-2024)

## Current statistics

- **76 grantee organizations**
- **100 total grants awarded**
- **$10.8+ million in funding**
- Grant years: 2021-2025

---

## How the Airtable sync works

```
Airtable → Automatic sync (7am ET daily) → Map updates
```

1. **NJCIC staff updates Airtable** - Add, edit, or remove grantees
2. **Sync runs automatically** - Every day at 7am ET via GitHub Actions
3. **Map displays new data** - Visitors see updated information

### Manual sync

To update the map immediately (without waiting for the daily sync):

**Option 1:** Visit the sync URL directly:
```
https://njcivicinfo.org/grantees/map/sync.php?key=[SECRET_KEY]
```

**Option 2:** Trigger via GitHub Actions:
1. Go to the Actions tab in this repo
2. Click "Sync Airtable Data"
3. Click "Run workflow"

---

## For NJCIC staff

See the full staff guide: [docs/NJCIC-Map-Guide.md](docs/NJCIC-Map-Guide.md)

### Quick reference

| Task | How to do it |
|------|--------------|
| Add new grantee | Add row in Airtable with all fields |
| Edit grantee | Edit the row in Airtable |
| Remove grantee | Check "Returned/Cancelled grant?" in Airtable |
| Get coordinates | Use [latlong.net](https://www.latlong.net/) |
| Force immediate sync | Visit sync URL or use GitHub Actions |

---

## Development

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser

### Local development

```bash
# Clone the repo
git clone https://github.com/jamditis/njcic-grantees-map.git
cd njcic-grantees-map

# Install dependencies
npm install

# Start local server
npm start
```

The app will open at `http://localhost:8080`

### Project structure

```
njcic-grantees-map/
├── data/
│   └── grantees.json           # Grantee data (synced from Airtable)
├── js/
│   └── app.js                  # Main application logic
├── scripts/
│   ├── sync-airtable.js        # Node.js sync script (local use)
│   └── populate-airtable-coords.js  # Push coordinates to Airtable
├── docs/
│   └── NJCIC-Map-Guide.md      # Staff guide
├── .github/
│   └── workflows/
│       └── sync-airtable.yml   # GitHub Actions daily sync
├── sync.php                    # PHP sync script (runs on server)
├── index.html                  # Main HTML file
└── README.md
```

### Running the sync locally

```bash
# Set environment variable
export AIRTABLE_PAT=your_pat_here

# Run sync
npm run sync
```

---

## Technologies

- **Leaflet.js** - Interactive mapping
- **CARTO Voyager** - Map tiles
- **Leaflet.markercluster** - Marker clustering
- **Tailwind CSS** - Styling (via CDN)
- **Airtable API** - Data source
- **GitHub Actions** - Automated sync
- **PHP** - Server-side sync script

## License

MIT License

## Credits

Created by Joe Amditis for the Center for Cooperative Media at Montclair State University.

Data source: New Jersey Civic Information Consortium
