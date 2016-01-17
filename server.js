'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./db.js');

// set static directory
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/app'));

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

app.get('/api/tags', function(req, res) {
	db.retrieveTags(function(tags) {
		res.json(tags);
	});
});

http.listen(3002, function() {
	console.log("Running on port 3002...");
});