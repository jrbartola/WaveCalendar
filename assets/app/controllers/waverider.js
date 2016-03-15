'use strict';

var waveRider = angular.module('waveCal');

// Factory that retrieves stored party objects from API based on codes
waveRider.factory('partyCodeFactory', function($http) {
  return {
    post: function(url, data) {
      
        return $http.post(url, data).then(function(resp) {
          return resp.data;
        });
    }
  }
});

waveRider.controller('WaveRiderCtrl', function($scope, partyCodeFactory) {
  // Scope view of 0 is the search by code box
  // Scope view of 1 is the resulted party returned by the search
  // Scope view of 2 is the create your party form
  // Scope view of 3 is the finished party creation message/modal
  $scope.view = 0;
  $scope.code = '';
  $scope.party = {};

  $scope.getParty = function() {
    

    partyCodeFactory.post('/api/partycode', {'code': $scope.code}).then(function(data) {
    	$scope.party = data;
    	
      // Erase the input box
    	$('#codebox').val('');
      // Take away the loading animation
      $('.modal-inside').removeClass('loading');
      if ($scope.party == null) {
        swal({title: "Uh Oh!",
          text: "We could not find a party " +
          "with that registration code.", 
          type: "error", 
          confirmButtonText: "Try again"
          },
          function() {
            $('.modal-inside').children().removeClass('invisible');
          });
      } else {
        $scope.view = 1;
      }
      
    	console.log($scope.party);
    });
  }

});

// Directive for retrieval of party by code
waveRider.directive('partycode', function($timeout) {
  
  return {
    restrict: 'AEC',
    scope: {
      party: '=',
      code: '=',
      onSearch: '&',
      state: '='


    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      scope.getParty = function() {
      	
      	if (scope.codemodel && scope.codemodel.length == 8) {
      		//scope.code = joincode;
      		// Zoom out the current form
      		$('.modal-inside').addClass('animated zoomOut');

          // Execute function when animation ends
          $('.modal-inside').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $('.modal-inside').removeClass('animated zoomOut').addClass('loading').children().addClass('invisible');
            // Search for party after loading animation appears
            scope.onSearch();
            scope.codemodel = '';
          });
        	
      	} else {
          
          $('#codeerror').fadeIn(1000, function() {
            setTimeout(function() {
              // Show the error for 5 seconds then make it disappear
              $('#codeerror').fadeOut(1000);
            }, 5000);
          });
        }
      };

      scope.sendCode = function() {
      	scope.code = scope.codemodel;
      };
    },
    templateUrl: '../templates/partycode.html'
  };
});