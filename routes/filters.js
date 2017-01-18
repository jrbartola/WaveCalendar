'use strict'

var filter = require('../db/filter');

/* Filter API routing functions */

exports.getFilterData = function(req, res) {
	filter.retrieveFilters(function(filters) {
		res.json(filters);
	});
};