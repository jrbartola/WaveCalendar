'use strict'

/* User API routing functions */


exports.getCurrentUserData = function(req, res) {
	if (req.session && req.session.user) {
		db.getUser('username', req.session.user.username, function(usr) {
			res.json(usr);
		});
	} else {
		res.json(null);
	}
};

// Retrieve user by field and specified value of that field
exports.getUserData = function(req, res) {
	var username = req.params.username;

	db.getUser('username', username, function(user) {
		// User.attending represents an array of party reg_code's
		db.enumerateAttended(user.attending, function(partydata) {
			
			// Respond with the attending attribute containing the parties
			// TODO: Create a table join rather than multiple queries
			user.attending = partydata;

			db.getUserParties(ObjectId(user._id), function(userowned) {
				user.owned = userowned;
				res.json(user);
			});
		});
	});
};

exports.updateUserData = function(req, res) {
	var username = req.params.username;
	var props = JSON.parse(req.body.props);

	db.updateUser(username, props, function(updated) {
		req.session.user = updated;
		res.json(updated);

	});
};

exports.createUserData = function(req, res) {
	// Registration form data in JSON format
	var formprops = req.body.props;

	db.createUser(formprops, function(newUser) {
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
	var user = req.session.user;
	var party = req.body.party;
	var username = req.body.username;
	var adduser = req.body.add;

	// If a party field is passed to the API, add the user to the party's attend list
	if (party) {
		// Returns true if user did not attend party yet, returns false if they did
		Users.attendParty(user, party, function(response) {
			res.json(response);
		});
	} else if (username && adduser) {
		Users.addUsername(user.email, username, function(resp) {
			if (resp == true)
				res.json({'success': true})
			else
				res.json({'success': false})
		});
	} else {
	 	Users.getUser(field, value, function(user) {
	 		res.json(user);
		});
	 }
	
};