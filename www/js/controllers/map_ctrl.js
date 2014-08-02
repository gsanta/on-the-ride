define(function () {
    'use strict';
    
	var ctrl = function( $scope,$http, Map, DataProvider ) {

		$scope.routeInfo = undefined;
		$scope.map = undefined;

		$scope.initMap = function() {
			var routeInfoPromise = DataProvider.loadRouteInfo();

			routeInfoPromise.success( function( data ) {
				$scope.routeInfo = data;

				var centerCoordinates = Map.createCoordinate( data[0].nodes[0].lat, data[0].nodes[0].lon );

				$scope.map = Map.createMap( centerCoordinates, 12, document.getElementById( "googleMap" ) );

				for(var i = 0; i < data.length; i++) {
					Map.addRoute( data[i].nodes, $scope.map )
				}
			})
		}

		$scope.infoBoxes = []
	};

    ctrl.$inject = [ '$scope','$http', 'MapService', 'DataProviderService'];
    return ctrl;

});