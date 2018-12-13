var isMapInitialized = false;
var myMap;

// Function to initialize map
function mapCity(city) {

    console.log("map " + city.name);

    if (isMapInitialized === false) {
        myMap = L.map('my-map').setView([city.latitude, city.longitude], 10);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiZGprbml0IiwiYSI6ImNqbW5yMHhkazB3cDgzd3IycGhyYmIxYnUifQ.jkNXJCCslDL_zyRkU8lB6g'
        }).addTo(myMap);

        isMapInitialized = true;
    }
    else {
        myMap.setView([city.latitude, city.longitude], 10);
    }

    // Make new marker using city coordinates and with a title attribute of the city name and add it to the map
    var newMarker = L.marker([city.latitude, city.longitude], {title: city.name}).addTo(myMap);
}

// Function for removing map
function destroyMap() {
    if (isMapInitialized) {
        myMap.remove();
        isMapInitialized = false;
    }
}