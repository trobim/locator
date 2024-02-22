const map = L.map('mapid').setView([46.8182, 8.2275], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let heatmapLayer;

const loadHeatmap = (filter = '') => {
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            const points = data.features
                .filter(feature => filter === '' || feature.properties.amenity === filter)
                .map(feature => [feature.geometry.coordinates[1], feature.geometry.coordinates[0], 1]); // lat, lng, intensity
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
            }
            heatmapLayer = L.heatLayer(points, {radius: 25}).addTo(map);
        });
};

const populateFilterOptions = () => {
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            const amenities = [...new Set(data.features.map(feature => feature.properties.amenity))];
            const select = document.getElementById('amenity-filter');
            amenities.forEach(amenity => {
                const option = document.createElement('option');
                option.value = amenity;
                option.textContent = amenity;
                select.appendChild(option);
            });
        });
};

document.getElementById('amenity-filter').addEventListener('change', (event) => {
    loadHeatmap(event.target.value);
});

// Initialize
loadHeatmap();
populateFilterOptions();
