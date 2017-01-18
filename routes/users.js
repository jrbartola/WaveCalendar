'use strict'

/* User API routing functions */

/* First three functions shouldn't be here- find
   a way to abstract them into something outside of
   this file.
*/


exports.auth = function(req, res, next) {
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

exports.loginUserData = function(req, res) {
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
};

exports.retrieveProfileData = function(req, res) {
	db.getUser('username', req.params.profile, function(usr) {
		if (usr === null) {
			res.redirect('/404');
		} else {
			res.sendFile(__dirname + "/assets/templates/profile.html");
		}
	});
};

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