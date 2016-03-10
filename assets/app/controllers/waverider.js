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
  $scope.create = false;
  $scope.code = '';
  $scope.party = {};

  $scope.getParty = function(code) {
    partyCodeFactory.post('/api/partycode', {'code': $scope.code}).then(function(data) {
    	$scope.party = data;
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
      onSearch: '&'


    },
    link: function(scope, elem, attrs) {
      // insert scope functions here
      
    },
    templateUrl: '../templates/partycode.html'
  };
});