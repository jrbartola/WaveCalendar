'use strict';

var app = angular.module('waveCal', ['ngAnimate'])

app.service('dataService', function() {
  var currentUser = {};

  var updateCurrentUser = function(callback) {
    $.get('/api/currentuser', function(response) {
      currentUser = response;
      return callback(response);
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