'use strict';

var main = angular.module('waveCal');

// Login/Registration verification factory
main.factory('formFactory', function($http) {
  return {
    post: function(url, data) {
        return $http.post(url, data).then(function(resp) {
          return resp.data;
        });
    }
  }
});

main.controller('MainCtrl', function($scope, formFactory) {
	// Scope view of 0 is the description of wave calendar
	// Scope view of 1 is the login form
	// Scope view of 2 is the registration form; leads to dashboard
	// Scope view of 3 is the completed registration form; leads to user profile
	$scope.view = 0;
  $scope.login = {'email': '', 'pass': ''}
  $scope.reg = {'email': '', 'pass': ''}

  $scope.name = {'first': '', 'last': ''}
  $scope.location = {'state': '', 'city': ''}

  $scope.changeBanner = function(state) {
    // State of 1 is login form, state of 2 is registration
    $.scrollTo($('#signup'), 800, {
      onAfter: function() {
        if ($scope.view != state) {
          var title = $("#bannertitles").find(':not(.ng-hide)');
          var body = $(".body-form").children().filter(":not(.ng-hide)");
          title.addClass('animated bounceOutLeft');
          body.addClass('animated bounceOutLeft');
          title.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $scope.$apply(function() {

              $scope.view = state;
              // Remove animation frames so the function works properly next time
              title.removeClass('animated bounceOutLeft');
              body.removeClass('animated bounceOutLeft');
              $($("#bannertitles").children()[state]).addClass('animated bounceInRight').one('webkitAnimationEnd mozAnimationEnd ' +
                'MSAnimationEnd oanimationend animationend', function() {

                // Remove animation classes right after it happens
                $($("#bannertitles").children()[state]).removeClass('animated bounceInRight');
              });

              if (state == 1)
                $(".signin").addClass('animated bounceInRight');
              else
                $(".register").addClass("animated bounceInRight");
                

            });
          });
        }  
      }
    });
  }

  $scope.register = function() {
    if ($scope.name.first != '' && $scope.name.last != '' && $scope.reg.email != '' &&
      $scope.location.city != '' && $scope.location.state != '') {

     
      var submission = {'name': $scope.name, 'email': $scope.reg.email, 
        'password': $scope.reg.pass, 'location': $scope.location, 'attending': []};
            
      formFactory.post('/api/register', {'props': submission}).then(function(data) {

        if (data === null) {
          swal({title: "Uh Oh!",
            text: "That email is taken. Try another one", 
            type: "error", 
            confirmButtonText: "Try again"
            },
            function() {
              $scope.$apply(function() {
                // Erase email and password fields
                $('#reg-email').val('');
                $('#reg-pass').val('');
              });
              
          });
        } else {
          swal({title: "All Done!",
            text: "Please wait a moment...", 
            type: "success", 
            timer: 5000,
            showConfirmButton: false
            },
            function() {
              $scope.$apply(function() {
                $('.register').trigger('.reset');
              });
              
          });
        }
      });
      
      
    }
    
  }

  $scope.login = function() {
    formFactory.post('/login', {'email': $scope.login.email, 'password': $scope.login.pass}).then(function(data) {
      if (data) {
        swal({title: "Logging in",
            text: "Please wait a moment...", 
            type: "success", 
            timer: 3000,
            showConfirmButton: false
          });
        setTimeout(function() {
          window.location.href = '/';
        }, 3000);
        
      } else {
        swal({title: "Uh Oh!",
          text: "Wrong email/password", 
          type: "error", 
          confirmButtonText: "Try again"
          },
          function() {
            $scope.$apply(function() {
              // Erase password field
              $("#passwrd").val('');
            });
              
        });
      }
    });
  }


});


// Directive for login/registration panel
main.directive('bottombanner', function($timeout) {
  
  return {
    restrict: 'AEC',
    scope: {
      efield: '=',
      pfield: '=',
      view: '=',
      fname: '=',
      lname: '=',
      stateabb: '=',
      city: '=',
      esignup: '=',
      psignup: '=',
      sendsignup: '&',
      sendlogin: '&'

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      // scope.function()...
      scope.completeRegister = function() {
        
        if (scope.psignup != '' && scope.psignup.length > 8) {
          scope.sendsignup();
        } else {
          console.log("password too short");
        }
        
        
      }

      scope.completeLogin = function() {
        scope.sendlogin();
      }
    },
    templateUrl: '../templates/bottombanner.html'
  };
});