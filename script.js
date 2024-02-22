var map = L.map('map').setView([46.8182, 8.2275], 8); // Centered on Switzerland

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(map);

var heatmapLayer;

// Function to load GeoJSON data and show it on the map as a heatmap
function loadGeoJSON(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            var heatMapData = data.features.map(feature => {
                // Check if coordinates array is not empty and has the expected structure
                if (feature.geometry.coordinates.length >= 2) {
                    // Convert GeoJSON coordinates to heatmap format [lat, lng, intensity]
                    // Intensity is set to 1, but you can adjust this based on your data
                    return [feature.geometry.coordinates[1], feature.geometry.coordinates[0], 1];
                }
                return null; // Exclude items with unexpected or missing coordinates
            }).filter(item => item !== null); // Remove null items resulting from the previous step
            
            // Remove the previous heatmap layer if it exists
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
            }

            // Add the new heatmap layer
            heatmapLayer = L.heatLayer(heatMapData, {radius: 25}).addTo(map);
        });
}

// Load and display the GeoJSON data as a heatmap
loadGeoJSON('https://raw.githubusercontent.com/trobim/geojson/main/schools.geojson');

