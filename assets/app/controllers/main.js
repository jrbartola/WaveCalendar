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
	// Scope view of 0 is the description of wave calendar
	// Scope view of 1 is the login form
	// Scope view of 2 is the registration form; leads to dashboard
	// Scope view of 3 is the completed registration form; leads to user profile
	$scope.view = 0;
	$scope.email = '';
	$scope.pass = '';

  $scope.changeView = function(view) {

  }

  $scope.startLogin = function() {
    $.scrollTo($('#signup'), 800, {
      onAfter: function() {
        if ($scope.view != 1) {
          $("#bannertitles").find(':not(.ng-hide)').addClass('animated bounceOutLeft');
          $(".description").addClass('animated bounceOutLeft');
          $('#bannertitles').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $scope.$apply(function() {

              $scope.view = 1;
              $($("#bannertitles").children()[1]).addClass('animated bounceInRight');
              $(".signin").addClass('animated bounceInRight');

            });
          });
        }  
      }
    });

  }

  $scope.startRegister = function() {
    $.scrollTo($('#signup'), 800, {
      onAfter: function() {
        if ($scope.view != 2) {
          $("#bannertitles").find(':not(.ng-hide)').addClass('animated bounceOutLeft');
          $('#bannertitles').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $scope.$apply(function() {
              $scope.view = 2;
              $($("#bannertitles").children()[2]).addClass('animated bounceInRight');
            });
          });
        }
      }
    });
    
  }

});

// Directive for login/registration panel
main.directive('frontwave', function($timeout) {
  
  return {
    restrict: 'AEC',
    scope: {
      onLogin: '&',
      onRegister: '&'

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      // scope.function()...
      // scope.getemail = function() {
      // 	//console.log(scope.efield);
      // };
    },
    templateUrl: '../templates/frontwave.html'
  };
});

// Directive for login/registration panel
main.directive('bottombanner', function($timeout) {
  
  return {
    restrict: 'AEC',
    scope: {
      efield: '=',
      pfield: '=',
      onRegister: '&',
      view: '='

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      // scope.function()...
      scope.getemail = function() {
        console.log(scope.efield);
      };
    },
    templateUrl: '../templates/bottombanner.html'
  };
});