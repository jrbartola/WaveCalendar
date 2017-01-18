'use strict'

var party = require('../db/party');

/* Party API routing functions */

exports.createPartyData = function(req, res) {
	var user = req.session.user;
	var props = JSON.parse(req.body.properties);
	var reg_code = randomString(8, '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ');
	console.dir(props);
	props.reg_code = reg_code;
	props.owner = ObjectId(user._id);

	party.createParty(user, props, function(party) {
		res.json(party);
	});
};

exports.getPartyData = function(req, res) {
	var code = req.params.partycode;

	party.getParty(partycode, function(party) {
		res.json(party);
	});
	
};

exports.getPartyByLocationData = function(req, res) {
	var location = req.body.location;
	var filters = req.body.filters;

	party.retrieveParties(function(parties) {
		res.json(parties);
	}, filters, location);
	
};

exports.updatePartyData = function(req, res) {
	// Why do I need the currentuser here?
	var user = req.session.user;
	var reg_code = req.params.partycode;
	var props = JSON.parse(req.body.props);

	party.updateParty(user, reg_code, props, function(updated) {
		res.json(updated);
	});
	
};

exports.removePartyData = function(req, res) {
	var reg_code = req.params.partycode;
	// Again, why do I need user here?
	var user = req.session.user;

	party.removeParty(user, reg_code, function(removed) {
		if (removed)
			res.json({'success': true});
		else
			res.json({'success': false});
	});
};