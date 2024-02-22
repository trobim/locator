const map = L.map('mapid').setView([46.8182, 8.2275], 7); // Center on Switzerland for the demo

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// Generate some random points for demonstration purposes
const points = turf.randomPoint(100, {bbox: [5.9559111595, 45.8180243, 10.4920501709, 47.8083802]}); // Bounding box around Switzerland

// Use Turf to cluster the points
const clustered = turf.clustersDbscan(points, 15000, {units: 'meters'});

// Calculate and draw the convex hull for each cluster
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
