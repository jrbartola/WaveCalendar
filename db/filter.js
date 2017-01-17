'use strict'

// File containing Filter database operations

var schemas = require('/schemas.js');

function retrieveFilters(callback) {
	// Retrieve all filter entries
	schemas.Filter.find({'pending': {'$ne': true}}, function(err, filters) {
		if (err) throw err;
		// Return callback with filters listed
		return callback(filters);
	});
}

function addFilter(props, callback) {
	// Add filter with entered properties
	var newFilter = new schemas.Filter(props);
	newFilter.save(function(err) {
		if (err) throw err;
		return callback(newFilter);
	});
}