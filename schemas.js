'use strict';

var mongoose = require('mongoose')
.connect('mongodb://localhost/waves');
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, "Didn't connect to database"));
db.once('open', function (callback) {

});

var userSchema = new Schema({
	name: {
		first: { type: String, required: true },
		last: { type: String, required: true }
	},
	username: { type: String, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	location: {
		city: String,
		state: String
	},
	num_parties: { type: Number, default: 0},
	attended_parties: { type: Number, default: 0},
	attending: [String],
	rated_parties: {type: Number, default: 0 },
	join_date: {type: Date, default: Date.now() },
	num_logins: {type: Number, default: 0 }
	// ... More to possibly come
});

var partySchema = new Schema({
	owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	reg_code: String,
	time: {
		start: Date,
		end: Date
	},
	invite_only: { type: Boolean, default: false },
	status: { type: String, default: "planned" },
	ratio: {
		guys: { type: Number, default: 0 },
		girls: { type: Number, default: 0 }
	},
	filters: [String],
	rating: { type: Number, default: 3 },
	num_ratings: { type: Number, default: 0 },
	num_guests: Number,
	attending: { type: Number, default: 0 },
	location: {
		street: String,
		city: String,
		zip_code: String
	},
	title: { type: String, required: true }
	// ... More to possibly come
});

var ratingSchema = new Schema({
	// Email of user
	user: { type: String, required: true },
	// Party registration code
	party: { type: String, required: true },
	date_posted: { type: Date, default: Date.now() },
	rating: { type: Number, required: true },
	description: String
	// ... More to possibly come
});

var filterSchema = new Schema({
	created_by: { type: String, default: "Admin" },
	added_on: { type: Date, default: Date.now() },
	data: String,
	// if filter is pending, it doesn't show up in search box results
	pending: { type: Boolean, default: true },
	// Type can either be 'tag' or 'location'
	type: String

});

var User = mongoose.model('User', userSchema);
var Party = mongoose.model('Party', partySchema);
var Rating = mongoose.model('Rating', ratingSchema);
var Filter = mongoose.model('Filter', filterSchema);

module.exports.User = User;
module.exports.Party = Party;
module.exports.Rating = Rating;
module.exports.Filter = Filter;
module.exports.Mongoose = mongoose;

//
//{created_by: "Admin", added_on: Date.now, data: "Lit", pending: false}