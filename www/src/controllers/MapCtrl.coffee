angular.module "controllers"
.controller 'MapCtrl', ( $scope, $http, Map, DataProvider ) ->

	$scope.routeInfo = undefined;
	$scope.map = undefined;0

	routePolyline = 5

	$scope.loadRoute = ( map_zoom ) ->

		routePolyline.setMap null
		routeInfoPromise = Map.fetchRouteNodes map_zoom - 2


		routeInfoPromise.success ( data ) ->
			route = Map.createRouteFromNodeArray data, map_zoom - 2

			routePolyline = Map.createPolylineFromRoute route

			routePolyline.setMap( $scope.map );



	$scope.initMap = ->
		# DataProvider.loadMapArea( 0 ).success ( data ) ->
		# 	console.log "loadMapArea"
		# 	console.log data

		routeInfoPromise = Map.fetchRouteNodes( 1 ) 

		routeInfoPromise.success ( data ) ->
			$scope.routeInfo = data;

			centerCoordinates = Map.createCoordinate data[0].lat, data[0].lon

			$scope.map = new google.maps.Map document.getElementById( "googleMap" ), Map.createMapProperties( centerCoordinates, 3 )
			$scope.map.getBounds()

			route = Map.createRouteFromNodeArray data, 1

			routePolyline = Map.createPolylineFromRoute route

			routePolyline.setMap( $scope.map );


			google.maps.event.addListener $scope.map,'zoom_changed', () ->
				$scope.loadRoute $scope.map.getZoom()

			google.maps.event.addListener $scope.map, "bounds_changed", () ->
				bounds = $scope.map.getBounds()
				console.log Map.calculateZoom bounds.Ca.j, bounds.Ca.k, bounds.pa.j, bounds.pa.k

	$scope.infoBoxes = []