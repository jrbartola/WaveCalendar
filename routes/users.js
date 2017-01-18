'use strict'

var user = require('../db/user');
var party = require('../db/party');

/* User API routing functions */


exports.getCurrentUserData = function(req, res) {
	if (req.session && req.session.user) {
		user.getUser('username', req.session.user.username, function(usr) {
			res.json(usr);
		});
	} else {
		res.json(null);
	}
};

// Retrieve user by field and specified value of that field
exports.getUserData = function(req, res) {
	var username = req.params.username;

	user.getUser('username', username, function(_user) {
		// User.attending represents an array of party reg_code's
		party.enumerateAttended(_user.attending, function(partydata) {
			
			// Respond with the attending attribute containing the parties
			// TODO: Create a table join rather than multiple queries
			_user.attending = partydata;

			party.getUserParties(ObjectId(_user._id), function(userowned) {
				_user.owned = userowned;
				res.json(_user);
			});
		});
	});
};

exports.updateUserData = function(req, res) {
	var username = req.params.username;
	var props = JSON.parse(req.body.props);

	user.updateUser(username, props, function(updated) {
		req.session.user = updated;
		res.json(updated);

	});
};

exports.createUserData = function(req, res) {
	// Registration form data in JSON format
	var formprops = req.body.props;

	user.createUser(formprops, function(newUser) {
		if (newUser == null) {
			res.json(null);
		} else {
			res.json(newUser);
		}
	});
};

//
//
//
//
//
// TODO: Figure out what this function is used for...
exports.secondUserPostData = function(req, res) {
	//var field = req.body.field;
	var value = req.body.value;
	var _user = req.session.user;
	var _party = req.body.party;
	var username = req.body.username;
	var adduser = req.body.add;

	// If a party field is passed to the API, add the user to the party's attend list
	if (_party) {
		// Returns true if user did not attend party yet, returns false if they did
		user.attendParty(_user, _party, function(response) {
			res.json(response);
		});
	} else if (username && adduser) {
		user.addUsername(_user.email, username, function(resp) {
			if (resp == true)
				res.json({'success': true})
			else
				res.json({'success': false})
		});
	} else {
	 	user.getUser(field, value, function(_user) {
	 		res.json(_user);
		});
	 }
	
};