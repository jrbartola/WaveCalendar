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
        $('.modal-found').removeClass('invisible');
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
      scope.findParty = function() {
      	
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

      scope.squareOne = function() {
        $('.modal-found').addClass('animated zoomOut');

        $('.modal-found').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
          $('.modal-found').removeClass('animated zoomOut').addClass('invisible');
          $('.modal-inside').children().removeClass('invisible');

          scope.$apply(function() {
            scope.code = '';
            scope.state = 0;
          });
          
        });
        

        
      };

      scope.readableDate = function(datestring) {
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
      };
    },
    templateUrl: '../templates/partycode.html'
  };
});