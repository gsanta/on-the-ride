var module;

module = angular.module("services");

module.factory('BicycleRouteService', require('./services/BicycleRouteService'));

module.factory('MapPartitionService', require('./services/MapPartitionService'));
