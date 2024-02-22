// Initialize the map
var map = L.map('map').setView([46.8182, 8.2275], 8); // Coordinates for Switzerland

// Add a base layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Load the GeoJSON data
fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
    .then(function(response) { return response.json(); })
    .then(function(data) {
        var markers = L.markerClusterGroup();
        
        // Function to filter amenities
        function filterAmenities(feature) {
            return feature.properties.amenity === 'college' || feature.properties.amenity === 'school';
        }

        L.geoJSON(data, {
            filter: filterAmenities,
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(feature.properties.name);
                }
            },
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng);
            }
        }).addTo(markers);

        map.addLayer(markers);
    });
