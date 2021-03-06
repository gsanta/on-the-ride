angular.module "controllers"
.controller 'MapCtrl', ( $scope, $http, $timeout, Map, DataProvider,
  LocalDataProviderService, Coord ) ->

  routePolyline = undefined
  canLoadMapAgain = true

  $scope.routeInfo = undefined
  $scope.map = undefined

  $scope.loadRoute = () ->

    bounds = $scope.map.getBounds()
    ne = bounds.getNorthEast()
    sw = bounds.getSouthWest()
    mapZoom = Map.calculateZoom( 
      new Coord( sw.lng(), ne.lat() ),
      new Coord( ne.lng(), sw.lat() )
    )

    mapIds =  Map.getMapsForAreaAtZoom(
      new Coord( sw.lng(), ne.lat() ),
      new Coord( ne.lng(), sw.lat() ), mapZoom - 1
    )

    routeInfoPromise = LocalDataProviderService.loadRouteInfo()#Map.fetchRouteNodes mapZoom, mapIds


    routeInfoPromise.then ( data ) ->
      route = Map.createRouteFromNodeArray data, 1, [ 0 ]#mapZoom, mapIds

      routePolyline.setMap null
      routePolyline = Map.createPolylineFromRoute route
      routePolyline.setMap( $scope.map );

      # callback = () ->
      #   routePolyline.setMap null
      #   routePolyline.setMap( $scope.map );
      #   console.log "most setMap"
      # $timeout callback, 6000


  $scope.initMap = ->
    # DataProvider.loadMapArea( 0 ).success ( data ) ->
    #   console.log "loadMapArea"
    #   console.log data

    routeInfoPromise = LocalDataProviderService.loadRouteInfo()#Map.fetchRouteNodes( 1, [ 0 ] )

    routeInfoPromise.then ( data ) ->
      $scope.routeInfo = data

      centerCoordinates = Map.createCoordinate data[0].lat, data[0].lon

      $scope.map = new google.maps.Map document.querySelector( '#view-map' ).querySelector( '#googleMap' ), Map.createMapProperties( centerCoordinates, 3 )

      $scope.map.getBounds()

      route = Map.createRouteFromNodeArray data, 1, [ 0 ]

      routePolyline = Map.createPolylineFromRoute route

      routePolyline.setMap( $scope.map )


      google.maps.event.addListener $scope.map,'zoom_changed', () ->
        1
        # if canLoadMapAgain
        #   $scope.loadRoute()
        #   callback = () ->
        #     canLoadMapAgain = true
        #   $timeout callback, 20000
        # canLoadMapAgain = false 


      google.maps.event.addListener $scope.map, "bounds_changed", () ->
        if canLoadMapAgain
          $scope.loadRoute()
          callback = () ->
            canLoadMapAgain = true
          $timeout callback, 5000
        canLoadMapAgain = false

  $scope.infoBoxes = []