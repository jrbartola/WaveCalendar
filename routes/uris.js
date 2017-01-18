'use strict'

/* WaveCalendar URI routing functions */

exports.auth = function(req, res, next) {
	//
	// For testing purposes only!!!
	// 
	db.loginUser('jrbartola@gmail.com', 'pass123', function(user) {
		if (!user) {
			res.json(null);
		} else {
			db.updatePartyStatuses();
			db.updateLogins('jrbartola@gmail.com');
			req.session.user = user;
		}
	});
	//
	//
	//
    if (req.session && req.session.user) {
        return next();
  	} else {
  	    return res.sendFile(__dirname + "/assets/templates/index.html");
	}  
};

exports.loginUserData = function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	db.loginUser(email, password, function(user) {
		if (!user) {
			res.json(null);
		} else {
			db.updatePartyStatuses();
			db.updateLogins(email);
			req.session.user = user;
			res.json(user);
		}
	});
};

exports.retrieveProfileData = function(req, res) {
	db.getUser('username', req.params.profile, function(usr) {
		if (usr === null) {
			res.redirect('/404');
		} else {
			res.sendFile(__dirname + "/assets/templates/profile.html");
		}
	});
};