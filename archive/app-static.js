// Global variables
let map;
let markersCluster;
let allGrantees = [];
let filteredGrantees = [];
let visibleMarkers = [];
let currentMarkerIndex = 0;

// Map styles
const mapStyles = {
    'Watercolor': L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=b2b73bc5-4c46-48b1-9d1d-494d7f803143', {
        attribution: '&copy; Stamen Design & Stadia Maps'
    }),
    'Toner': L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png?api_key=b2b73bc5-4c46-48b1-9d1d-494d7f803143', {
        attribution: '&copy; Stamen Design & Stadia Maps'
    }),
    'Voyager': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }),
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    })
};

let currentStyleIndex = 2; // Start with Voyager (CARTO) style
const styleKeys = Object.keys(mapStyles);

// Initialize the application
async function init() {
    try {
        // Load grantee data
        const response = await fetch('data/grantees.json');
        const data = await response.json();
        allGrantees = data.grantees;
        filteredGrantees = [...allGrantees];

        // Initialize map
        initMap();

        // Populate filters
        populateCountyFilter();
        populateFocusAreaFilter();

        // Add markers
        updateMarkers();

        // Update stats
        updateStats();

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading grantee data. Please check the console for details.');
    }
}

// Initialize the Leaflet map
function initMap() {
    // Center on New Jersey with all interactions disabled for static map
    map = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false
    }).setView([40.0583, -74.4057], 8);

    // Add initial tile layer
    mapStyles[styleKeys[currentStyleIndex]].addTo(map);

    // Initialize marker cluster group
    markersCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        maxClusterRadius: 50
    });

    map.addLayer(markersCluster);
}

// Populate county filter dropdown
function populateCountyFilter() {
    const counties = new Set();
    allGrantees.forEach(grantee => {
        if (grantee.county && grantee.county !== 'Statewide' && grantee.county !== 'South Jersey' && grantee.county !== 'North Jersey' && grantee.county !== 'Central Jersey') {
            counties.add(grantee.county);
        }
    });

    const countyFilter = document.getElementById('county-filter');
    const sortedCounties = Array.from(counties).sort();

    sortedCounties.forEach(county => {
        const option = document.createElement('option');
        option.value = county;
        option.textContent = county;
        countyFilter.appendChild(option);
    });

    // Add special categories
    ['Statewide', 'North Jersey', 'Central Jersey', 'South Jersey'].forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        countyFilter.appendChild(option);
    });
}

// Populate focus area filter dropdown
function populateFocusAreaFilter() {
    const focusAreas = new Set();
    allGrantees.forEach(grantee => {
        if (grantee.focusArea) {
            focusAreas.add(grantee.focusArea);
        }
    });

    const focusFilter = document.getElementById('focus-filter');
    const sortedAreas = Array.from(focusAreas).sort();

    sortedAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        focusFilter.appendChild(option);
    });
}

// Create marker icon with initials
function createCustomIcon(grantee) {
    const initials = grantee.name.split(' ')
        .map(word => word[0])
        .filter(letter => letter.match(/[A-Z]/))
        .slice(0, 2)
        .join('');

    const iconHtml = `<div class="custom-marker">${initials}</div>`;

    return L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

// Create tooltip content
function createTooltipContent(grantee) {
    return `
        <div class="tooltip-title">${grantee.name}</div>
        <div class="tooltip-info">${grantee.county}</div>
        <div class="tooltip-info">$${grantee.amount.toLocaleString()}</div>
    `;
}

// Update markers on the map
function updateMarkers() {
    // Clear existing markers
    markersCluster.clearLayers();
    visibleMarkers = [];

    // Add markers for filtered grantees
    filteredGrantees.forEach(grantee => {
        const customIcon = createCustomIcon(grantee);
        const marker = L.marker([grantee.lat, grantee.lng], {
            icon: customIcon,
            title: grantee.name
        });

        marker.bindTooltip(createTooltipContent(grantee), {
            className: 'custom-leaflet-tooltip',
            direction: 'right',
            offset: L.point(30, 0),
            permanent: false
        });

        // Tooltip auto-close behavior
        let tooltipTimeout;

        marker.on('mouseover', () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            marker.openTooltip();
        });

        marker.on('mouseout', () => {
            tooltipTimeout = setTimeout(() => {
                marker.closeTooltip();
            }, 3000);
        });

        marker.on('click', () => {
            openModal(grantee);
        });

        markersCluster.addLayer(marker);
        visibleMarkers.push({ marker, grantee });
    });

    currentMarkerIndex = 0;
}

