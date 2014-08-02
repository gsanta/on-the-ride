angular.module "controllers"
.controller 'MapCtrl', ( $scope,$http, Map, DataProvider ) ->

	$scope.routeInfo = undefined;
	$scope.map = undefined;

	$scope.initMap = ->
		routeInfoPromise = DataProvider.loadRouteInfo();

		routeInfoPromise.success ( data ) ->
			$scope.routeInfo = data;

			centerCoordinates = Map.createCoordinate data[0].nodes[0].lat, data[0].nodes[0].lon

			$scope.map = Map.createMap centerCoordinates, 12, document.getElementById "googleMap"

			Map.addRoute dataItem.nodes, $scope.map for dataItem in data

	$scope.infoBoxes = []