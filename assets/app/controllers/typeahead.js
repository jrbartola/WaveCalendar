'use strict';

var typeAhead = angular.module('waveCal');
// var currentUser = {
//   "_id": "56a57f04ffcb285132897740",
//   "name": {
//     "first": "Jesse",
//     "last": "Bartola"
//   },
//   "email": "jrbartola@gmail.com",
//   "password": "pass123",
//   "location": {
//     "city": "Amherst",
//     "state": "MA"
//   },
//   "num_parties": 0,
//   "attended_parties": 0,
//   "rated_parties": 0,
//   "join_date": 1453686532283,
//   "num_logins": 0
// }

typeAhead.animation('.wave', [function() {
  return {
    enter: function(element, callback) {

      $(element).animate({height: '155px'}, 700);

    },

    leave: function(element, callback) {
      $(element).animate({height: '0px'}, 500, function() {
        $(element).remove();
      });
    }
  }
}]);



typeAhead.controller('TypeaheadCtrl', function($rootScope, $scope, $http, $timeout, currentuserService) { // DI in action
  
  // Use currentuserService to get user data from API
  currentuserService.updateCurrentUser(function(cu) {
    $rootScope.currentUser = cu;
    $scope.location = cu.location;

    // If the client does not currently have a registered username,
    // prompt them to create one
    if (!$rootScope.currentUser.username) {
      swal({title: "You don't have a username yet!",
        text: "Usernames allow others to identify you. " +
        "You must also have a username in order to have a profile.",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Username"}, 
        function(newusername) { 
          if (newusername === false)
            return false;
          if (newusername === "") { 
            swal.showInputError("Please enter a username");
            return false;
          } else {
            $.post('/api/users', {'username': newusername, 'add': true}, function(newname) {
              if (newname.success === true) {
                swal("Nice!", "Your username is now " + newusername, "success");
                
                  // Refresh data
                  dataService.updateCurrentUser(function(cu2) {
                    $scope.$apply(function() {
                      $rootScope.currentUser = cu2;
                    });
                    
                  });
                
              } else {
                swal.showInputError("That name is already taken, try another one.");
                return false;
              }
                
            });
          } 
      });
    }
  
  

    
  // originally filter by current city of user

    $http.post('/api/party/location', {'location': $scope.location.city}).then(function(data) {
      $scope.parties = [];
      $.each(data.data, function(index, party) {
        // Find rating of each initial party that shows when a user logs in
        $scope.findRating(party, function(newparty) {
          $scope.addParty(newparty);
        });
      });
      
    });
  });

  $scope.chosen_ = []; // Contains selected filters
  $scope.distance = -1; // Holds distance/location filter
  $scope.name = ''; // This will hold the selected item

  $http.get('/api/filters').then(function(resp) {
    // Gets filters 
    $scope.items = resp.data;
  });


  

  $scope.findRating = function(party, callback) {
    $http.get('/api/rating/' + party.reg_code + '/' + $rootScope.currentUser.username).then(function(rate) {
      // Set to 0 if user has not rated this party before
      if (!rate)
        rate = 0;
      else
        rate = rate.rating;

      party.rating = {'user': rate, 'average': party.rating}
      return callback(party);
    });
  }

  $scope.addParty = function(party) {
    $scope.$apply(function() {
      $scope.parties.push(party);
      // Wait 200 ms before filling in the stars
      $timeout(function() {
        for (var i = 5; i > 0; i--) {
          if (i <= party.rating.user)
           $('#' + party.reg_code + '-rate').find('[data-index=' + (i - 1) + ']').addClass('is-active');
        }
      }, 200);
      
    });
  }

  $scope.getParties = function() {
    // Clear markers when new tags are invoked
    var locData; // Temporary variable sending the current city if that is the current location filter
    var filData; // Temporary variable storing the list of filters, or null if the list is empty
    if ($scope.distance == 0)
      locData = $scope.location.city;
    else
      locData = null;

    if ($scope.chosen_.length != 0)
      filData = $scope.chosen_;
    else
      filData = null;

    $scope.parties = [];
    clearMarkers();
    $http.post('/api/party/location', {'filters': filData, 'location': locData}).then(function(data) {
      
      $.each(data, function(index, value) {
        var address = value.location.street + ", " + value.location.city + ", " + value.location.zip_code;
        
        getDistance(address, function(distance) {

          if (locData || (!locData && distance < $scope.distance)) {
            dropPin(address, value.title);
              // Poll the db for the user's rating of the individual party
            $scope.findRating(value, function(newvalue) {
              $scope.addParty(newvalue);
            });
                
          }

        });
      });

    });
  };


});

typeAhead.directive('typeahead', function($timeout) {
  return {
    restrict: 'AE',
    scope: {
      items: '=',
      prompt: '@',
      title: '@',
      subtitle: '@',
      model: '=',
      onSelect: '&',
      chosen: '=',
      onChange: '&',
      location: '='
    },
    link: function(scope, elem, attrs) {
      scope.handleSelection = function(selectedItem) {
        scope.model = selectedItem;
        scope.current = 0;

        if (scope.chosen.indexOf(selectedItem) <= -1) {
          scope.chosen.push(selectedItem);
          $timeout(function() {
            // Gets parties
            scope.onChange();
            // Clear value of text box
            $('#tagbox').val("");
          }, 200);
        }
        
        scope.selected = true;
        
      };
      
      // A location of 0 tells the controller to search within current city
      scope.location = 0;
      // Set location box dialogue
      $('#loc-dropdown').html("Within my city" + ' <span class="caret"></span>');

      scope.chosen = [];
      scope.current = 0;

      scope.selected = true; // hides the list initially
      scope.isCurrent = function(index) {
        return scope.current == index;
      };

      scope.setCurrent = function(index) {
        
        scope.current = index;
      };

      scope.removeItem = function(index) {
        scope.chosen.splice(index, 1);
        $timeout(function() {
          scope.onChange();
        }, 200);
      };
      scope.setText = function(text, distance) {
        $('#loc-dropdown').html(text + ' <span class="caret"></span>');
        scope.location = distance;
        $timeout(function() {
          scope.onChange();
        }, 200);
      }

      scope.clearTags = function() {
        scope.chosen = [];
        $timeout(function() {
          scope.onChange();
        }, 200);
      }

    },
    templateUrl: '../templates/typeahead.html'
  };
});

// Directive for list of waves
typeAhead.directive('wavefilter', function($timeout, $rootScope) {
  
  return {
    restrict: 'AE',
    scope: {
      filters: '=',
      waves: '=',
      title: '@',
      location: '@'

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here

      scope.iterate = function(starnum, deselect, party) {
        
          var curRating = parseInt($('#' + party + '-rate').attr('data-rating'));
          for (var i = 5; i > 0; i--) {
            var curStar = $('#' + party + '-rate').find('[data-index=' + (i - 1) + ']');
            if ((i <= starnum + 1 && !deselect) || (i <= curRating && deselect)) {
              curStar.addClass('is-active');
            } else {
              curStar.removeClass('is-active');
            }
          }
        
      }

      scope.sendRate = function(rating, party) {
        $.post('/api/rating', {'rating': parseInt(rating), 'party': party, 'user': JSON.stringify($rootScope.currentUser)}, function(response) {
          if (response == null) {
            swal('No can do!', 'You must attend this party before you can rate it!', 'error');
          } else {
            $('#' + party + '-rate').attr('data-rating', response);
          }
          
        });
      }

      scope.centerMap = function(party) {
        // Timeout to prevent reaching query limit error
        $('.media-left.media-middle').css('pointer-events', 'none');
        $timeout(function() {
          $('.media-left.media-middle').css('pointer-events', 'auto');
        }, 1500);
        var address = party.location.street + ", " + party.location.city + ", " + party.location.zip_code;
        setCenter(address, party.title);
      }
    },
    templateUrl: '../templates/wavefilter.html'
  };
});