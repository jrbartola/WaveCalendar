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
    		$('#slick-settings').slick({slidesToShow: 3});
    	}, 80);
    	
    }

    $scope.closeSettings = function() {
    	$scope.settingsModal= {'display': 'none'};
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
    $scope.formChange = function(field) {
    	if (!$rootScope.currentUser)
    		return false;
    	if (field === 'state' || field === 'city') {
    		return $rootScope.currentUser.location[field] != $rootScope.currentUser.new.location[field];
    	} else {
    		return $rootScope.currentUser[field] != $rootScope.currentUser.new[field];
    	}
    }

    $scope.confirmChanges = function() {
    	swal({title: 'Are you sure?',
    		  text: 'Type your password to confirm these changes',
    		  type: 'input',
    		  showCancelButton: true,
    		  closeOnConfirm: false
    		}, function(pass) {
    			if (pass === '' || pass != $rootScope.currentUser.password) {
    				swal.showInputError("Incorrect password");
    				return false;
    			}

    			swal("All done!", "Your changes have been saved", "success");
    		});
    }

    $scope.checkChanges = function() {
    	var cu = $rootScope.currentUser;
    	if (!cu)
    		return true;
    	return (cu.location.city === cu.new.location.city &&
    		cu.location.state === cu.new.location.state &&
    		cu.username === cu.new.username &&
    		cu.email === cu.new.email && (!cu.new.password_orig || 
    			cu.new.password_orig === '') && (!cu.new.password_confirm ||
    			cu.new.password_confirm === ''));
    }

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