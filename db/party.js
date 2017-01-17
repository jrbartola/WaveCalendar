'use strict'

// File containing party database operations

var schemas = require('./schemas.js');


function getParty(code, callback) {
	schemas.Party.findOne({"reg_code": code}, function(err, party) {
		if (err) throw err;
		// Return callback with matched party
		return callback(party);
	});
}

function retrieveParties(callback, filters, location) {

	// Filter party entries based on tags

	if (location && filters) {
		schemas.Party.find({}).
		where('filters').all(filters). // Make location.city case insensitive
		where({'location.city': location}).
		sort({'time.start': -1}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	} else if (filters) {
		schemas.Party.find({}).
		where('filters').all(filters).
		sort({'time.start': -1}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	} else if (location) {
		schemas.Party.find({}).
		where({'location.city': location}).
		sort({'time.start': -1}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	} else {
		schemas.Party.find({}).
		sort({'time.start': -1}).
		exec(function(err, parties) {
			if (err) throw err;
			// Return callback with parties listed
			return callback(parties);
		});
	}
	
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



/* Why are these two seemingly identical functions here? */


function addParty(props, callback) {
	// Add party with entered properties
	var newParty = new schemas.Party(props);
	newParty.save(function(err) {
		if (err) throw err;
		return callback(newParty);
	});
}

function createParty(user, props, callback) {
	var newWave = new schemas.Party(props);
	newWave.save(function(err) {
		if (err) {
			console.error(err.message);
			throw err;
		}
		schemas.User.update({'email': user.email}, {'$inc': {'num_parties': 1 }}).exec();
		return callback(newWave);
	});
}

function removeParty(user, reg_code, callback) {
	schemas.Party.findOne({'owner': user._id, 'reg_code': reg_code}, function(err, toremove) {
		if (toremove != null) {
			toremove.remove();
			return callback(true);
		}

		return callback(null);

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

function getUserParties(userid, callback) {
	schemas.Party.find({'owner': userid}).
	sort({'time.start': 'descending'})
	.exec(function(err, parties) {
		return callback(parties);
	});
}

// There is probably a better way to do this
// Runs every time a user logs in, updates party statuses in 
// database by checking if the end time is past the current date
function updatePartyStatuses() {
	var curDate = new Date();
	schemas.Party.update({'time.end': {'$lt': curDate}}, { '$set': { 'status': 'over'}}, {multi: true}).exec();
	schemas.Party.update({'$and': [ {'time.start': {'$lt': curDate}}, {'time.end': 
	  {'$gt': curDate}} ]}, { '$set': {'status': 'ongoing'}}, {multi: true}).exec();
}

function updateParty(user, reg_code, props, callback) {
	schemas.Party.findOneAndUpdate({'owner': user._id, 'reg_code': reg_code}, 
		{'$set': {'title': props.title, 'invite_only': props.invite_only,
		'filters': props.filters, 'ratio': props.ratio}}, {new: true}, function(upd) {
			// Return the updated party
			return callback(upd);
		});
}




// There is probably a better way to do this
// Runs every time a user logs in, updates party statuses in 
// database by checking if the end time is past the current date
function updatePartyStatuses() {
	var curDate = new Date();
	schemas.Party.update({'time.end': {'$lt': curDate}}, { '$set': { 'status': 'over'}}, {multi: true}).exec();
	schemas.Party.update({'$and': [ {'time.start': {'$lt': curDate}}, {'time.end': 
	  {'$gt': curDate}} ]}, { '$set': {'status': 'ongoing'}}, {multi: true}).exec();
}

function updateParty(user, reg_code, props, callback) {
	schemas.Party.findOneAndUpdate({'owner': user._id, 'reg_code': reg_code}, 
		{'$set': {'title': props.title, 'invite_only': props.invite_only,
		'filters': props.filters, 'ratio': props.ratio}}, {new: true}, function(upd) {
			// Return the updated party
			return callback(upd);
		});
}