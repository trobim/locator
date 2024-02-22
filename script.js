const map = L.map('mapid').setView([46.8182, 8.2275], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let heatmapLayer;

const loadHeatmap = (filters = []) => {
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            const points = data.features
                .filter(feature => filters.length === 0 || filters.includes(feature.properties.amenity))
                .map(feature => [feature.geometry.coordinates[1], feature.geometry.coordinates[0], 1]); // lat, lng, intensity
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
            }
            heatmapLayer = L.heatLayer(points, {
                radius: 25,
                blur: 15,
                gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red'}
            }).addTo(map);
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
    loadHeatmap(selectedFilters);
};

// Initialize
loadHeatmap();
populateFilterOptions();
