angular.module "controllers"
.controller 'MapCtrl', ( $scope, $http, Map, DataProvider ) ->

	$scope.routeInfo = undefined;
	$scope.map = undefined;0

	routePolyline = 5

	$scope.loadRoute = ( map_zoom ) ->
		console.log "loadRoute lefut"
		routePolyline.setMap null
		routeInfoPromise = Map.fetchRouteNodes( map_zoom - 3 )


		routeInfoPromise.success ( data ) ->
			route = Map.createRouteFromNodeArray data, map_zoom - 3

			routePolyline = Map.createPolylineFromRoute route

			routePolyline.setMap( $scope.map );



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

			$scope.map = Map.createMap centerCoordinates, 3, document.getElementById "googleMap"

			$scope.map.getBounds()

			route = Map.createRouteFromNodeArray data, 0

			routePolyline = Map.createPolylineFromRoute route

			routePolyline.setMap( $scope.map );


			google.maps.event.addListener $scope.map,'zoom_changed', () ->
				$scope.loadRoute $scope.map.getZoom()
				console.log "zoom: #{$scope.map.getZoom()}"

	$scope.infoBoxes = []