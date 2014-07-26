/// <reference path="../../../typings/angularjs/angular.d.ts" />

import MapService = require("../services/MapService");
import DataProviderService = require("../services/DataProviderService");

var ctrl = function( $scope,$http, MapService, DataProviderService ) {

	$scope.routeInfo = undefined;
	$scope.map = undefined;

	$scope.initMap = function() {
		var routeInfoPromise = DataProviderService.loadRouteInfo();

		routeInfoPromise.success( function( data ) {
			$scope.routeInfo = data;

			var centerCoordinates = MapService.createCoordinate( data[0].nodes[0].lat, data[0].nodes[0].lon );

			$scope.map = MapService.createMap( centerCoordinates, 12, document.getElementById( "googleMap" ) );

			for(var i = 0; i < data.length; i++) {
				MapService.addRoute( data[i].nodes, $scope.map )
			}
		})
	}

	$scope.infoBoxes = []
};

ctrl.$inject = [ '$scope','$http', 'MapService', 'DataProviderService'];

export = ctrl;
