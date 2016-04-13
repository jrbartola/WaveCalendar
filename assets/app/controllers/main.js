'use strict';

var main = angular.module('waveCal');

// Login verification factory
main.factory('loginFactory', function($http) {
  return {
    post: function(url, data) {
        return $http.post(url, data).then(function(resp) {
          return resp.data;
        });
    }
  }
});

main.controller('MainCtrl', function($scope, loginFactory) {
	// Scope view of 0 is the initial wave cal/login/register box
	// Scope view of 1 is the login loading animation
	// Scope view of 2 is the registration form
	// Scope view of 3 is the completed registration form; leads to user profile
	$scope.view = 0;
	$scope.email = '';
	$scope.pass = '';

	$scope.registration = function() {

	}
});

// Directive for login/registration panel
main.directive('frontwave', function($timeout) {
  
  return {
    restrict: 'AEC',
    scope: {
      efield: '=',
      pfield: '=',
      onRegister: '&'

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      // scope.function()...
      scope.getemail = function() {
      	console.log(scope.efield);
      };
    },
    templateUrl: '../templates/frontwave.html'
  };
});