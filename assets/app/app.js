'use strict';

var app = angular.module('waveCal', ['ngAnimate'])

app.service('currentuserService', function($http) {
  var currentUser = null;

  var updateCurrentUser = function(callback) {
    $http.get('/api/currentuser').then(function(response) {
      currentUser = response.data;
      return callback(currentUser);
    });
  }

  var getCurrentUser = function() {
    return currentUser;
  }

  return {
    updateCurrentUser: updateCurrentUser,
    getCurrentUser: getCurrentUser
  };

});