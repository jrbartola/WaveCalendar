'use strict';

var schemas = require('./schemas.js');
//var bcript = require('bcrypt');

function retrieveFilters(callback) {
	// Retrieve all tag entries
	schemas.Filter.find({}, function(err, filters) {
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

function retrieveParties(callback, filters, location) {

	// Filter party entries based on tags

	if (location && filters) {
		schemas.Party.find({}).
		where('filters').all(filters).
		where({'location.town': location}).
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
		where({'location.town': location}).
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

function addParty(props, callback) {
	// Add party with entered properties
	var newParty = new Schemas.Party(props);
	newParty.save(function(err) {
		if (err) throw err;
		return callback(newParty);
	});
}



module.exports.addFilter = addFilter;
module.exports.retrieveFilters = retrieveFilters;
module.exports.retrieveParties = retrieveParties;
module.exports.addParty = addParty;



