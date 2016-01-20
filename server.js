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

app.get('/api/filters', function(req, res) {
	db.retrieveFilters(function(filters) {
		res.json(filters);
	});
});

app.post('/api/parties', function(req, res) {
	console.log(req.query);
	var filters = req.body.filters;

	db.retrieveParties(filters, function(parties) {
		res.json(parties);
	});
});

http.listen(3002, function() {
	console.log("Running on port 3002...");
});