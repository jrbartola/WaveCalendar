'use strict';

var profile = angular.module('waveCal');

profile.controller('ProfileCtrl', function($scope) {
	
	//$scope.user = {'username': 'barf'};
	var username = window.location.pathname.substring(7);
	$.post('/api/users', {'username': username}, function(resp) {

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
      elem.slick({slidesToShow: 4,
        slidesToScroll: 1});
    }
  };
});