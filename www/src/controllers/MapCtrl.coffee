angular.module "controllers"
.controller 'MapCtrl', ( $scope, $http, Map, DataProvider ) ->

	$scope.routeInfo = undefined;
	$scope.map = undefined;

	$scope.initMap = ->
		# DataProvider.loadMapArea( 0 ).success ( data ) ->
		# 	console.log "loadMapArea"
		# 	console.log data

		routeInfoPromise = Map.fetchRouteNodes( 0 )

		routeInfoPromise.success ( data ) ->
			console.log "route"
			console.log data
			$scope.routeInfo = data;

			centerCoordinates = Map.createCoordinate data[0].lat, data[0].lon

			$scope.map = Map.createMap centerCoordinates, 12, document.getElementById "googleMap"

			Map.createRootFromNodeArray data, data[0], $scope.map

	$scope.infoBoxes = []