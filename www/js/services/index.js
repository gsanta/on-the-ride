define(function (require) {

    'use strict';

    var angular = require('angular'),
        services = angular.module('services', []);

    services.factory('MapService', require('services/map_service'));
    services.factory('MarkerService', require('services/marker_service'));
    services.factory('DataProviderService', require('services/data_provider_service'));
    
    return services;

});