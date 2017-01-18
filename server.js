'use strict';

var express = require('express'); 
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var ObjectId = require('mongoose').Types.ObjectId;

/* Enumerate our API routes */
var userRoute = require('./routes/users');
var ratingRoute = require('./routes/ratings');
var partyRoute = require('./routes/parties');
var filterRoute = require('./routes/filters');


app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());


// Setup our static directory
app.use(express.static(__dirname + '/assets'));

app.use(session({
    secret: '89wF./z@#iaF29BQoK32NDlaq~-+3nps',
    resave: true,
    saveUninitialized: true
}));


var auth = userRoute.auth;

/* Main URI Routing */

app.get('/', auth, function(req, res) {
	res.sendFile(__dirname + "/assets/templates/home.html");
});


// TODO: Fix the following two routes so they are not encapsulated in
// the userRoutes module.
app.get('/users/:profile', auth, userRoute.retrieveProfileData);

app.post('/login', userRoute.loginUserData);

app.get('/logout', function(req, res) {
	req.session.user = null;
	res.redirect('/');
});

app.get('/404', function(req, res) {
	res.sendFile(__dirname + "/assets/templates/404.html");
});


/* User API routes */

app.get('/api/user/:username', auth, userRoute.getUserData);

app.post('/api/user', userRoute.createUserData);

app.put('/api/user/:username', userRoute.updateUserData);

app.get('/api/currentuser', userRoute.getCurrentUserData);

/* TODO: Figure out what this route is used for. This looks extremely
   questionable; we already have a POST route for user
*/

app.post('/api/user/:username', userRoute.secondUserPostData);


/* Filter API routes */

app.get('/api/filters', filterRoute.getFilterData);



/* Party API routes */

app.get('/api/party/:partycode', partyRoute.getPartyData);

// TODO: find a way to consolidate this endpoint into a GET request
app.post('/api/party/location', partyRoute.getPartyByLocationData);

app.post('/api/party', partyRoute.createPartyData);

app.put('/api/party/:partycode', partyRoute.updatePartyData);

app.delete('/api/party/:partycode', partyRoute.removePartyData);



/* Rating API routes */

app.get('/api/rating/:partycode/:username', ratingRoute.getRatingData);

app.post('/api/rating', ratingRoute.createRatingData);


/* Register our 404 page */

app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + "/assets/templates/404.html");
});


// Generates a random string from a given charset
function randomString(length, charset) {
    var result = '';
    for (var i = length; i > 0; --i) result += charset[Math.floor(Math.random() * charset.length)];
    return result;
}

/* Run our server */

http.listen(3002, function() {
	console.log("Running Wave Calendar port 3002...");
});