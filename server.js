'use strict';

var express = require('express'); 
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./db.js');
var ObjectId = require('mongoose').Types.ObjectId;

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
// app.use(passport.initialize());
// app.use(passport.session());


// set static directory
app.use(express.static(__dirname + '/assets'));

app.use(session({
    secret: '89wF./z@#iaF29BQoK32NDlaq~-+3nps',
    resave: true,
    saveUninitialized: true
}));

var auth = function(req, res, next) {
    if (req.session && req.session.user) {
        return next();
  	} else {
  	    return res.sendFile(__dirname + "/assets/templates/index.html");
	}  
};

app.get('/', auth, function(req, res) {
	res.sendFile(__dirname + "/assets/templates/home.html");
});

app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	db.loginUser(email, password, function(user) {
		if (!user) {
			res.json(null);
		} else {
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

app.get('/api/currentuser', function(req, res) {
	if (req.session && req.session.user)
		res.send(req.session.user);
	else
		res.send(null);
});

app.get('/api/filters', function(req, res) {
	db.retrieveFilters(function(filters) {
		res.json(filters);
	});
});

app.post('/api/users', function(req, res) {
	var field = req.body.field;
	var value = req.body.value;

	db.getUser(field, value, function(user) {
		res.json(user);
	});
});

app.post('/api/register', function(req, res) {
	// Registration form data in JSON format
	var formprops = req.body.props;

	db.createUser(formprops, function(newUser) {
		if (newUser == null) {
			res.json(null);
		} else {
			res.json(newUser);
		}
	});
});

app.post('/api/parties', function(req, res) {
	var location = req.body.location;
	var filters = req.body.filters;

	db.retrieveParties(function(parties) {
		res.json(parties);
	}, filters, location);
	
});

app.post('/api/partycode', function(req, res) {
	var code = req.body.code;

	db.partyByCode(code, function(party) {
		res.json(party);
	});
	
});

app.post('/api/rating', function(req, res) {
	var user = req.session.user;
	var party = req.body.party;
	var rating = req.body.rating;
	
	if (rating) {
		db.addRating(user, party, rating, function(newRating) {
			res.json(newRating);
		});
	} else {
		db.findRating(user, party, function(r) {
			res.json(r.rating); 
		});
	}
	

});

http.listen(3002, function() {
	console.log("Running on port 3002...");
});