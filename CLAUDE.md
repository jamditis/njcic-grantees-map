# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a web-based interactive map application visualizing New Jersey Civic Information Consortium (NJCIC) grantees. The application uses OpenStreetMap for map tiles and Leaflet.js for map interactions. It displays journalism and civic engagement projects across New Jersey with filtering capabilities and detailed information popups.

## Architecture

**Technology stack:**
- Pure HTML/CSS/JavaScript (no build process or framework)
- Leaflet.js v1.9.4 for mapping functionality
- Leaflet.markercluster for grouping nearby markers
- CARTO Voyager tiles for base map
- Static JSON file for data storage
- Tailwind CSS via CDN for utility classes

**Key components:**
- `index.html` - Main application structure with map container, sidebar, and filters
- `js/app.js` - Application logic including map initialization, filtering, and interactivity
- `styles/main.css` - All styling including responsive design and custom popup styles
- `data/grantees.json` - Grantee data with coordinates, funding amounts, descriptions, and metadata

**Application flow:**
1. On page load, `init()` fetches grantee data from JSON
2. Map initializes centered on New Jersey (40.0583, -74.4057) at zoom level 8
3. Marker cluster group created and added to map
4. Markers created for each grantee with popup content
5. Sidebar populated with sorted list and statistics
6. Filters update the displayed markers and sidebar in real-time

## Development commands

**Start local development server:**
```bash
npm start
# or
npm run dev
```
Both commands start http-server on port 8080 and open browser automatically.

**Manual server start (without npm):**
```bash
npx http-server -p 8080 -o
```

**Alternative (Python):**
```bash
python -m http.server 8080
```

**Alternative (PHP):**
```bash
php -S localhost:8080
```

Note: A local server is recommended to avoid CORS issues when loading JSON data. Opening index.html directly in a browser may work but is not guaranteed.

## Data management

**Grantee data structure:**
Each grantee object in `data/grantees.json` requires:
- `name` (string) - Organization or project name
- `county` (string) - County location (or "Statewide" / "South Jersey")
- `years` (array) - Array of year strings (e.g., ["2021", "2022"])
- `amount` (number) - Grant amount in dollars
- `description` (string) - Brief project description
- `lat` (number) - Latitude coordinate
- `lng` (number) - Longitude coordinate
- `status` (string) - Either "active" or "completed"
- `city` (string, optional) - Specific city within county

