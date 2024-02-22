document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('mapid').setView([46.8182, 8.2275], 8); // Adjust center as needed
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    const geojsonDataUrl = 'https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson';

    // Fetch GeoJSON data with error handling
    fetch(geojsonDataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("GeoJSON data successfully fetched:", data); // Debugging log
            processGeoJson(data, 4000); // Initialize with 4 km radius
        })
        .catch(error => console.error("Error fetching GeoJSON data:", error));

    document.getElementById('radius-slider').addEventListener('input', function() {
        const radius = parseInt(this.value, 10);
        document.getElementById('radius-value').textContent = (radius / 1000).toFixed(1); // Convert to km
        console.log("Slider adjusted, new radius:", radius, "meters"); // Debugging log

        fetch(geojsonDataUrl)
            .then(response => response.json())
            .then(data => {
                processGeoJson(data, radius);
            })
            .catch(error => console.error("Error re-fetching GeoJSON data on slider adjustment:", error));
    });

    function processGeoJson(geojsonData, radius) {
        // Clear existing map layers except for the base tile layer
        map.eachLayer(layer => {
            if (!(layer instanceof L.TileLayer)) {
                map.removeLayer(layer);
            }
        });

        const educationFeatures = geojsonData.features.filter(feature =>
            feature.properties.amenity === 'college' || feature.properties.amenity === 'school');
        const universityFeatures = geojsonData.features.filter(feature =>
            feature.properties.amenity === 'university');

        console.log("Filtered education features:", educationFeatures.length); // Debugging log
        console.log("Filtered university features:", universityFeatures.length); // Debugging log

        if (educationFeatures.length === 0) {
            console.log("No education features to cluster.");
            return;
        }

        const educationCollection = turf.featureCollection(educationFeatures);
        const universityCollection = turf.featureCollection(universityFeatures);

        const clustered = turf.clustersDbscan(educationCollection, radius / 1000, {units: 'kilometers'});

        clustered.features.forEach(cluster => {
            if (cluster.properties.cluster !== undefined) {
                const clusterPoints = clustered.features.filter(f => f.properties.cluster === cluster.properties.cluster);
                if (clusterPoints.length < 2) {
                    console.log("Skipping cluster with fewer than 2 points, insufficient for a polygon.");
                    return;
                }

                const clusterFeature = turf.featureCollection(clusterPoints);
                const hull = turf.convex(clusterFeature);
                if (hull) {
                    const nearestUniversity = turf.nearestPoint(turf.center(hull), universityCollection);
                    const distance = turf.distance(turf.center(hull), nearestUniversity, {units: 'kilometers'}).toFixed(2);
                    L.polygon(hull.geometry.coordinates[0], {
                        color: 'blue',
                        weight: 2,
                        fillColor: '#f03',
                        fillOpacity: 0.5
                    }).addTo(map).bindPopup(`Nearest University Distance: ${distance} km`);
                }
            }
        });
    }
});
