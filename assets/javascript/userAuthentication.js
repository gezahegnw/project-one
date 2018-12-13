// Declare global variable to keep track of log-in state
var userAuthentication = {
    isLoggedIn: false,
    currentUser: null,
    users: [],
    indexOfCurrentUser: null
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBehm9nipwFtdM0E0FhZWUFau-6WbMxHko",
    authDomain: "project-1-26af7.firebaseapp.com",
    databaseURL: "https://project-1-26af7.firebaseio.com",
    projectId: "project-1-26af7",
    storageBucket: "project-1-26af7.appspot.com",
    messagingSenderId: "697742977805"
};
firebase.initializeApp(config);
var database = firebase.database();

// When the page loads or a new value is added to the database...
database.ref().on("value", function(snapshot) {
    // Grab the list of users from the database if it exists
    if (snapshot.val()) {
        if (snapshot.val().users) {
            userAuthentication.users = snapshot.val().users;
        }
    }
});

// When the new user registration form is submitted...
$(document).on("click", "#register-submit", function(event) {
    console.log("register form submitted")
    event.preventDefault();

    // Grab the values of the input fields
    var newUserId = $("#new-user-id").val().trim();
    var newPassword = $("#new-password").val();
    var newConfirmPassword = $("#confirm-password").val();
    // Grab the message area for displaying results of form submission
    var registerMessage = $("#register-message");

    // console.log(newUserId)
    // console.log(newPassword)
    // console.log(newConfirmPassword)
    
    // Verify that the user ID is not already in use
    var isUserIdAlreadyInUse = false;
    userAuthentication.users.forEach(function(user) {
        // console.log(user)
        if (user.id === newUserId) {
            isUserIdAlreadyInUse = true;
        }
    });
    console.log(isUserIdAlreadyInUse)
    if (isUserIdAlreadyInUse) {
        registerMessage.html("<br>The User ID you chose is already in use.");
        // console.log ("user id in use")
    }
    else {
        // Verify that the passwords match
        if (newPassword !== newConfirmPassword) {
            registerMessage.html("<br>The passwords you entered did not match.");
            // console.log("passwords don't match")
        }
        else {
            // Create a database-friendly (method-free) copy of current myCities array by taking advantage of the fact that methods are stripped when objects are stringified for local storage
            // Create new user object
            var methodFreeMyCities = JSON.parse(localStorage.getItem("myCities"));
            var newUser = {
                id: newUserId,
                password: newPassword,
                cities: methodFreeMyCities
            }
            // Add the new user object to the users array
            userAuthentication.users.push(newUser);
            // Update the users array in the database
            database.ref().set({
                users: userAuthentication.users
            });
            // Log the user in
            logIn(newUser);
            // Clear the register message
            registerMessage.html("");
        }
    }
    
    // Clear the form input fields
    $("#new-user-id").val("");
    $("#new-password").val("");
    $("#confirm-password").val("");
});


// Function for logging a user in
function logIn(user) {
    // Find index of user in users array
    userAuthentication.users.forEach(function(eachUser, index) {
        if (eachUser == user) {
            userAuthentication.indexOfCurrentUser = index;
            console.log(userAuthentication.indexOfCurrentUser);
        }
    });
    // Set status to logged in as user
    userAuthentication.isLoggedIn = true;
    userAuthentication.currentUser = user;
    // Set the myCities array using the cities associated with the user
    getCitiesForCurrentUser();
    // Update local storage
    saveCitiesInLocalStorage();
    // Recreate page content using current myCities array
    populatePageFromArray();
    // Update the current user display
    switchToLogOutForm();
}

// Function for switching the log-in form to log-out
function switchToLogOutForm() {
    $("#log-in").html("Log Out");
    $("#log-in-menu").html(
        `<li>
            <div class="col-lg-12">
                <div class="text-center">
                    <h3><b>Log Out</b></h3>
                    <br>
                    You are currently logged in as:
                    <br>
                    <span style="font-weight: 700; font-size: 1.3em">${userAuthentication.currentUser.id}</span>
                    <br>
                </div>
                <br>
                <form id="login-form">
                    <div class="col-xs-5 pull-right">
                        <input type="submit" name="log-out-submit" id="log-out-submit" tabindex="4" class="form-control btn btn-success" value="Logout">
                    </div>
                </form>
            </div>
        </li>`
    );
}

// Function for switching the log-out form back to log-in
function switchToLogInForm() {
    $("#log-in").html("Log In");
    $("#log-in-menu").html(
        `<li>
            <div class="col-lg-12">
                <div class="text-center">
                    <h3><b>Log In</b></h3>
                    <br>
                    <span id="log-in-message"></span>
                </div>
                <form id="login-form" >
                    <div class="form-group">
                        <label for="username">User ID</label>
                        <input type="text" name="user-id" id="user-id" tabindex="1" class="form-control" placeholder="email" value="" autocomplete="off" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" name="password" id="password" tabindex="2" class="form-control" placeholder="Password" autocomplete="off" required>
                    </div>
                    <div class="col-xs-5 pull-right">
                        <input type="submit" name="log-in-submit" id="log-in-submit" tabindex="4" class="form-control btn btn-success" value="Login">
                    </div>
                </form>
            </div>
        </li>`
    );
}

// When the log-in (for existing user) form is submitted...
$(document).on("click", "#log-in-submit", function(event) {
    event.preventDefault();

    // Grab the form input values
    var userId = $("#user-id").val().trim();
    var password = $("#password").val();
    // Grab the message area for displaying results of form submission
    var logInMessage = $("#log-in-message");

    // Search the users list for the user ID provided
    var matchingUser = null;
    userAuthentication.users.forEach(function(user) {
        if (user.id === userId) {
            matchingUser = user;
        }
    });
    // If no matching user ID was found, notify the user
    if (!matchingUser) {
        logInMessage.html("That user ID does not match any in our records.");
        // Clear input fields
        $("#user-id").val("");
        $("#password").val("");
    }
    // Otherwise, check that the password is correct
    else {
        if (matchingUser.password !== password) {
            logInMessage.html("The password you entered was incorrect.");
            // Clear password but leave userId value in input field
            $("#password").val("");
        }
        // If the password matches, log the user in.
        else {
            logIn(matchingUser);
            // Clear input fields
            $("#user-id").val("");
            $("#password").val("");
        }
    }
});

// When the log-out button is pressed, log the user out
$(document).on("click", "#log-out-submit", function(event) {
    event.preventDefault();
   userAuthentication.isLoggedIn = false;
   userAuthentication.currentUser = null;
   switchToLogInForm();
});

// Function for setting the myCities array from cities array associated with user account
function getCitiesForCurrentUser() {
    if (userAuthentication.currentUser.cities) {
        // Parse the string version of the array from local storage back into an array of objects and set the myCities array equal to this array
        myCities = userAuthentication.currentUser.cities;
        // Add the methods back onto the objects because they are not stored in local storage
        myCities.forEach(function(city) {
            city.getCityInfo = getCityInfo;
            city.getCurrentTime = getCurrentTime;
            city.getCurrentWeather = getCurrentWeather;
        });
    }
    else {
        myCities = [];
    }
}