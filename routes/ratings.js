'use strict'

// TODO: Review this function. Maybe we can abstract
// this into a user-based query?

exports.getRatingData = function(req, res) {
	var username = req.params.username;
	var party = req.params.partycode;

	db.findRating(user, party, function(rate) {
		res.json(rate); 
	});
};

exports.createRatingData = function(req, res) {
	var user = JSON.parse(req.body.user);
	var party = req.body.party;
	var rating = req.body.rating;
	
	db.addRating(user, party, rating, function(newRating) {
		res.json(newRating);
	});
};