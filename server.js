'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');

// set static directory
app.use(express.static(__dirname + '/assets'));

var auth = function(req, res, next) {
    if (req.session && req.session.user) {
        return next();
  	} else {
  	    return res.redirect('/');
	}  
};

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/assets/templates/index.html");
});

http.listen(3002, function() {
	console.log("Running on port 3002...");
});