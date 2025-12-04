# NJCIC Map Changelog

## 2025-11-06 (continued) - UI refinements and feature removal

### Removed features

**Map style switcher (20:45 UTC)**
- Removed style toggler button from bottom navigation bar
- Simplified to single CARTO Voyager tile layer
- Removed `mapStyles` object and style cycling logic
- Removed `toggleMapStyle()` function
- Removed style-toggler event listener
- Rationale: Single clean map style is sufficient; toggle added unnecessary complexity

### Map interaction improvements

**Status descriptions clarification**
- Added explanatory text to status filter dropdown
- Active status now shows "(2024+)"
- Completed status now shows "(grant period ended)"
- Added helper text to map legend showing status meanings
- Makes grant timeline clearer for users

**Location data corrections**
- Changed Healthy NewsWorks from "Philadelphia border" to Camden coordinates (39.9259, -75.1196)
- Changed Muslim from statewide to Newark coordinates (40.7357, -74.1724)
- Ensures accurate geographic representation

**Map navigation enhancements**
- Enabled click-and-drag panning (dragging: true)
- Enabled pinch-to-zoom on mobile devices (touchZoom: true)
- Removed pan control buttons (up/down/left/right) that were not working
- More intuitive natural map interaction

**Map legend reorganization**
- Moved legend from overlay inside map to standalone section below map
- Removed toggle button (no longer needed)
- Clean 3-column layout: single markers, clusters, status indicators
- Better visibility and no z-index conflicts with modals

**NJCIC branding additions**
- Added NJCIC logo in header (300x150px, responsive sizing)
- Added comprehensive about section with mission and goals below map
- Added blue info box above map with usage instructions
- Improved overall information architecture

### Bug fixes

**Cluster spiderfy cleanup (multiple iterations)**
- Initial issue: Hover-to-expand cluster lines not disappearing on mouseout
- First attempt: Removed hover behavior entirely
- User feedback: Wanted hover behavior back without glitches
- Final solution: Added `currentlySpiderfied` tracking variable
- Added cleanup on zoomstart and dragstart events
- Added 100ms timeout on mouseout to prevent flicker
- Second issue after style switcher removal: Event listeners not initializing
- Root cause: Error from missing style-toggler button breaking setupEventListeners()
- Final fix: Removed all style switcher code preventing initialization errors

### Files modified

- `index.html` - Removed style toggler button, added logo, about text, map instructions
- `js/app.js` - Removed toggleMapStyle function, removed style-toggler listener, enabled dragging
- `scripts/improved-geocoding.js` - Updated Healthy NewsWorks and Muslim coordinates
- `data/grantees.json` - Regenerated with corrected coordinates

### Current map features

**Navigation controls:**
- Custom zoom in/out buttons (bottom right)
- Next/previous marker buttons for sequential browsing
- Home button to reset to NJ overview
- All controls use NJCIC brand colors

**Filtering system:**
- Year filter (2021-2025)
- County filter (all 21 NJ counties plus regional categories)
- Focus area filter (all grant categories)
- Status filter (active 2024+, completed pre-2024)
- Reset button to clear all filters

**Map interactions:**
- Click and drag to pan
- Pinch or button controls to zoom
- Click markers to view details modal
- Hover clusters to auto-expand (spiderfy)
- Sequential navigation through all grantees

**Data display:**
- 73 unique organizations
- 19 organizations with multiple grants
- Grant details with project names
- Status badges (green for active, gray for completed)
- Website links when available
- Combined statistics for multi-grant organizations

## 2025-11-06 - Major UI/UX improvements and data consolidation

### Added features

**Map legend (19:30 UTC)**
- Added comprehensive map key in top right corner showing:
  - Single grantee marker example with initials
  - Cluster types (small, medium, large) with color coding
  - Status indicators (active/completed)
  - "Hover to expand" instruction for clusters
- Legend uses NJCIC brand colors (#2dc8d2, #f34213, #183642)
- Responsive design with smaller size on mobile devices
- Legend positioned at z-30 to appear behind modal (z-40) when open

**Custom zoom controls (19:25 UTC)**
- Removed default Leaflet zoom control (top-left position)
- Added custom zoom in/out buttons to bottom navigation bar
- Zoom buttons integrated seamlessly with prev/next/home controls
- Buttons styled consistently with NJCIC design system
- Fixed zoom functionality using `map.setView()` with animation
- Added console logging for debugging zoom issues

**Mobile responsiveness (19:35 UTC)**
- Map height reduced from 85vh to 70vh on mobile
- Navigation buttons scaled down from 3rem to 2.5rem on mobile
- Legend compressed to 160px max-width on mobile with smaller text
- All controls properly positioned for touch interaction
- Style toggler button also resized for mobile

### Data consolidation

**Business suffix consolidation (19:42 UTC)**
- Created `scripts/consolidate-suffix-duplicates.js`
- Automatically removes business suffixes (Inc., LLC, Corp., etc.) for comparison
- Consolidated "Hopeloft" and "Hopeloft, Inc." into single entry
- Total: $264,690 over 2021-2025 with 2 grants
- Reduced from 74 to 73 unique organizations
- Uses canonical name without suffix for display
- Preserves all project-specific grant information

### Bug fixes

**Zoom button functionality (19:25-19:50 UTC)**
- Initial implementation with `map.zoomIn()` and `map.zoomOut()` didn't work
- Attempted `map.setZoom()` with explicit zoom levels - didn't work
- Attempted `map.flyTo()` with new zoom level - didn't work
- Root cause: Map interactions were completely disabled, blocking programmatic zoom
- Solution: Used `map.setView()` with current center and new zoom level
- Added try-catch error handling and console logging for debugging
- Final fix working successfully

**Map legend z-index (19:35 UTC)**
- Changed from z-50 to z-30 to appear behind modal overlay (z-40)
- Ensures legend doesn't block modal on mobile devices
- Maintains visibility during normal map interaction

### Technical improvements

**Code organization**
- Separated zoom functions from navigation functions
- Added comprehensive error handling for zoom operations
- Improved event listener setup in `setupEventListeners()`
- Better console logging for debugging

**CSS enhancements**
- Added mobile media queries for legend styling
- Optimized button sizes for touch targets
- Improved responsive breakpoints for small screens
- Better visual hierarchy with z-index management

### Files modified

- `index.html` - Added map legend, custom zoom buttons, mobile CSS
- `js/app.js` - Added zoom functions, updated event listeners, fixed zoom logic
- `data/grantees.json` - Consolidated HopeLoft entries (via script)
- `scripts/consolidate-suffix-duplicates.js` - New script created

### Statistics

- Organizations: 73 (down from 74)
- Organizations with multiple grants: 19
- Largest consolidation: HopeLoft (2 grants, $264,690)
- Total active projects: Varies by filter
- Total funding: $10,000,000+ across all grantees

### Known issues

None currently identified.

### Next steps

Potential future enhancements:
- Add collapsible legend for mobile to save screen space
- Consider adding search functionality for grantees
- Implement export/share functionality
- Add print-friendly view option
- Consider adding year-based timeline visualization
