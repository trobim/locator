document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('mapid').setView([46.8182, 8.2275], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    let geojsonData; // To store fetched GeoJSON data

    // Fetch and store GeoJSON data, then initialize the map and filters
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            geojsonData = data;
            populateFilterOptions(data);
            // Initialize with default values
            const initialRadius = document.getElementById('radius-slider').value;
            applyFilters(initialRadius);
        });

    function populateFilterOptions(data) {
        const amenities = [...new Set(data.features.map(feature => feature.properties.amenity))];
        const container = document.querySelector('.filter-container');
        amenities.forEach(amenity => {
            const wrapper = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = amenity;
            checkbox.id = `filter-${amenity}`;
            checkbox.checked = true;
            const label = document.createElement('label');
            label.htmlFor = `filter-${amenity}`;
            label.textContent = amenity;
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);

            checkbox.addEventListener('change', () => {
                const radius = document.getElementById('radius-slider').value;
                applyFilters(radius);
            });
        });
    }

    function applyFilters(radius) {
        const selectedAmenities = [...document.querySelectorAll('.filter-container input:checked')].map(input => input.value);
        const filteredData = {
            ...geojsonData,
            features: geojsonData.features.filter(feature => selectedAmenities.includes(feature.properties.amenity))
        };
        updateMap(filteredData, radius);
    }

    function updateMap(data, radius) {
        // Clear existing layers
        map.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) {
                map.removeLayer(layer);
            }
        });

        // Adjust clustering logic to use the provided radius
        const points = turf.featureCollection(data.features);
        const options = {units: 'meters', minPoints: 2};
        const clustered = turf.clustersDbscan(points, parseInt(radius, 10), options);

        // Draw clusters
        clustered.features.forEach(feature => {
            if (feature.properties.dbscan === "core") {
                const clusterId = feature.properties.cluster;
                const clusterPoints = clustered.features.filter(f => f.properties.cluster === clusterId);
                const hull = turf.convex(turf.featureCollection(clusterPoints));

                if (hull) {
                    L.polygon(hull.geometry.coordinates[0].map(coord => [coord[1], coord[0]]), {
                        color: 'red',
                        weight: 2,
                        fillColor: '#f03',
                        fillOpacity: 0.5
                    }).addTo(map);
                }
            }
        });
    }

    // Listen to radius slider changes
    document.getElementById('radius-slider').addEventListener('input', function() {
        const radius = this.value;
        document.getElementById('radius-value').textContent = radius / 1000; // Convert to km for display
        applyFilters(radius); // Re-apply filters using the new radius for clustering
    });
});
