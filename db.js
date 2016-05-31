'use strict';

var schemas = require('./schemas.js');
//var bcript = require('bcrypt');

function retrieveFilters(callback) {
	// Retrieve all tag entries
	schemas.Filter.find({'pending': {'$ne': true}}, function(err, filters) {
		if (err) throw err;
		// Return callback with tags listed
		return callback(filters);
	});
}

function addFilter(props, callback) {
	// Add tag with entered properties
	var newFilter = new schemas.Filter(props);
	newFilter.save(function(err) {
		if (err) throw err;
		return callback(newFilter);
	});
}

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

function retrieveParties(callback, filters, location) {

	// Filter party entries based on tags

	if (location && filters) {
		schemas.Party.find({}).
		where('filters').all(filters). // Make location.city case insensitive
		where({'location.city': location}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	} else if (filters) {
		schemas.Party.find({}).
		where('filters').all(filters).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	} else if (location) {
		schemas.Party.find({}).
		where({'location.city': location}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	} else {
		schemas.Party.find({}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	}
	
}



function partyByCode(code, callback) {
	schemas.Party.findOne({"reg_code": code}, function(err, party) {
		if (err) throw err;
		// Return callback with matched party
		return callback(party);
	});
}

function addParty(props, callback) {
	// Add party with entered properties
	var newParty = new schemas.Party(props);
	newParty.save(function(err) {
		if (err) throw err;
		return callback(newParty);
	});
}

// Retrieve user by field and specified value of that field
function getUser(field, value, callback) {
	if (field === '_id') {
		schemas.User.findById(value, function(err, user) {
			if (err) throw err;
			// Return callback with matched user
			
			return callback(user);
		});
	} else if (field === 'email') {
		
		schemas.User.findOne({'email': value}, function(err, user) {
			if (err) throw err;
			// Return callback with matched user
			return callback(user);
		});

	} else if (field === 'username') {
		
		schemas.User.findOne({'username': value}).lean().exec(function(err, user) {
			if (err) throw err;
			// Return callback with matched user
			return callback(user);
		});
	} else {
		// FIX THIS: "field" is taken literally rather than as a variable
		schemas.User.findOne({field: value}, function(err, user) {
			if (err) throw err;
			// Return callback with matched user
			return callback(user);
		});
	}
	
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

function findRating(user, party, callback) {
	schemas.Rating.findOne({'user': user.email, 'party': party}, function(err, rate) {
		if (rate)
			return callback(rate)
		return callback(null);
	});
}

// Adjust rating by the party code identifier and user who rated it
function addRating(user, party, rating, callback) {
	partyByCode(party, function(newparty) {
		if (newparty == null) {
			console.error("Cannot rate a party that does not exist");
		} else {

			findRating(user, newparty.reg_code, function(rate) {
				// If the same user rated the same party then overwrite previous rating
				if (rate) {
					console.log('Updating new rating from ' + rate.rating + ' to ' + rating);
					rate.rating = rating;
					rate.save(function(err) {
						if (err) throw err;
						updateRating(newparty, 0, function(newrating) {
							return callback(newrating);
						});
					});

				} else { // else create a new rating entry

				  	var props = {'user': user.email, 'party': newparty.reg_code, 'rating': rating}
					var newRate = new schemas.Rating(props);
					newRate.save(function(err) {
						if (err) throw err;
						updateRating(newparty, 1, function(newrating) {
							return callback(newrating);
						});
				  	
					});
				}
			});		
		}
	});
}

function updateRating(party, add, callback) {
	schemas.Rating.aggregate([{ '$match': { 'party': party.reg_code }},
	  { '$group': { '_id': null, 'rating': {'$avg': '$rating'}}}], function(err, avg) {

  		schemas.Party.update({'reg_code': party.reg_code}, {'rating': avg[0].rating, 
  		  '$inc': {'num_ratings': add}}, function(err, newparty) {
  			if (err) {
  				console.dir(err);
  				throw err;
  			}

  			return callback(avg[0].rating);
  		});
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

function createParty(props, callback) {
	var newWave = new schemas.Party(props);
	newWave.save(function(err) {
		if (err) {
			console.error(err.message);
			throw err;
		}
		return callback(newWave);
	});
}

function enumerateAttended(attending, callback) {
	// Match the waves up with their registration codes
	schemas.Party.find({'reg_code': { '$in': attending}})
	.sort({'time.start': 'descending'})
	.exec(function(err, parties) {
		return callback(parties);
	});

}




module.exports.addFilter = addFilter;
module.exports.addUsername = addUsername;
module.exports.retrieveFilters = retrieveFilters;
module.exports.retrieveParties = retrieveParties;
module.exports.partyByCode = partyByCode;
module.exports.addParty = addParty;
module.exports.getUser = getUser;
module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
module.exports.updateLogins = updateLogins;
module.exports.findRating = findRating;
module.exports.addRating = addRating;
module.exports.attendParty = attendParty;
module.exports.createParty = createParty;
module.exports.enumerateAttended = enumerateAttended;