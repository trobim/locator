document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('mapid').setView([46.8182, 8.2275], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    let geojsonData; // To store fetched GeoJSON data
    const maxAreaSize = 1000000; // Maximum area size in square meters (e.g., 1 km²)

    // Fetch and store GeoJSON data, then initialize the map and filters
    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            geojsonData = data;
            populateFilterOptions(data);
            updateMap(data); // Initial map update with all data
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
            checkbox.checked = true; // Start with all checked
            const label = document.createElement('label');
            label.htmlFor = `filter-${amenity}`;
            label.textContent = amenity;
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);

            checkbox.addEventListener('change', applyFilters);
        });
    }

    function applyFilters() {
        const selectedAmenities = [...document.querySelectorAll('.filter-container input:checked')].map(input => input.value);
        const filteredData = {
            ...geojsonData,
            features: geojsonData.features.filter(feature => selectedAmenities.includes(feature.properties.amenity))
        };
        updateMap(filteredData);
    }

    function updateMap(data) {
        // Clear existing layers
        map.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) {
                map.removeLayer(layer);
            }
        });

        const points = turf.featureCollection(data.features);
        const clustered = turf.clustersDbscan(points, 15000, {units: 'meters'});

        clustered.features.forEach(feature => {
            if (feature.properties.dbscan === "core") {
                const clusterId = feature.properties.cluster;
                const clusterPoints = clustered.features.filter(f => f.properties.cluster === clusterId);
                const hull = turf.convex(turf.featureCollection(clusterPoints));

                if (hull) {
                    const area = turf.area(hull);
                    if (area <= maxAreaSize) { // Check if the area is within the limit
                        L.polygon(hull.geometry.coordinates[0].map(coord => [coord[1], coord[0]]), {
                            color: 'red',
                            weight: 2,
                            fillColor: '#f03',
                            fillOpacity: 0.5
                        }).addTo(map);
                    }
                }
            }
        });
    }
});
