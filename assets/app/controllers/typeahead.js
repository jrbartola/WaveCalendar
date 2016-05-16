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


// Factory that retrieves stored filter objects from API
typeAhead.factory('filterFactory', function($http) {
  return {
    get: function(url) {
      return $http.get(url).then(function(resp) {
        return resp.data;
      });
    }
  }
});

// Factory that retrieves stored party objects from API
typeAhead.factory('partyFactory', function($http) {
  return {
    post: function(url, data) {
      
      if (data) {
        return $http.post(url, data).then(function(resp) {
        
          return resp.data;
        });
      } else {
        return $http.post(url).then(function(resp) {
        
          return resp.data;
        });
      }
      
    }
  }
});


typeAhead.controller('TypeaheadCtrl', function($scope, filterFactory, partyFactory) { // DI in action
  
  //Use filterFactory to get the current user from API
  filterFactory.get('/api/currentuser').then(function(data) {
    $scope.currentUser = data;
    $scope.location = data.location;
    // originally filter by current city of user

    partyFactory.post('/api/parties', {'location': $scope.location.city}).then(function(data) {
      $scope.parties = data;
      
      
    });
  });

  $scope.chosen_ = [];
  $scope.limit = 4;

  filterFactory.get('/api/filters').then(function(data) {
    // Gets filters 
    $scope.items = data;
  });


  $scope.distance = -1; // Holds distance/location filter
  $scope.name = ''; // This will hold the selected item

  $scope.addParty = function(party) {
    $scope.parties.push(party);
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
    partyFactory.post('/api/parties', {'filters': filData, 'location': locData}).then(function(data) {
      
      // Use $scope.$apply() eventually..
      $.each(data, function(index, value) {
        var address = value.location.street + ", " + value.location.city + ", " + value.location.zip_code;
        
        getDistance(address, function(distance) {

          if (locData || (!locData && distance < $scope.distance)) {
            dropPin(address, value.title);
            $scope.$apply(function() {
              $scope.parties.push(value);
            });
            
          }
          
          
        });
      });


    });
  };


});

typeAhead.directive('typeahead', function($timeout) {
  return {
    restrict: 'AEC',
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
      // Set location box dialogue
      scope.location = "Within my city";
      $('#loc-dropdown').html(scope.location + ' <span class="caret"></span>');

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
typeAhead.directive('wavefilter', function($timeout) {
  
  return {
    restrict: 'AEC',
    scope: {
      filters: '=',
      waves: '=',
      title: '@',
      location: '@',
      street: '@',
      city: '@',
      zipCode: '@'

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      scope.centerMap = function(party) {
        var address = party.location.street + ", " + party.location.city + ", " + party.location.zip_code;
        setCenter(address, party.title);
      }
    },
    templateUrl: '../templates/wavefilter.html'
  };
});