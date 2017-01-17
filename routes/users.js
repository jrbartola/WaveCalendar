'use strict'

/* User API routing functions */

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
}