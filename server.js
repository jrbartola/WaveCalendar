'use strict';

var express = require('express'); 
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var ObjectId = require('mongoose').Types.ObjectId;

/* Enumerate our API routes */
var users = require('./routes/users');
var ratings = require('./routes/ratings');
var parties = require('./routes/parties');
var filters = require('./routes/filters');

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());


// Setup our static directory
app.use(express.static(__dirname + '/assets'));

app.use(session({
    secret: '89wF./z@#iaF29BQoK32NDlaq~-+3nps',
    resave: true,
    saveUninitialized: true
}));


var auth = function(req, res, next) {
	//
	// For testing purposes only!!!
	// 
	db.loginUser('jrbartola@gmail.com', 'pass123', function(user) {
		if (!user) {
			res.json(null);
		} else {
			db.updatePartyStatuses();
			db.updateLogins('jrbartola@gmail.com');
			req.session.user = user;
		}
	});
	//
	//
	//
    if (req.session && req.session.user) {
        return next();
  	} else {
  	    return res.sendFile(__dirname + "/assets/templates/index.html");
	}  
};

/* Main URI Routing */

app.get('/', auth, function(req, res) {
	res.sendFile(__dirname + "/assets/templates/home.html");
});

app.get('/users/:profile', auth, function(req, res) {
	db.getUser('username', req.params.profile, function(usr) {
		if (usr === null) {
			res.redirect('/404');
		} else {
			res.sendFile(__dirname + "/assets/templates/profile.html");
		}
	});
});

app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	db.loginUser(email, password, function(user) {
		if (!user) {
			res.json(null);
		} else {
			db.updatePartyStatuses();
			db.updateLogins(email);
			req.session.user = user;
			res.json(user);
		}
	});
});

app.get('/logout', function(req, res) {
	req.session.user = null;
	res.redirect('/');
});

app.get('/404', function(req, res) {
	res.sendFile(__dirname + "/assets/templates/404.html");
});


/* User API routes */

app.get('/api/user/:username', auth, users.getUserData);

app.post('/api/user', users.createUserData);

app.put('/api/user/:username', users.updateUserData);

app.get('/api/currentuser', users.getCurrentUserData);

/* TODO: Figure out what this route is used for. This looks extremely
   questionable; we already have a POST route for user
*/

app.post('/api/user/:username', function(req, res) {
	//var field = req.body.field;
	var value = req.body.value;
	var user = req.session.user;
	var party = req.body.party;
	var username = req.body.username;
	var adduser = req.body.add;

	// If a party field is passed to the API, add the user to the party's attend list
	if (party) {
		// Returns true if user did not attend party yet, returns false if they did
		db.attendParty(user, party, function(response) {
			res.json(response);
		});
	} else if (username && adduser) {
		db.addUsername(user.email, username, function(resp) {
			if (resp == true)
				res.json({'success': true})
			else
				res.json({'success': false})
		});
	} else {
	 	db.getUser(field, value, function(user) {
	 		res.json(user);
		});
	 }
	
});



// We don't need this either. Just reroute all requests to
// /api/currentuser to /api/user/<currentuser>

// app.get('/api/currentuser', function(req, res) {
// 	if (req.session && req.session.user) {
// 		db.getUser('username', req.session.user.username, function(usr) {
// 			res.json(usr);
// 		});
// 	} else {
// 		res.json(null);
// 	}
// });

/* Filter API routes */

app.get('/api/filters', filters.getFilterData);



/* Party API routes */

app.get('/api/party/:partycode', parties.getPartyData);

// TODO: find a way to consolidate this endpoint into a GET request
app.post('/api/party/location', function(req, res) {
	var location = req.body.location;
	var filters = req.body.filters;

	db.retrieveParties(function(parties) {
		res.json(parties);
	}, filters, location);
	
});

app.post('/api/party', parties.createPartyData);

app.put('/api/party/:partycode', parties.updatePartyData);

app.delete('/api/party/:partycode', parties.removePartyData);



/* Rating API routes */

app.get('/api/rating/:partycode/:username', ratings.getRatingData);

app.post('/api/rating', ratings.createRatingData);



app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + "/assets/templates/404.html");
});


// generates a random string
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

http.listen(3002, function() {
	console.log("Running Wave Calendar port 3002...");
});