// Update statistics
function updateStats() {
    const totalGrantees = filteredGrantees.length;
    const totalFunding = filteredGrantees.reduce((sum, g) => sum + g.amount, 0);
    const activeProjects = filteredGrantees.filter(g => g.status === 'active').length;

    document.getElementById('total-grantees').textContent = totalGrantees;
    document.getElementById('total-funding').textContent = `$${totalFunding.toLocaleString()}`;
    document.getElementById('active-projects').textContent = activeProjects;
}

// Apply filters
function applyFilters() {
    const yearFilter = document.getElementById('year-filter').value;
    const countyFilter = document.getElementById('county-filter').value;
    const focusFilter = document.getElementById('focus-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    filteredGrantees = allGrantees.filter(grantee => {
        if (yearFilter !== 'all' && !grantee.years.includes(yearFilter)) return false;
        if (countyFilter !== 'all' && grantee.county !== countyFilter) return false;
        if (focusFilter !== 'all' && grantee.focusArea !== focusFilter) return false;
        if (statusFilter !== 'all' && grantee.status !== statusFilter) return false;
        return true;
    });

    updateMarkers();
    updateStats();

    // Note: Static map doesn't auto-zoom to filtered results
}

// Reset filters
function resetFilters() {
    document.getElementById('year-filter').value = 'all';
    document.getElementById('county-filter').value = 'all';
    document.getElementById('focus-filter').value = 'all';
    document.getElementById('status-filter').value = 'all';

    filteredGrantees = [...allGrantees];
    updateMarkers();
    updateStats();

    // Note: Map view stays static, no zoom/pan on reset
}

// Note: Navigation functions removed for static map
// Markers can still be clicked to open modals, but map view doesn't change

// Open modal with grantee details
function openModal(grantee) {
    const yearsText = grantee.years.join(', ');
    const statusClass = grantee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const statusText = grantee.status.charAt(0).toUpperCase() + grantee.status.slice(1);

    document.getElementById('modal-title').textContent = grantee.name;
    document.getElementById('modal-location').textContent = grantee.city ? `${grantee.city}, ${grantee.county}` : grantee.county;
    document.getElementById('modal-description').textContent = grantee.description;

    const detailsHtml = `
        <div class="flex items-center justify-between py-2 border-b border-gray-200">
            <span class="text-sm font-medium text-gray-600">Funding:</span>
            <span class="text-sm font-semibold" style="color: #2dc8d2;">$${grantee.amount.toLocaleString()}</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-200">
            <span class="text-sm font-medium text-gray-600">Years:</span>
            <span class="text-sm font-semibold text-gray-800">${yearsText}</span>
        </div>
        ${grantee.focusArea ? `
        <div class="flex items-center justify-between py-2 border-b border-gray-200">
            <span class="text-sm font-medium text-gray-600">Focus area:</span>
            <span class="text-sm text-gray-800">${grantee.focusArea}</span>
        </div>
        ` : ''}
        <div class="flex items-center justify-between py-2">
            <span class="text-sm font-medium text-gray-600">Status:</span>
            <span class="text-xs font-semibold px-3 py-1 rounded-full ${statusClass}">${statusText}</span>
        </div>
    `;

    document.getElementById('modal-details').innerHTML = detailsHtml;

    const modalLink = document.getElementById('modal-link');
    if (grantee.website) {
        const url = grantee.website.startsWith('http') ? grantee.website : 'https://' + grantee.website;
        modalLink.href = url;
        modalLink.style.display = 'inline-block';
    } else {
        modalLink.style.display = 'none';
    }

    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    setTimeout(() => {
        overlay.style.opacity = '1';
        content.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

// Close modal
function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    overlay.style.opacity = '0';
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }, 300);
}

// Make closeModal available globally
window.closeModal = closeModal;

// Setup event listeners
function setupEventListeners() {
    document.getElementById('year-filter').addEventListener('change', applyFilters);
    document.getElementById('county-filter').addEventListener('change', applyFilters);
    document.getElementById('focus-filter').addEventListener('change', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    // Note: Navigation controls removed for static version
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
