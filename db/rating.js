'use strict'

var schemas = require("./schemas.js");

exports.findRating = function(user, party, callback) {
	schemas.Rating.findOne({'user': user.email, 'party': party}, function(err, rate) {
		if (rate)
			return callback(rate)
		return callback(null);
	});
}

// Adjust rating by the party code identifier and user who rated it
exports.addRating = function(user, party, rating, callback) {
	getParty(party, function(newparty) {
		// Check if the party exists or if the user is allowed to rate the party
		if (newparty == null || user.attending.indexOf(newparty.reg_code) < 0) {
			console.log(user.attending + ' does not have ' + newparty.reg_code);
			console.error("Party doesn't exist/User has insufficient priviledges");
			return callback(null);
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

exports.updateRating = function(party, add, callback) {
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