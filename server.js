'use strict';

var express = require('express'); 
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./db.js');

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());

// set static directory
app.use(express.static(__dirname + '/assets'));

var auth = function(req, res, next) {
    if (req.session && req.session.user) {
        return next();
  	} else {
  	    return res.sendFile(__dirname + "/assets/templates/index.html");
	}  
};

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/assets/templates/index.html");
});

app.get('/home', function(req, res) {
	res.sendFile(__dirname + "/assets/templates/front.html");
});

app.get('/api/filters', function(req, res) {
	db.retrieveFilters(function(filters) {
		res.json(filters);
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

http.listen(3002, function() {
	console.log("Running on port 3002...");
});