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


profile.controller('ProfileCtrl', function($scope) {
	
	
	var username = window.location.pathname.substring(7);
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