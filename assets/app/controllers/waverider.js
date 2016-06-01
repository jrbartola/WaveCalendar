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

waveRider.controller('WaveRiderCtrl', function($rootScope, $timeout, $scope, partyCodeFactory, dataService) {
  // Scope view of 0 is the search by code box
  // Scope view of 1 is the resulted party returned by the search
  // Scope view of 2 is the create your party form
  // Scope view of 3 is the finished party creation message/modal
  // dataService.updateCurrentUser(function(cu) {
  //   $scope.$apply(function() {
  //     $scope.currentUser = cu;
  //   });
    
  // });
  $scope.view = 0;
  $scope.code = '';
  $scope.party = {};
  $scope.owner = '';

  // Set filters for the registration panel
  $scope.filters = [];
  // Chosen filters
  $scope.chosen = [];

  $.get('/api/filters', function(filters) {
    $scope.filters = filters;
  });

  // Set registration panel invite to false
  $scope.invite = false;

  $scope.getParty = function() {
    

    partyCodeFactory.post('/api/partycode', {'code': $scope.code}).then(function(data) {
      // Set current party
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
        // Get the real owner's name based on the id field
        partyCodeFactory.post('/api/users', {'field': '_id', 'value': $scope.party.owner}).then(function(owner) {
          
          if (owner == null)
            console.error("Found user was null");

          $scope.party.owner = owner.username;
          $('.modal-found').removeClass('invisible');
          $scope.view = 1;
          

        });
      }
      
    });
  }

  $scope.attendParty = function(wave) {

    $.post('/api/users', {'party': wave}, function(response) {
      // IF the user isn't already going to the party
      if (response) {
        var props = {title: "You're Going!",
          text: "The creator of the party " +
          "has been notified of your attendance.", 
          type: "success", 
          confirmButtonText: "Okay"}
      } else {
        var props = {title: "Uh Oh!",
          text: "You are already on the guest list " +
          "for this party.", 
          type: "error", 
          confirmButtonText: "Okay"}
      }
      // Flash sweet alert with message
      swal(props, function() {

        dataService.updateCurrentUser(function(cu) {
          $scope.$apply(function() {
            $rootScope.currentUser = cu;
          });
        });
        //$scope.initialView();
      });

    });
  }

  $scope.initialView = function() {
    $('.modal-found').addClass('animated zoomOut');

    $('.modal-found').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
      $('.modal-found').removeClass('animated zoomOut').addClass('invisible');
      $('.modal-inside').children().removeClass('invisible');

      $scope.$apply(function() {
        $scope.code = '';
        $scope.view = 0;
      });
      
    });
    
    
  };

  $scope.checkInvite = function() {
    if ($scope.invite == true)
      return "These will only be seen by people with the party registration code"
    else
      return "Add tags to help people find your party!"
  }

  $scope.openModal = function() {
    $('#myModal').css('display', 'block');
    // Prevent users from scrolling using boostrap's built in class
    $('body').addClass('modal-open');
  }

  $scope.closeModal = function() {
    $('#myModal').fadeOut();
    // Let users resume scrolling
    $('body').removeClass('modal-open');
  }

  $scope.validate = function() {
    // Check to make sure date & times make chronological sense

    // First see if all fields are filled out so we avoid errors
    if (!($scope.time && $scope.time.end))
      return;

    var dStart = new Date($scope.date.start + " " + $scope.time.start);
    var dEnd = new Date($scope.date.end + " " + $scope.time.end);

    // If the ending date is in wrong order, set both to starting date
    if (dEnd < dStart) {
      $timeout(function() {
        $scope.date.end = $scope.date.start;
        $('input.date.end').val($scope.date.start);
        $scope.time.end = $scope.time.start;
        $('input.time.end').val($scope.time.start);
      }, 200);
    }

  }

  

  $scope.createWave = function() {
    // Props representing the new wave form submission
    var wave = $scope.wave;
    var startD = new Date($scope.date.start + " " + $scope.time.start);
    var endD = new Date($scope.date.end + " " + $scope.time.end);
    // Check if a ratio was established
    if ($scope.noRatio == true)
      var guys = 0, girls = 0;
    else
      var guys = $scope.ratio.guys, girls = $scope.ratio.girls;

    var props = {'title': wave.name, 'location': {'street': wave.address,
      'city': wave.city, 'zip_code': wave.zip_code}, 'time': {'start': startD, 
      'end': endD}, 'invite_only': $scope.invite, 'ratio': {'guys': guys, 'girls': girls},
      'filters': $scope.filterAdd};

    console.dir(props);
    $.post('/api/create', {'properties': JSON.stringify(props)}, function(resp) {
      if (resp) {
        swal({title: "All Done!",
          text: "Your party has been created.", 
          type: "success", 
          confirmButtonText: "Okay"}, function() {
            // Execute after the form has been returned successfully
            $scope.closeModal();
            // Reset the form
            $('.wavemaker').trigger('reset');
          });
      }
    });

      
  }

});

// Directive for retrieval of party by code
waveRider.directive('partycode', function($timeout) {
  
  return {
    restrict: 'AE',
    scope: {
      party: '=',
      code: '=',
      onSearch: '&',
      state: '=',
      onAttend: '&',
      squareOne: '&',
      onCreate: '&'

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

// Directive for DatePicker
waveRider.directive('datePicker', ['$timeout', function($timeout){
  return {
    restrict: 'AC',
    scope: {
      ngModel: '=',
      checkDate: '&'
    },
    link: function (scope, element) {
      
      element.on('change', function() {
        scope.checkDate();
      });
      element.datepicker({
        startDate: "0d",
        format: 'mm/dd/yyyy',
        autoclose: true,
        todayHighlight: true
      });
    }
  }
}]);

// Directive for TimePicker
waveRider.directive('timePicker', ['$timeout', function($timeout) {
    return {
        restrict: 'AC',
        scope: {
            ngModel: '=',
            checkTime: '&'
        },
        link: function (scope, element) {
            
            element.on('change', function() {
              scope.checkTime();
            });
            element.timepicker({
                timeFormat: 'h:i A',
                forceRoundTime: true
            });
        }
    };
}]);



// Directive for datepair
waveRider.directive('datePair', [function() {
  
  return {
    restrict: 'AC',
    link: function(scope, elem) {
      // insert scope functions here
      elem.datepair();
    }

    };
}]);

