define([
  'angular', 
  'uiRouter',
  'controllers/index',
  'services/index',
  'ionicAngular'
  ], function (angular, uiRouter) {
    'use strict';

    var app = angular.module('app', [
            'ionic',
            'controllers',
            'services',
            'ui.router']);

    return app;
});