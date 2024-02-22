document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('mapid').setView([46.8182, 8.2275], 8); // Example center: Switzerland
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    let geojsonData; // To store GeoJSON data

    // Fetch GeoJSON data
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            geojsonData = data;
            updateClusters(1000); // Initialize with 1 km radius
        });

    // Slider event listener
    document.getElementById('radius-slider').addEventListener('input', function() {
        const radius = parseInt(this.value, 10);
        document.getElementById('radius-value').textContent = radius / 1000; // Convert to km
        updateClusters(radius);
    });

    function updateClusters(radius) {
        // Clear existing layers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polygon) {
                map.removeLayer(layer);
            }
        });

        // Filter for colleges and schools
        const educationFeatures = geojsonData.features.filter(feature =>
            feature.properties.amenity === 'college' || feature.properties.amenity === 'school');

        // Convert to a FeatureCollection
        const educationCollection = turf.featureCollection(educationFeatures);

        // Cluster the features
        const clusters = turf.clusterDbscan(educationCollection, radius / 1000, {units: 'kilometers'});

        // Find universities
        const universities = geojsonData.features.filter(feature => feature.properties.amenity === 'university');

        clusters.features.forEach(cluster => {
            if (cluster.properties.dbscan === 'core') {
                const clusterPoint = turf.center(cluster);
                const nearestUniversity = turf.nearestPoint(clusterPoint, turf.featureCollection(universities));
                const distance = turf.distance(clusterPoint, nearestUniversity, {units: 'kilometers'}).toFixed(2);

                // Draw cluster
                L.marker(turf.getCoord(clusterPoint)).addTo(map)
                  .bindPopup(`Cluster center<br>Nearest university: ${distance} km`);

                // Draw polygon if the cluster has a valid area
                if (cluster.geometry.coordinates.length > 2) {
                    L.polygon(turf.getCoords(turf.convex(cluster))).addTo(map);
                }
            }
        });
    }
});
