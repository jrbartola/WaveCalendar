'use strict';

var schemas = require('./schemas.js');
var bcript = require('bcrypt');

function retrieveTags(callback) {
	// Retrieve all tag entries
	schemas.Tag.find({}, function(err, tags) {
		if err throw err;
		// Return callback with tags listed
		return callback(tags);
	});
}

module.exports.retrieveTags = retrieveTags;