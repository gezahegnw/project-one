// console.log("logic");
$("#submit-search").on("click", function(event) {
    // console.log("submit button clicked")
    event.preventDefault();
    var userInput = $("#search").val().trim();
    // console.log(userInput)
    if (userInput !== "") {
        searchForCity(userInput);
    }
});

// Function for displaying initial results to be ran after API call is complete
function displayInitialResults() {
    if (initialResults.length === 0) {
        $("#initial-results").html("No results match that search. Try typing your search differently, or search for a different City.<br>Include only the city name or the city and country separated by a comma. Make sure that you have spelled your search correctly.");
    }
    else {
        $("#initial-results").html($("<p class='instructions'>Please click on the correct result.</p>"));
        initialResults.forEach(function(value, index) {
            var newP = $(`<p id="${index}" class="initial-result">`);            
            newP.html((index + 1) + ": " + value.fullName);
            $("#initial-results").append(newP);
        });
    }
}

// Function to get and display city details when city from initial results is clicked
$(document).on("click", ".initial-result", function() {
    // Grab chosen city
    var chosenCity = initialResults[$(this).attr("id")];
    // If the chosen city is already on the page, remove it before adding it again
    // Keep track of whether the chosen city matches one already in the myCities array
    var isChosenCityInMyCities = false;
    // For each city in myCities...
    myCities.forEach(function(city, index) {
        // If the city is the same exact city as the new chosen city...
        if (chosenCity.uniqueSearchUrl === city.uniqueSearchUrl) {
            // Remove that city from the myCities array
            myCities.splice(index, 1);
            
            isChosenCityInMyCities = true;
        }
    });
    // Get the information for the chosen city from the APIs and then...
    chosenCity.getCityInfo(function() {
        // Add the new city to the front of the myCities array
        myCities.push(chosenCity);
        // Save the new array in local storage
        saveCitiesInLocalStorage();
        // If user is logged in...
        if (userAuthentication.isLoggedIn) {
            // Save current cities array in user's cities
            userAuthentication.currentUser.cities = JSON.parse(localStorage.getItem("myCities"));
            userAuthentication.users[userAuthentication.indexOfCurrentUser].cities = JSON.parse(localStorage.getItem("myCities"));
            // Update the users array in the database
            database.ref().set({
                users: userAuthentication.users
            });
        }
        // Empty the page and repopulate it from the array
        populatePageFromArray();
    });
    // Clear the initial results list
    $("#initial-results").empty();
});

// Function for displaying full city info to be run when the API calls are complete
function displayCityInfo(city) {
    // console.log("display city info")

    var cityIndex = myCities.indexOf(city);

    var newDiv = $(
        `<div class="card city-card d-inline-block mx-1 my-1" id="${cityIndex}">
            <div class="card-body">
                <button class="btn btn-outline-danger" cityId="${cityIndex}">
                    <i class="fa fa-window-close" aria-hidden="true"></i>
                </button>
                <h3>${city.name}</h3>
                <p>Population: ${city.population}</p>
                <p id="time-${cityIndex}">Current time: ${city.currentTime}</p>
                <p>Timezone: ${city.timeZone}</p>
                <p>Country: ${city.country}</p>
                <p>Currency: ${city.currency}</p>
                <p id="weather-${cityIndex}">Current weather: ${city.currentWeather.shortDescription}
                    <ul>
                        <li id="temp-${cityIndex}">Temperature: ${city.currentWeather.temp.celcius} &degC/ ${city.currentWeather.temp.fahrenheit} &degF</li>
                        <li id="humidity-${cityIndex}">Humidity: ${city.currentWeather.humidity}</li>
                    </ul>
                </p>
                <button class="update btn btn-outline-primary" cityId="${cityIndex}">Update time and weather</button>
            </div>
        </div>`
    );
    $("#results").prepend(newDiv);

    mapCity(city);
}

// Update time and weather when the update button is clicked
$(document).on("click", ".update", function() {
    var clickedCityIndex = $(this).attr("cityId");
    var clickedCity = myCities[clickedCityIndex];
    // console.log(clickedCity);
    clickedCity.getCurrentTime();
    // Update weather info from API and then update the relevent page content after the response is returned and the variables are updated
    clickedCity.getCurrentWeather(function() {
        $("#time-" + clickedCityIndex).html(`Current time: ${clickedCity.currentTime}`);
        $("#weather-" + clickedCityIndex).html(`Current weather: ${clickedCity.currentWeather.shortDescription}`);
        $("#temp-" + clickedCityIndex).html(`Temperature: ${clickedCity.currentWeather.temp.celcius} &degC/ ${clickedCity.currentWeather.temp.fahrenheit} &degF`);
        $("#humidity-" + clickedCityIndex).html(`Humidity: ${clickedCity.currentWeather.humidity}`);
    });
});

// delete city info card if the red exit button is clicked
$(document).on("click", ".btn-outline-danger", function() {
    // $("#" + $(this).attr("cityId")).detach();

    // Remove the corresponding city object from the myCities array
    myCities.splice($(this).attr("cityId"), 1);
    // Empty and then repopulate the cities info display from the array
    populatePageFromArray();
    // Store the new array in local storage
    saveCitiesInLocalStorage();
    if (userAuthentication.isLoggedIn) {
        // Save current cities array in user's cities
        userAuthentication.currentUser.cities = JSON.parse(localStorage.getItem("myCities"));
        userAuthentication.users[userAuthentication.indexOfCurrentUser].cities = JSON.parse(localStorage.getItem("myCities"));
        // Update the users array in the database
        database.ref().set({
            users: userAuthentication.users
        });
    }
});

// On page load, check local storage and populate page from cities stored in local storage
$(document).ready(function() {
    // If there are cities saved in local storage, create page display using saved cities
    if (localStorage.getItem("myCities")) {
        getCitiesFromLocalStorage();
        populatePageFromArray();
    }
    
});