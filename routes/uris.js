'use strict'

var user = require('../db/user');
var party = require('../db/party');

/* WaveCalendar URI routing functions */

exports.auth = function(req, res, next) {
	//
	// For testing purposes only!!!
	// 
	user.loginUser('jrbartola@gmail.com', 'pass123', function(usr) {
		if (!usr) {
			res.json(null);
		} else {
			party.updatePartyStatuses();
			user.updateLogins('jrbartola@gmail.com');
			req.session.user = usr;
		}
	});
	//
	//
	//
    if (req.session && req.session.user) {
        return next();
  	} else {
  	    return res.sendFile("/assets/templates/index.html", {'root': '../Wave_cal/'});
	}  
};

exports.loginUserData = function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	user.loginUser(email, password, function(usr) {
		if (!usr) {
			res.json(null);
		} else {
			party.updatePartyStatuses();
			user.updateLogins(email);
			req.session.user = usr;
			res.json(usr);
		}
	});
};

exports.retrieveProfileData = function(req, res) {
	user.getUser('username', req.params.profile, function(usr) {
		if (usr === null) {
			res.redirect('/404');
		} else {
			res.sendFile("/assets/templates/profile.html", {'root': '../Wave_cal/'});
		}
	});
};