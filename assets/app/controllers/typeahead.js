'use strict';

var typeAhead = angular.module('waveCal');
var currentUser = {
  "_id": "56a57f04ffcb285132897740",
  "name": {
    "first": "Jesse",
    "last": "Bartola"
  },
  "email": "jrbartola@gmail.com",
  "password": "pass123",
  "location": {
    "town": "Amherst",
    "state": "MA"
  },
  "num_parties": 0,
  "attended_parties": 0,
  "rated_parties": 0,
  "join_date": 1453686532283,
  "num_logins": 0
}


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
  
  $scope.location = currentUser.location; // Replace this eventually with function that retrieves user loc data
  $scope.chosen_ = [];
  $scope.limit = 4;

  filterFactory.get('/api/filters').then(function(data) {
    $scope.items = data;
  });


  // originally filter by current town of user
  partyFactory.post('/api/parties', {'location': $scope.location.town}).then(function(data) {
    $scope.parties = data;
    
    
  });

  
  $scope.distance = -1; // Holds distance/location filter
  $scope.name = ''; // This will hold the selected item
  $scope.onItemSelected = function() { // this gets executed when an item is selected
    //console.log('Chosen: ' + $scope.chosen_);

  };

  $scope.addParty = function(party) {
    $scope.parties.push(party);
  }

  $scope.getParties = function() {
    // Clear markers when new tags are invoked
    var locData; // Temporary variable sending the current town if that is the current location filter
    var filData; // Temporary variable storing the list of filters, or null if the list is empty
    if ($scope.distance == 0)
      locData = $scope.location.town;
    else
      locData = null;

    if ($scope.chosen_.length != 0)
      filData = $scope.chosen_;
    else
      filData = null;

    var parts = [];
    $scope.parties = [];
    clearMarkers();
    partyFactory.post('/api/parties', {'filters': filData, 'location': locData}).then(function(data) {
      
      // Use $scope.$apply() eventually..
      $.each(data, function(index, value) {
        var address = value.location.street + ", " + value.location.town + ", " + value.location.zip_code;
        
        getDistance(address, function(distance) {

          if (locData) {
            dropPin(address, value.title);
            
            $scope.parties.push(value);
          } else if (!locData && distance < $scope.distance) { // drop pin if party is within 1 mile, change later to accomodate
            dropPin(address, value.title);
            
            $scope.parties.push(value);
          } else {
            //console.log("locData is : " + locData + " and " + distance + " is greater than " + $scope.distance);
            
          }

          // Hack to get around weird bug that prevents parties from showing up
          // $scope.$apply will fix this..
          if (index + 1 == data.length) {
            $('#add').click();
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
            scope.onSelect();
            scope.onChange();
            // Clear value of text box
            $('#tagbox').val("");
          }, 200);
        }
        
        scope.selected = true;
        
      };
      // Set location box dialogue
      scope.location = "Within my town";
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
      town: '@',
      zipCode: '@'

    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      scope.centerMap = function(party) {
        var address = party.location.street + ", " + party.location.town + ", " + party.location.zip_code;
        setCenter(address);
      }
    },
    templateUrl: '../templates/wavefilter.html'
  };
});