'use strict';

var typeAhead = angular.module('waveCal');

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
      // console.log(data.filters + " is the data");
      // var req = {
      //   method: 'POST',
      //   url: url,
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   data: data
      // };
      return $http.post(url, data).then(function(resp) {
        console.dir(resp.data);
        //console.log(resp.data + " is the data");
        return resp.data;
      });
    }
  }
});


typeAhead.controller('TypeaheadCtrl', function($scope, filterFactory, partyFactory) { // DI in action
  filterFactory.get('/api/filters').then(function(data) {
    $scope.items = data;
  });

  partyFactory.post('/api/parties', {filters: ["Frat"]}).then(function(data) {
    $scope.parties = data;
  });

  $scope.chosen_ = [];
  $scope.limit = 4;

  $scope.name = ''; // This will hold the selected item
  $scope.onItemSelected = function() { // this gets executed when an item is selected
    //console.log('Chosen: ' + $scope.chosen_);
  };

  $scope.getParties = function() {
    partyFactory.post('/api/parties', {'filters': $scope.chosen_}).then(function(data) {
      $scope.parties = data;
    });
  };

  // $scope.onAdd = function() {
  //   console.log("Executed onADD()");
  //   if ($scope.chosen_.indexOf($scope.name) <= -1) {
  //     $scope.chosen_.push($scope.name);
  //     console.log('Pushed: ' + $scope.chosen_);
  //   }
      
  // }

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
      onChange: '&'
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
          }, 200);
        }
        
        scope.selected = true;
        
      };
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
        });
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

    },
    templateUrl: '../templates/wavefilter.html'
  };
});