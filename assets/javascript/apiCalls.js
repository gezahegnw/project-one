// Declaring a variable to store an array of objects representing the list of cities matching search term
var initialResults = [];

// Declaring variable to store an array of objects representing the cities whose details are currently being displayed
var myCities = [];

// ----------------------------------
// Function to perform api query for user input city name and return intial results
function searchForCity(searchTerm) {
    console.log("searching for " + searchTerm);
    // Create the query url using the Teleport City Search API endpoint and the city name inputted by the user.
    var queryUrl = `https://api.teleport.org/api/cities/?search=${searchTerm}`;
    // Query the Teleport API city search endpoint
    $.ajax({
        url: queryUrl,
        method: "GET"
    // Once the response is returned from the API...
    }).done(function(response) {
        // console.log(response);
        // Clear the array for storing search results
        initialResults = [];
        // For each matching city returned by the search...
        response._embedded["city:search-results"].forEach(function(city) {
            // Create an object with the full city name to display and the url w/ city ID used to get information about the city later
            initialResults.push({
                fullName: city.matching_full_name,
                uniqueSearchUrl: city._links["city:item"].href,
                // Attaching method that will be declared below for getting the full info if city is selected
                getCityInfo,
                // Attaching methods used to update time and weather once city has full information attached
                getCurrentTime,
                getCurrentWeather
            });
        });
        // console.log(initialResults);

        // Run functioni to display initial results
        displayInitialResults();

    // Or if the API call returns an error...
    }).fail(function(response) {
        console.error(response);
    });
}

// ----------------------------------
// Method for getting the information about a specific city
function getCityInfo(callback) {
    // Grab the city object the method was called on
    var thisCity = this;
    // Grab the URL with unique city ID for the city chosen by the user
    var queryUrl = thisCity.uniqueSearchUrl;
    // console.log(queryUrl);
    // Query the Teleport API endpoint for basic city information
    $.ajax({
        url: queryUrl,
        method: "GET"
    // When the response is returned...
    }).done(function(response) {
        // Store the relevant pieces of the response as properties on the city object
        thisCity.name = response.name,
        thisCity.population = response.population,
        thisCity.country = response._links["city:country"].name,
        thisCity.id = response.geoname_id,
        thisCity.fullName = response.full_name,
        thisCity.timeZone = response._links["city:timezone"].name,
        thisCity.timeOffset = 0,
        thisCity.latitude = response.location.latlon.latitude,
        thisCity.longitude = response.location.latlon.longitude,
        thisCity.uniqueSearchUrl = thisCity.uniqueSearchUrl
        // Do an API call to get country information using the URL returned
        $.ajax({
            url: response._links["city:country"].href,
            method: "GET"
        }).done(function(countryResponse) {
            // Set the current city currency property
            thisCity.currency = countryResponse.currency_code;
            // console.log(thisCity);
            // Do an API call to get the timezone offset url
            $.ajax({
                url: response._links["city:timezone"].href,
                method: "GET"
            }).done(function(timeZoneResponse) {
                // Use the URL given in response to the previous query to get the time offset in minutes for the city
                var timeZoneUrl = timeZoneResponse._links["tz:offsets-now"].href;
                $.ajax({
                    url: timeZoneUrl,
                    method: "Get"
                }).done(function(timeOffsetResponse) {
                    // Set the time offset in minutes from UTC
                    thisCity.timeOffset = timeOffsetResponse.total_offset_min;
                    // Set the city's current time
                    thisCity.getCurrentTime();
                    // Set the city's current weather
                    thisCity.getCurrentWeather(function() {
                        callback();
                        // console.log(thisCity)
                    });
                    // console.log(thisCity);

                    // Store the updated myCities array in local storage
                    // saveCitiesInLocalStorage();

                }).fail(function(timeOffsetResponse) {
                    console.error(timeOffsetResponse);
                });
            }).fail(function(timeZoneResponse) {
                console.error(timeZoneResponse);
            });
        });

    // Or if an error message is returned...
    }).fail(function(response) {
        console.error(response);
    });
}

// ----------------------------------
// Method for setting the current time of a city using moment.js for the utc and adding that citie's time offset
function getCurrentTime() {
    var thisCity = this;
    var time = moment.utc();
    // console.log(time.format("HH:mm"));
    time.add(thisCity.timeOffset, "m");
    // console.log(time.format("HH:mm"));
    thisCity.currentTime = time.format("HH:mm");
}

// ----------------------------------
// Method for setting the current temperature and air pressure of a city by querying the Open Weather API
function getCurrentWeather(callback) {
    var thisCity = this;
    var apiKey = "8aa4ec5578f127f51276588e1b8842c4";
    var latitude = thisCity.latitude;
    var longitude = thisCity.longitude;
    var queryUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&apikey=${apiKey}`;
    // console.log(queryUrl);
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).done(function(response) {
        thisCity.currentWeather = {};
        thisCity.currentWeather.shortDescription = response.weather[0].main;
        thisCity.currentWeather.temp= {};
        thisCity.currentWeather.temp.kelvin = response.main.temp;
        thisCity.currentWeather.temp.celcius = Math.round((response.main.temp - 273.15) * 100) / 100;
        thisCity.currentWeather.temp.fahrenheit = Math.round((response.main.temp * 9 / 5 - 459.67) * 100) / 100;
        thisCity.currentWeather.pressure = response.main.pressure;
        thisCity.currentWeather.humidity = response.main.humidity;

        // Run callback if one was given
        if (callback) {
            callback();
        }
    }).fail(function(response) {
        console.error(response);
    });
}

// ---
// Declaring a sample city to use for testing API calls for getting full city info
// var lawrence = {
//     fullName: "Lawrence, Kansas",
//     uniqueSearchUrl: "https://api.teleport.org/api/cities/geonameid:4274277/",
//     // Attaching method that will be declared below for getting the full info if city is selected
//     getCityInfo,
//     // Attaching methods used to update time and weather once city has full information attached
//     getCurrentTime,
//     getCurrentWeather
// }