**Adding new grantees:**
1. Obtain accurate lat/lng coordinates (use https://www.latlong.net/ or similar)
2. Add new object to `grantees` array in `data/grantees.json`
3. Ensure all required fields are present
4. Follow existing formatting and structure
5. Refresh browser to see changes (no rebuild needed)

**Coordinate accuracy:**
- Use at least 4 decimal places for lat/lng (±11 meters accuracy)
- For statewide projects, use New Jersey center point (40.0583, -74.4057)
- For regional projects (South Jersey), use regional center point
- For specific cities, use city center or organization's actual location

## Key functionality

**Filtering system:**
The application has three independent filters that work together:
- Year filter - Shows only grantees active in selected year
- County filter - Shows only grantees in selected county
- Status filter - Shows active or completed projects

Filters are applied via `applyFilters()` function which:
1. Iterates through all grantees checking each filter condition
2. Updates `filteredGrantees` array
3. Calls `updateMarkers()` to refresh map
4. Calls `updateSidebar()` to refresh list
5. Calls `updateStats()` to recalculate statistics
6. Fits map bounds to show all filtered markers

**Marker clustering:**
Leaflet.markercluster groups nearby markers to improve performance and reduce visual clutter. Configuration in `initMap()`:
- `maxClusterRadius: 50` - Markers within 50px cluster together
- `spiderfyOnMaxZoom: true` - Spreads markers at max zoom
- `removeOutsideVisibleBounds: true` - Performance optimization

**Sidebar interactions:**
- Clicking a grantee item in sidebar zooms map to that location and opens popup
- Clicking a marker highlights corresponding sidebar item with blue background animation
- List auto-scrolls to highlighted item

## Styling

**Color scheme (NJCIC brand colors):**
- Primary teal: #2dc8d2
- Accent orange: #f34213
- Dark teal: #183642
- Background: #f8f9fa
- Text: #495057

**Responsive breakpoints:**
- Desktop: Full sidebar visible (350px width)
- Tablet (1024px): Narrower sidebar (300px)
- Mobile (768px): Sidebar moves below map, max-height 300px

**Custom CSS classes:**
- `.grantee-item` - Sidebar list items
- `.popup-content` - Marker popup structure
- `.status-badge` - Active/completed status indicators
- Marker cluster colors defined at bottom of main.css

## Common tasks

**Updating map center or zoom:**
Edit line in `initMap()`:
```javascript
map = L.map('map').setView([40.0583, -74.4057], 8);
```

**Changing tile provider:**
Current tile provider is CARTO Voyager. To change to another provider, replace in `initMap()`:
```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
}).addTo(map);
```

**Modifying popup content:**
Edit `createPopupContent()` function in app.js. Uses template literals for HTML structure.

**Adjusting statistics:**
Modify `updateStats()` function to add new calculations or change display format.

**Adding new filters:**
1. Add select element to `.controls` section in index.html
2. Add event listener in `setupEventListeners()`
3. Add filter logic to `applyFilters()` function

## File organization

Do not create nested subdirectories. Keep flat structure:
- All JavaScript in `js/` folder
- All CSS in `styles/` folder
- All data in `data/` folder
- HTML files in root

## Notes for development

- No build process required - changes to HTML/CSS/JS are immediately reflected on page refresh
- No package dependencies for runtime - Leaflet loaded via CDN
- JSON data is loaded asynchronously - always check for loading errors
- Coordinates must be decimal degrees (not DMS format)
- When adding many grantees at once, consider performance impact on marker clustering
- Test filters after data updates to ensure proper filtering behavior
- Browser console will show errors if JSON is malformed or files missing

## Integration with source data

The grantee data is maintained in `data/Grants-Grid view.csv` which contains detailed information about all grants including:
- Grantee names and contact information
- Grant amounts and years
- Descriptions and focus areas
- Website URLs
- Service areas (counties)
- Status (active/cancelled/returned)

### Updating the map with new data

When the CSV is updated with new grants or changes:

1. **Update the CSV file**: Edit `data/Grants-Grid view.csv` with new information

2. **Process the CSV**: Run the processing script
```bash
npm run process-csv
```

This script (`scripts/process-csv.js`) will:
- Parse the CSV file handling multi-line entries and quoted fields
- Filter out cancelled/returned grants
- Geocode locations to lat/lng coordinates based on county/city
- Generate `data/grantees.json` with all processed data
- Output statistics: total grantees, funding amount

3. **Verify the output**: Check that:
   - Total number of grantees is correct (CSV has 104 total, 99 active after filtering)
   - Total funding amount matches expectations ($10,796,392.75)
   - New grantees have proper coordinates
   - All required fields are present

4. **Test the map**: Refresh the browser to see updates
   - Verify new markers appear in correct locations
   - Check that filters work properly
   - Test popups show complete information including website links

### Geocoding notes

The processing script uses predefined coordinates for:
- All 21 NJ counties
- Major cities (Newark, Jersey City, Atlantic City, etc.)
- Regional areas (Statewide, South Jersey, North Jersey, Central Jersey)

For new cities not in the coordinates dictionary:
1. Look up coordinates using https://www.latlong.net/ or similar service
2. Add to `cityCoordinates` object in `scripts/process-csv.js`
3. Re-run `npm run process-csv`

### Data schema in grantees.json

Each grantee object contains:
```json
{
  "name": "Organization Name",
  "county": "County Name",
  "city": "City Name or null",
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

Organizations with multiple grants have additional fields:
```json
{
  "hasMultipleGrants": true,
  "grantCount": 2,
  "totalAmount": 200000,
  "grants": [
    {
      "id": 1,
      "projectName": "Project Name",
      "years": ["2021"],
      "amount": 100000,
      "description": "Specific grant description",
      "focusArea": "Focus area",
      "status": "active"
    }
  ]
}
```

## Recent updates and improvements (2025-11-06)

### Major UI/UX overhaul

The application underwent significant improvements to user interface, mobile experience, and data management:

**Map controls redesign:**
- Removed default Leaflet zoom controls (top-left position)
- Integrated custom zoom in/out buttons into bottom navigation bar
- Unified control design with prev/next marker and home buttons
- All controls use NJCIC brand colors consistently
- Full mobile responsiveness with touch-friendly button sizing

**Map legend addition:**
- Comprehensive map key in top right corner
- Shows single marker example, cluster types (small/medium/large), and status indicators
- Uses NJCIC color palette (#2dc8d2 teal, #f34213 orange, #183642 dark teal)
- Automatically resizes for mobile devices
- Positioned at z-30 to stay behind modals (z-40)

**Enhanced mobile experience:**
- Map height optimized for mobile (70vh vs 85vh on desktop)
- All buttons scaled appropriately for touch targets
- Legend compressed and repositioned for small screens
- Navigation controls properly spaced for thumb-friendly interaction
- Modal remains fully usable on mobile without legend obstruction

### Data consolidation improvements

**Business suffix handling:**
Created `scripts/consolidate-suffix-duplicates.js` to handle organizational naming variations:
- Strips common suffixes (Inc., LLC, Corp., Incorporated, etc.) for matching
- Consolidates entries like "Organization" and "Organization, Inc."
- Preserves all individual grant information in `grants` array
- Uses cleanest canonical name without suffix
- Successfully consolidated HopeLoft + HopeLoft, Inc. ($264,690 total)

**Current data statistics:**
- 73 unique organizations (down from 74 after consolidation)
- 19 organizations with multiple grants/projects
- All grant details preserved with project names
- Consistent naming across all entries

### Technical challenges and solutions

#### Challenge 1: Zoom button functionality

**Problem:** Custom zoom buttons not working despite proper event listeners

**Attempted solutions:**
1. Used `map.zoomIn()` and `map.zoomOut()` methods - Failed
2. Used `map.setZoom(level)` with explicit zoom levels - Failed
3. Used `map.flyTo(center, zoom)` with animation - Failed

**Root cause:** Disabling all manual map interactions (`scrollWheelZoom: false`, `dragging: false`, etc.) also blocked programmatic zoom methods

**Final solution:** Used `map.setView(center, zoom, {animate: true})` which bypasses the interaction locks
- Gets current center and zoom level
- Increments/decrements zoom by 1
- Applies with animation enabled
- Added comprehensive error handling and logging

**Code location:** `js/app.js` lines 473-514

#### Challenge 2: Map legend z-index conflicts

**Problem:** Map legend appearing in front of modal on mobile, making modal unusable

**Solution:** Adjusted z-index hierarchy:
- Modal overlay: z-40
- Style toggler: z-50
- Navigation controls: z-50
- Map legend: z-30 (behind modal, above map)

This ensures modal is always accessible while keeping legend visible during normal use.

**Code location:** `index.html` line 264

#### Challenge 3: Modal not disabling during navigation

**Problem:** Users couldn't navigate through grantees while modal was open

**Solution:** Modified `nextMarker()` and `prevMarker()` functions to check modal state:
- If modal is closed: Navigate, wait 2 seconds, then open modal
- If modal is open: Navigate and immediately update modal content
- Uses `overlay.classList.contains('hidden')` to detect state

This creates seamless browsing experience through all grantees.

**Code location:** `js/app.js` lines 289-331

### Updated color scheme

**NJCIC brand colors (official):**
- Primary teal: #2dc8d2
- Accent orange: #f34213
- Dark teal: #183642

**Previous color scheme (removed):**
- Purple-blue gradient: #667eea
- Purple: #764ba2

All UI elements now consistently use official NJCIC colors throughout:
- Buttons and controls
- Cluster markers
- Statistics displays
- Modal elements
- Legend components

### File structure updates

**New files:**
- `scripts/consolidate-suffix-duplicates.js` - Business suffix consolidation
- `docs/CHANGELOG.md` - Detailed timestamped changelog

**Modified files:**
- `index.html` - Map legend, custom zoom buttons, mobile CSS, z-index fixes
- `js/app.js` - Zoom functions, modal state handling, event listeners
- `data/grantees.json` - Consolidated HopeLoft entries

**Scripts available:**
- `npm run process-csv` - Process CSV to JSON with geocoding
- `node scripts/consolidate-suffix-duplicates.js` - Consolidate business name variations
- `node scripts/smart-consolidate.js` - Consolidate projects under parent orgs
- `node scripts/clean-descriptions.js` - Standardize description formatting

### Map interaction model

**Current behavior (intentional design):**
- Click-and-drag panning enabled for natural map exploration
- Pinch-to-zoom enabled on mobile devices
- Scroll wheel zoom disabled (prevents accidental zoom)
- Keyboard and box zoom disabled
- Navigation control buttons:
  - Zoom in/out buttons (bottom right)
  - Next/previous marker buttons for sequential browsing
  - Home button (reset to NJ view)
- Clicking markers opens info modal with full grantee details
- Hovering clusters auto-expands them (spiderfy) with cleanup on mouseout
- Prev/next buttons work seamlessly with modal open or closed

**Rationale:** Balanced approach allowing natural exploration while providing guided sequential navigation through grantees.

### Modal enhancements

**Multiple grant display:**
When organization has multiple grants (`hasMultipleGrants: true`):
- Shows combined statistics at top (total funding, years, grant count)
- Lists each grant separately with project name
- Displays individual grant details: amount, years, focus area, status
- Color-coded status badges (green for active, gray for completed)

**Single grant display:**
Simpler layout for organizations with one grant:
- Description text
- Funding amount
- Years
- Focus area
- Status badge
- Website link (if available)

**Code location:** `js/app.js` lines 347-458

### Performance considerations

- Marker clustering handles 73+ markers efficiently
- Cluster hover expansion (spiderfy) is instant
- Zoom animations smooth at 0.5 second duration
- Pan animations smooth at 2.0 second duration with easing
- No performance issues on mobile devices
- Modal transitions at 0.3 seconds feel responsive

### Browser compatibility

Tested and working on:
- Chrome/Edge (Chromium)
- Modern versions with ES6 support required
- Mobile browsers (iOS Safari, Chrome Mobile)

### Known limitations

1. No search functionality yet (potential future enhancement)
2. Legend not collapsible on mobile (could save space)
3. No export/share functionality
4. No print-friendly view
5. Manual interactions completely disabled (by design)

### Development workflow

**Making changes:**
1. Edit HTML/CSS/JS files directly
2. Refresh browser to see changes (no build step)
3. Check console for any errors
4. Test on mobile using browser dev tools

**Adding new grantees:**
1. Update CSV file with new data
2. Run `npm run process-csv` to regenerate JSON
3. Run consolidation scripts if needed
4. Verify coordinates are accurate
5. Test filters and navigation

**Debugging zoom issues:**
- Console logs added to zoom functions
- Check "Zoom in/out clicked" messages
- Verify map object exists
- Confirm zoom level changes in console

### Next session recommendations

Potential improvements to consider:
1. Add search/filter by organization name
2. Make legend collapsible on mobile
3. Add ability to share specific grantee (URL parameters)
4. Create print-friendly view
5. Add data export functionality (CSV/JSON download)
6. Consider timeline visualization by year
7. Add accessibility improvements (ARIA labels, keyboard navigation)
8. Implement lazy loading for large datasets
9. Add animations when clusters expand/collapse
10. Consider adding map attribution more prominently

## Recent updates (2025-11-06 continued)

### UI improvements and simplification

**Map style switcher removed:**
- Removed style toggler button from bottom navigation
- Simplified to single CARTO Voyager tile layer
- Removed all style cycling code (`mapStyles` object, `toggleMapStyle()` function)
- Rationale: Single consistent map style is cleaner and less confusing

**Status filter clarification:**
- Added explanatory text showing "(2024+)" for active grants
- Added "(grant period ended)" for completed grants
- Makes temporal meaning of status immediately clear to users

**Location data corrections:**
- Fixed Healthy NewsWorks: Changed from "Philadelphia border" to Camden (39.9259, -75.1196)
- Fixed Muslim: Changed from statewide center to Newark (40.7357, -74.1724)
- Both organizations now show in correct geographic locations

**Map legend repositioned:**
- Moved from overlay inside map to standalone section below map instructions
- No toggle button needed anymore
- Clean 3-column layout showing markers, clusters, and status
- Better visibility without z-index conflicts
- No longer obstructs modal on mobile devices

**Navigation improvements:**
- Enabled click-and-drag panning for natural exploration
- Enabled pinch-to-zoom on mobile
- Removed non-functional pan controls (up/down/left/right arrows)
- More intuitive user experience

**Content additions:**
- Added NJCIC logo in header (responsive sizing)
- Added comprehensive about section with mission and goals
- Added blue info box above map explaining how to use it
- Better context and information architecture

### Bug fixes

**Cluster spiderfy issues resolved:**
- Initial problem: Spiderfy lines not disappearing on mouseout
- Added `currentlySpiderfied` tracking variable
- Added cleanup on zoom and drag start events
- Added 100ms delay on mouseout to prevent flicker
- Second issue: Event listeners breaking after style switcher removal
- Root cause: Error from missing button preventing initialization
- Fix: Removed all style switcher code including event listener
- Spiderfy now works reliably with proper cleanup

**Code location:** `js/app.js` lines 79-117

### Current page structure

**Header section:**
- NJCIC logo (left) + page title (right)
- About NJCIC text block with mission and goals

**Map instructions section:**
- Blue info box explaining map usage
- Filtering options
- Navigation controls explanation

**Map section:**
- Interactive Leaflet map (70vh mobile, 85vh desktop)
- Custom markers with organization initials
- Cluster groups that expand on hover
- Bottom right navigation: prev/next, home, zoom in/out

**Map legend section (below map):**
- Three columns: single markers, cluster types, status indicators
- Example marker with initials
- Small/medium/large cluster examples with colors
- Active (green) and completed (gray) status badges

**Statistics section:**
- Total grantees count
- Total funding amount
- Active projects count

**Filters section:**
- Year dropdown (2021-2025)
- County dropdown (all NJ counties + regional)
- Focus area dropdown (grant categories)
- Status dropdown with explanatory labels
- Reset button

### Files modified in latest session

- `index.html` - Removed style toggler, added logo/about/instructions, repositioned legend
- `js/app.js` - Removed `toggleMapStyle()`, removed style-toggler listener, enabled dragging
- `scripts/improved-geocoding.js` - Updated Healthy NewsWorks and Muslim coordinates
- `data/grantees.json` - Regenerated with corrected locations
- `docs/CHANGELOG.md` - Added comprehensive entry for latest changes
- `CLAUDE.md` - Updated with all current information (this file)
