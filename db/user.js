'use strict'

// File containing User database operations

var schemas = require('./schemas.js');


function addUsername(email, username, callback) {

	schemas.User.findOne({'username': username}, function(err, duplicate) {
		if (duplicate) {
			return callback(false);
		} else {
			schemas.User.update({'email': email}, {'username': username}, function(err1) {
				return callback(true);
			});
		}
	});
}

// Retrieve user by field and specified value of that field
function getUser(field, value, callback) {
	if (field === 'email') {
		
		schemas.User.findOne({'email': value}, function(err, user) {
			if (err) throw err;
			// Return callback with matched user
			return callback(user);
		});

	} else if (field === 'username') {
		
		schemas.User.findOne({'username': value}).lean().exec(function(err, user) {
			if (err) throw err;

			if (user) {
				schemas.Party.find({'owner': user._id}).lean().exec(function(err1, parties) {
					if (err1) throw err1;
					// Add the user's parties to its properties
					user.waves = parties;
					// Return callback with matched user
					return callback(user);
				});
			} else {
				return callback(user);
			}

			
			
			
		});
	}

	throw new error();
	
}

function createUser(props, callback) {
	getUser('email', props.email, function(user) {
		
		// Make sure there is no user with the same email
		if (user == null) {
			
			var newUser = new schemas.User(props);
			newUser.save(function(err) {
				if (err) throw err;
				return callback(newUser);
			});
		} else {
			console.dir(user);
			return callback(null);
		}
	});
	
}

function updateUser(id, props, callback) {
	schemas.User.findByIdAndUpdate(id, {'$set': {'location': props.location, 
	  'username': props.username, 'email': props.email}}, {'new': true}, function(err, updated) {

	  	return callback(updated);
	});
}





/* These two functions seem to be related... get rid of one */

function loginUser(email, password, callback) {
	// TODO: Replace plaintext password with bcrypt or some other module (that works :( )
	schemas.User.findOne({'email': email, 'password': password}, function(err, user) {
		if (err) throw err;
		return callback(user);
	});
}

function updateLogins(email) {
	schemas.User.findOne({'email': email}, function(err, user) {
		if (err) throw err;

		if (user) {
			user.num_logins = user.num_logins + 1;
			user.save();
		}
		
		
	});
}

function attendParty(user, party, callback) {
	// Check if user is already attending the party
	schemas.User.findOne({'email': user.email, 'attending': 
		{ '$in': [party] }}, function(err, matched) {
		// If the user is already attending the party don't bother to add it again
		if (matched)
			return callback(null);
		schemas.User.update({'email': user.email}, {'$push': {'attending': party}}, function(err, upd) {
			schemas.Party.update({'reg_code': party}, {'$inc': {'attending': 1}}, function(err1, upd1) {
				return callback(1);
			});
			
		});
	});
}