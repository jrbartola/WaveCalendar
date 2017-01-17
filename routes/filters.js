'use strict'

exports.getFilterData = function(req, res) {
	db.retrieveFilters(function(filters) {
		res.json(filters);
	});
};