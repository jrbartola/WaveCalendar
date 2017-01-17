'use strict'

/* Filter API routing functions */

exports.getFilterData = function(req, res) {
	db.retrieveFilters(function(filters) {
		res.json(filters);
	});
};