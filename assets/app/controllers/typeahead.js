'use strict';

angular.module('waveCal').controller('TypeaheadCtrl', function($scope, $http) {

  var _selected;

  $scope.selected = undefined;
  $scope.states = ['Lit','Pike','Savage','Paint','Dry','House','Frat'];
  // Any function returning a promise object can be used to load values asynchronously
  // $scope.getLocation = function(val) {
  //   return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
  //     params: {
  //       address: val,
  //       sensor: false
  //     }
  //   }).then(function(response){
  //     return response.data.results.map(function(item){
  //       return item.formatted_address;
  //     });
  //   });
  // };

  $scope.ngModelOptionsSelected = function(value) {
    if (arguments.length) {
      _selected = value;
    } else {
      return _selected;
    }
  };

  $scope.modelOptions = {
    debounce: {
      default: 500,
      blur: 250
    },
    getterSetter: true
  };

});