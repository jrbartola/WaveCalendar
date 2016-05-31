'use strict';

var profile = angular.module('waveCal');

// Let's create an animation for the list of owner's waves
profile.animation('.prof-ownerwave', [function() {
  return {
  	enter: function(element, callback) {
  	  $(element).slideDown(600);
  	  // Set display back to flex
  	  $(element).css('display', 'flex');

  	},

  	leave: function(element, callback) {

  	}
  }
}]);

profile.controller('ProfileCtrl', function($scope) {
	
	
	var username = window.location.pathname.substring(7);
	$.get('/api/profile/' + username, function(resp) {

		$scope.$apply(function() {
			$scope.user = resp;
			var jd = new Date($scope.user.join_date);
			$scope.user.join_date = jd.toDateString().substring(4);
		});
		
	});
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
      elem.slick({slidesToShow: 3,
        slidesToScroll: 1
      });
    }
  };
});

// Directive for Profile Rating.js
profile.directive('rater', function($timeout) {
  return {
	  restrict: 'A',
	  scope: {
	  	curRating: '@rate',
	  	curParty: '@'
	  },
	  link: function(scope, elem, attrs) {
	  	rating(elem[0], scope.curRating, 5);
	  }
	};
});