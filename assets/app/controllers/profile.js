'use strict';

var profile = angular.module('waveCal');

profile.controller('ProfileCtrl', function($scope) {
	
	//$scope.user = {'username': 'barf'};
	$.get('/api/currentuser', function(resp) {
		$scope.$apply(function() {
			$scope.user = resp;
			var jd = new Date($scope.user.join_date);
			$scope.user.join_date = jd.toDateString().substring(4);
		});
		
	});
});





// // Directive for profile sidebar
// main.directive('profsidebar', function($timeout) {
  
//   return {
//     restrict: 'AEC',
//     scope: {
      

//     },
//     link: function(scope, elem, attrs) {
//       // insert scope functions here
      
//     },
//     templateUrl: '../templates/profilesidebar.html'
//   };
// });