const map = L.map('mapid').setView([46.8182, 8.2275], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let markersCluster;

const loadMarkers = (filters = []) => {
    if (markersCluster) {
        map.removeLayer(markersCluster); // Remove existing cluster group if any
    }
    markersCluster = L.markerClusterGroup();

    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                if (filters.length === 0 || filters.includes(feature.properties.amenity)) {
                    const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                    const marker = L.marker(latlng);
                    markersCluster.addLayer(marker);
                }
            });
            map.addLayer(markersCluster);
        });
};

const populateFilterOptions = () => {
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            const amenities = [...new Set(data.features.map(feature => feature.properties.amenity))];
            const container = document.getElementById('amenity-filter');
            amenities.forEach(amenity => {
                const wrapper = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = amenity;
                checkbox.id = `filter-${amenity}`;
                checkbox.name = 'amenity';
                const label = document.createElement('label');
                label.htmlFor = `filter-${amenity}`;
                label.textContent = amenity;
                wrapper.appendChild(checkbox);
                wrapper.appendChild(label);
                container.appendChild(wrapper);

                checkbox.addEventListener('change', handleFilterChange);
            });
        });
};

const handleFilterChange = () => {
    const selectedFilters = [...document.querySelectorAll('[name="amenity"]:checked')].map(input => input.value);
    loadMarkers(selectedFilters);
};

// Initialize
populateFilterOptions();
loadMarkers(); // Load all markers initially
