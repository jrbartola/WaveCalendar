'use strict';

var profile = angular.module('waveCal');

// Let's create an animation for the list of owner's waves
profile.animation('.prof-ownerwave', [function() {
  return {
  	enter: function(element, callback) {

  	  $(element).animate({height: '196px'}, 700);

  	},

  	leave: function(element, callback) {

  	}
  }
}]);


profile.controller('ProfileCtrl', function($timeout, $scope, $rootScope, dataService) {

	// Default the admin value to false until found otherwise
	$scope.admin = false;
	$scope.edit = false;
	$scope.changed = false;
	$scope.credChanged = {'username': false, 'email': false};

	$scope.settingsModal = {'display': 'none'};
	var username = window.location.pathname.substring(7);

	dataService.updateCurrentUser(function(cu) {
		$scope.$apply(function() {
			$rootScope.currentUser = cu;
			$rootScope.currentUser.new = {'location': {'city': cu.location.city,
		      'state': cu.location.state }, 'username': cu.username, 'email': cu.email};

			// If the current user is viewing their own profile, let them edit it
			$scope.admin = cu.username === username;
		});
		
	});
	
	$.get('/api/profile/' + username, function(resp) {

		$scope.$apply(function() {
			$scope.user = resp;
			var jd = new Date($scope.user.join_date);
			$scope.user.join_date = jd.toDateString().substring(4);
		});
		
	});

	$.get('/api/filters', function(f) {
    	$scope.filters = f;
    });

	$scope.readableDate = function(datestring) {
        // Convert date from nonsense into a readable string
        var d = new Date(datestring);
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var total;

        if (minutes < 10)
          minutes = "0" + minutes

        if (hours > 12) // Might show AM instead of PM for 12 o clock
          total = " " + (hours - 12) + ":" + minutes + " PM"
        else
          total = " " + hours + ":" + minutes + " AM"

        return d.toDateString() + total;
    }

    $scope.openSettings = function() {
    	$scope.settingsModal = {'display': 'block'};
    	$('body').addClass('modal-open');
    	$timeout(function() {
    		try {
    			$('#slick-settings').slick({slidesToShow: 3});
    		} catch(err) {
    			// Do nothing with this error
    		}
    	}, 80);
    	
    }

    $scope.closeSettings = function() {
    	$scope.settingsModal= {'display': 'none'};
    	$scope.party = $scope.newParty = {};
    	$scope.edit = false;
    	$('body').removeClass('modal-open');
    }

    $scope.removeParty = function(party) {
    	$.post('/api/party/remove', {'party': party}, function(resp) {
    		dataService.updateCurrentUser(function(cu) {
				$scope.$apply(function() {
					$rootScope.currentUser = cu;
				});
			});
    	});
    }

    // Function that monitors account settings changes
    // Returns true if the field passed in has been changed
    $scope.formChange = function(field) {
    	if (!$rootScope.currentUser)
    		return false;
    	if (field === 'state' || field === 'city') {
    		return $rootScope.currentUser.location[field] != $rootScope.currentUser.new.location[field];
    	} else {
    		return $rootScope.currentUser[field] != $rootScope.currentUser.new[field];
    	}
    }

    $scope.confirmChanges = function(wavez) {

    	// Saves changed user account information
    	if (wavez === false) {

    		swal({title: 'Are you sure?',
    		  text: 'Type your password to confirm these changes',
    		  type: 'input',
    		  showCancelButton: true,
    		  closeOnConfirm: false,
    		  inputType: 'password'
    		}, function(pass) {
    			if (pass === '' || pass != $rootScope.currentUser.password) {
    				swal.showInputError("Incorrect password");
    				return false;
    			}

    			$.post('/api/user/update', {'user_id': $rootScope.currentUser._id, 
    				'props': JSON.stringify($rootScope.currentUser.new)}, function(response) {
    				 console.log(response);

    				 swal({title: "All done!",
    				  text: "Your changes have been saved",
    				  type: "success",
	    			}, function() {
    					window.location.href = "/profile"
						
	    			});
    			});
    		});

    	// Saves a paticular wave's edited information
    	} else if (wavez === true) {

    		swal({title: 'Are you sure?',
    		  text: 'Type your password to confirm these changes',
    		  type: 'input',
    		  showCancelButton: true,
    		  closeOnConfirm: false,
    		  inputType: 'password'
    		}, function(pass) {
    			if (pass === '' || pass != $rootScope.currentUser.password) {
    				swal.showInputError("Incorrect password");
    				return false;
    			}

    			if ($scope.newParty.noRatio === true)
    				$scope.newParty.ratio = {'guys': 0, 'girls': 0}

    			$.post('/api/party/update', {'props': JSON.stringify($scope.newParty), 
    				'reg_code': $scope.party.reg_code}, function(response) {
    				 console.log(response);

    				swal({title: "All done!",
    				  text: "Your party has been updated.",
    				  type: "success",
	    			}, function() {
    					window.location.href = "/profile"
						
	    			});
    			});
    		});
    	}
    }

    // Returns true if the data hasn't been changed
    // This function is used to enable/disable the save button
    $scope.checkChanges = function(section) {
    	if (section === 'profile') {
    		var cu = $rootScope.currentUser;
	    	if (!cu)
	    		return true;
	    	return (cu.location.city === cu.new.location.city &&
	    		cu.location.state === cu.new.location.state &&
	    		cu.username === cu.new.username &&
	    		cu.email === cu.new.email && (!cu.new.password_orig || 
	    			cu.new.password_orig === '') && (!cu.new.password_confirm ||
	    			cu.new.password_confirm === ''));
    	} else if (section === 'waves') {
    		var p = $scope.party, np = $scope.newParty;
    		if (!p || !np || !p.filters || !p.ratio)
    			return true;
    		return (p.title === np.title && p.invite_only === np.invite_only &&
    			p.filters.sort().toString() === np.filters.sort().toString() &&
    			p.ratio.girls === np.ratio.girls && p.ratio.guys === np.ratio.guys &&
    			p.noRatio === np.noRatio);
    	}
    	
    }

    // Makes sure no two users have the same email/username
    $scope.checkField = function(field, value) {
    	// Eventually add support for the location.city field...
    	$.post('/api/users', {'field': field, 'value': value}, function(resp) {
    		//console.log("resp was " + resp);
    		$scope.$apply(function() {

    			if (resp === null || $rootScope.currentUser[field] === $rootScope.currentUser.new[field]) {
    				$scope.credChanged[field] = false;
    			} else {
    				$scope.credChanged[field] = true;
    			}
    			
    			
    		});
    		
    	});

    }

    $scope.editWave = function(wave) {
    	if ($scope.edit === false)
    		return;	
    	$scope.party = wave;
    	var p = $scope.party;
    	$scope.newParty = {'title': p.title, 'invite_only': p.invite_only, 'filters': p.filters,
          'ratio': {'girls': p.ratio.girls, 'guys': p.ratio.guys}};

    	$scope.party.noRatio = $scope.newParty.noRatio = wave.ratio.girls == 0 && wave.ratio.guys == 0;
    }

    $scope.showEditing = function() {
    	// Toggles the editing in settings
    	$scope.edit = !$scope.edit;
    	// Reset the party scope variable
    	$scope.party = $scope.newParty = {};

    }

    $scope.partyExists = function() {
    	// Returns true if the party exists
    	return !$.isEmptyObject($scope.party);
    }

    $scope.scrapWave = function(party) {
    	if (!$scope.partyExists())
    		return;

    	swal({title: 'Are you sure you want to delete ' + $scope.party.title + '?',
    		  text: 'This party will be erased from your list of created ' +
    		  'waves. Type your password to confirm these changes',
    		  type: 'input',
    		  showCancelButton: true,
    		  closeOnConfirm: false
    		}, function(pass) {
    			if (pass === '' || pass != $rootScope.currentUser.password) {
    				swal.showInputError("Incorrect password");
    				return false;
    			}

    			$.post('/api/party/remove', {'reg_code': party.reg_code}, function(resp) {
    				console.log(resp);

    				swal({title: "All done!",
    				  text: "Your party has been removed from our database",
    				  type: "success",
	    			}, function() {
    					window.location.href = "/profile"
						console.log("changed url");
	    				
	    			});
    			});
    		});
    }

    $scope.checkWaveEdit = function(field) {
    	// Return true if the user has modified the fields
    	var p = $scope.party, np = $scope.newParty;

    	if (!p || !np || !p.filters || !np.filters || !p.ratio || !np.ratio)
    		return false;

    	

    	if (field === 'filters') {
    		return p.filters.sort().toString() != np.filters.sort().toString();
    	} else if (field === 'ratio') {
    		return p.ratio.girls != np.ratio.girls || p.ratio.guys != np.ratio.guys || p.noRatio != np.noRatio;
    	}
    	
    	// Else check if the other fields were changed from their original value
    	return np[field] != p[field];


    }

});





// Directive for Slick Carousel
profile.directive('slicker', function($timeout) {
  
  return {
    restrict: 'A',
    scope: {
      ngModel: '='

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      $timeout(function() {
      	elem.slick({slidesToShow: 3,
        	slidesToScroll: 1
      	});
      }, 300);
      
    }
  };
});

// Directive for Profile Rating.js
profile.directive('rater', function($timeout, $rootScope) {
  return {
	  restrict: 'A',
	  scope: {
	  	curRating: '@rate',
	  	curParty: '@'
	  },
	  link: function(scope, elem, attrs) {
	  	scope[scope.curParty] = rating(elem[0], scope.curRating, 5, function(rating) {
	  		$.post('/api/rating', {'rating': parseInt(rating), 'party': scope.curParty, 'user': JSON.stringify($rootScope.currentUser)}, function(response) {
          		if (response == null) {
            		swal('No can do!', 'You must attend this party before you can rate it!', 'error');
            		scope[scope.curParty].setRating(scope.curRating, false);
          		} else {
            		scope[scope.curParty].setRating(response, false);
            		scope.curRating = response;
          		}
          
        	});
	  	});
	  }
	};
});