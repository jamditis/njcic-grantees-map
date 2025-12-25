---
name: leaflet-map
description: Leaflet.js patterns for the NJCIC interactive grantee map
---

# Leaflet Map Skill

## When to Activate

Use when:
- Modifying map behavior in app.js
- Adding/changing filters or popups
- Adjusting marker clustering or icons
- Debugging map rendering issues
- Improving map performance or UX

## Architecture

```javascript
// Global state (app.js)
let map;                    // Leaflet map instance
let markersCluster;         // L.markerClusterGroup
let allGrantees = [];       // Source of truth from grantees.json
let filteredGrantees = [];  // After filter application
let visibleMarkers = [];    // Currently rendered markers
let currentMarkerIndex = 0; // Navigation position
```

**Flow**: `init() → initMap() → updateMarkers() → setupEventListeners()`

## Map Configuration

```javascript
// New Jersey bounds
const NJ_BOUNDS = L.latLngBounds(
    L.latLng(38.9, -75.6),  // Southwest
    L.latLng(41.4, -73.9)   // Northeast
);

// Map initialization
map = L.map('map', {
    center: [40.0583, -74.4057],  // NJ center
    zoom: 8,
    maxBounds: NJ_BOUNDS.pad(0.1),
    minZoom: 7,
    maxZoom: 18
});

// CARTO Voyager basemap (clean, modern style)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);
```

## Marker Clustering

```javascript
markersCluster = L.markerClusterGroup({
    disableClusteringAtZoom: 15,  // Show individual markers at zoom 15+
    animate: true,
    spiderfyDistanceMultiplier: 1.5,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 50
});

// Auto-expand on hover (desktop UX enhancement)
markersCluster.on('clustermouseover', function(e) {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
        if (map.getZoom() < 12) {
            e.layer.spiderfy();
        }
    }, 1000);
});
```

## Custom Icons

```javascript
function createCustomIcon(grantee) {
    // Extract initials from org name
    const words = grantee.name.split(' ')
        .filter(w => w.trim().length > 0);

    let initials;
    if (words.length >= 2) {
        // "News Voices" → "NV"
        initials = words.slice(0, 2)
            .map(w => {
                const firstLetter = w.match(/[A-Za-z]/);
                return firstLetter ? firstLetter[0].toUpperCase() : '';
            })
            .join('');
    }

    // Fallback for edge cases
    if (!initials) {
        initials = grantee.name.replace(/[^A-Za-z0-9]/g, '')
            .substring(0, 2).toUpperCase() || '??';
    }

    // New org badge (orange marker + "NEW" label)
    const isNew = grantee.isNew;
    const bgColor = isNew ? '#E85021' : '#2EB5C0';

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-icon" style="background:${bgColor}">
            ${initials}
            ${isNew ? '<span class="new-badge">NEW</span>' : ''}
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
}
```

## Filter System

```javascript
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter').value;
    const countyFilter = document.getElementById('countyFilter').value;
    const focusFilter = document.getElementById('focusFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredGrantees = allGrantees.filter(grantee => {
        // Year filter: check if any grant year matches
        if (yearFilter !== 'all') {
            const years = grantee.years ||
                (grantee.grants?.flatMap(g => g.years) || []);
            if (!years.includes(yearFilter)) return false;
        }

        // County filter: exact match
        if (countyFilter !== 'all' && grantee.county !== countyFilter) {
            return false;
        }

        // Focus area filter
        if (focusFilter !== 'all') {
            const focusAreas = grantee.focusArea ||
                (grantee.grants?.map(g => g.focusArea) || []);
            if (!focusAreas.includes(focusFilter)) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && grantee.status !== statusFilter) {
            return false;
        }

        return true;
    });

    updateMarkers();
    updateStats();
}
```

## Modal System

```javascript
function openModal(grantee) {
    currentGlobalGrantee = grantee;  // For share buttons

    const modal = document.getElementById('granteeModal');
    const content = document.getElementById('modalContent');

    // Handle multi-grant organizations
    if (grantee.hasMultipleGrants) {
        content.innerHTML = `
            <h2>${grantee.name}</h2>
            <p class="grant-summary">${grantee.grantCount} grants totaling
               ${formatCurrency(grantee.totalAmount)}</p>
            <div class="grants-list">
                ${grantee.grants.map(g => `
                    <details>
                        <summary>${g.years.join(', ')} - ${formatCurrency(g.amount)}</summary>
                        <p>${g.description}</p>
                        <span class="focus-badge">${g.focusArea}</span>
                    </details>
                `).join('')}
            </div>
        `;
    } else {
        content.innerHTML = `
            <h2>${grantee.name}</h2>
            <p>${grantee.description}</p>
            <div class="meta">
                <span>${grantee.years.join(', ')}</span>
                <span>${formatCurrency(grantee.amount)}</span>
                <span class="focus-badge">${grantee.focusArea}</span>
            </div>
        `;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}
```

## Keyboard Navigation

```javascript
function handleKeyboardNavigation(e) {
    // Skip if user is typing in form fields
    if (e.target.matches('input, select, textarea')) return;

    switch (e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            prevMarker();
            break;
        case 'ArrowRight':
            nextMarker();
            break;
        case 'Home':
            map.setView([40.0583, -74.4057], 8);
            break;
        case '+':
        case '=':
            map.zoomIn();
            break;
        case '-':
            map.zoomOut();
            break;
    }
}
```

## Performance Patterns

### Cache-busting for fresh data
```javascript
const cacheBust = new Date().getTime();
const response = await fetch(`data/grantees.json?v=${cacheBust}`);
```

### Efficient marker updates
```javascript
function updateMarkers() {
    // Clear existing
    markersCluster.clearLayers();
    visibleMarkers = [];

    // Batch add (more efficient than individual adds)
    const markers = filteredGrantees.map(grantee => {
        const marker = L.marker([grantee.lat, grantee.lng], {
            icon: createCustomIcon(grantee)
        });
        marker.granteeData = grantee;  // Store reference
        marker.on('click', () => openModal(grantee));
        return marker;
    });

    markersCluster.addLayers(markers);
    visibleMarkers = markers;
}
```

## Common Issues

### "Markers not appearing"
1. Check console for fetch errors
2. Verify grantees.json has valid lat/lng
3. Check map bounds include coordinates
4. Inspect markersCluster.getLayers()

### "Filter not working"
1. Verify filter element IDs match
2. Check grantee data has expected field values
3. Add console.log in applyFilters() to trace

### "Popup content wrong"
1. Multi-grant orgs need special handling
2. Check grantee.hasMultipleGrants flag
3. Verify grantee.grants array exists

## Key Files

- `js/app.js:1` - All map logic (910 LOC)
- `index.html:1` - Map container and filter elements
- `index.html:100` - CSS for .custom-marker, .marker-icon

---
*Last updated: December 2025 | Applies to: js/app.js*
