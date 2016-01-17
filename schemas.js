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
		first: String,
		last: String,
		required: true
	},
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	location: String,
	num_parties: { type: Number, default: 0},
	attended_parties: { type: Number, default: 0},
	rated_parties: { type: Number, default: 0},
	join_date: {type: Date, default: Date.now},
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
	status: String,
	ratio: {
		guys: { type: Number, default: 1 },
		girls: { type: Number, default: 1 }
	},
	tags: [String],
	rating: { type: Number, default: 3 },
	num_ratings: { type: Number, default: 0 },
	num_guests: Number,
	location: String
	// ... More to possibly come
});

var ratingSchema = new Schema({
	user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	party: { type: Schema.Types.ObjectId, required: true, ref: 'Party' },
	date_posted: { type: Date, default: Date.now },
	rating: { type: Number, default: 3},
	description: String
	// ... More to possibly come
});

var tagSchema = new Schema({
	created_by: { type: String, default: "Admin" },
	added_on: { type: Date, default: Date.now },
	data: String,
	// if tag is pending, it doesn't show up in search box results
	pending: { type: Boolean, default: true }

});

var User = mongoose.model('User', userSchema);
var Party = mongoose.model('Party', partySchema);
var Rating = mongoose.model('Rating', ratingSchema);
var Tag = mongoose.model('Tag', tagSchema);

module.exports.User = User;
module.exports.Party = Party;
module.exports.Rating = Rating;
module.exports.Tag = Tag;
module.exports.Mongoose = mongoose;

{created_by: data: "Lit", pending: false}