/// <reference path="../../../typings/angularjs/angular.d.ts" />

import MapService = require('services/MapService');
import MarkerService = require('services/MarkerService');
import DataProviderService = require('services/DataProviderService');

var services = angular.module('services', []);


services.factory('MapService', MapService);
services.factory('MarkerService', MarkerService);
services.factory('DataProviderService', DataProviderService);

export = services;
