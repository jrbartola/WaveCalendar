'use strict';

var schemas = require('./schemas.js');
//var bcript = require('bcrypt');

function retrieveTags(callback) {
	// Retrieve all tag entries
	schemas.Tag.find({}, function(err, tags) {
		if (err) throw err;
		// Return callback with tags listed
		return callback(tags);
	});
}

function addTag(props, callback) {
	// Add tag with entered properties
	var newTag = new schemas.Tag(props);
	newTag.save(function(err) {
		if (err) throw err;
		return callback(newTag);
	});
}

module.exports.addTag = addTag;
module.exports.retrieveTags = retrieveTags;