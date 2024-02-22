document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([46.8182, 8.2275], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    fetch('https://raw.githubusercontent.com/trobim/locator/main/data/schools.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data).addTo(map);
        })
        .catch(error => console.log('Error:', error));
});
