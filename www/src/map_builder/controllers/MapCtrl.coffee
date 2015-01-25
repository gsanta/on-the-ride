MapCtrl = ( $scope, $http, $timeout, MapService, DataProviderService,
  LocalDataProviderService, Coord ) ->

  routePolyline = undefined
  canLoadMapAgain = true

  $scope.routeInfo = undefined
  $scope.map = undefined

  $scope.loadRoute = () ->

    bounds = $scope.map.getBounds()
    ne = bounds.getNorthEast()
    sw = bounds.getSouthWest()
    mapZoom = MapService.calculateZoom( 
      new Coord( sw.lng(), ne.lat() ),
      new Coord( ne.lng(), sw.lat() )
    )

    mapIds =  MapService.getMapsForAreaAtZoom(
      new Coord( sw.lng(), ne.lat() ),
      new Coord( ne.lng(), sw.lat() ), mapZoom - 1
    )

    routeInfoPromise = LocalDataProviderService.loadRouteInfo()#MapService.fetchRouteNodes mapZoom, mapIds


    routeInfoPromise.then ( data ) ->
      route = MapService.createRouteFromNodeArray data, 1, [ 0 ]#mapZoom, mapIds

      routePolyline.setMap null
      routePolyline = MapService.createPolylineFromRoute route
      routePolyline.setMap( $scope.map );

      # callback = () ->
      #   routePolyline.setMap null
      #   routePolyline.setMap( $scope.map );
      #   console.log "most setMap"
      # $timeout callback, 6000


  $scope.initMap = ->
    # DataProviderService.loadMapArea( 0 ).success ( data ) ->
    #   console.log "loadMapArea"
    #   console.log data

    routeInfoPromise = LocalDataProviderService.loadRouteInfo()#MapService.fetchRouteNodes( 1, [ 0 ] )

    routeInfoPromise.then ( data ) ->
      $scope.routeInfo = data

      centerCoordinates = MapService.createCoordinate data[0].lat, data[0].lon

      $scope.map = new google.maps.Map document.querySelector( '#view-map' ).querySelector( '#googleMap' ), MapService.createMapProperties( centerCoordinates, 3 )

      $scope.map.getBounds()

      route = MapService.createRouteFromNodeArray data, 1, [ 0 ]

      routePolyline = MapService.createPolylineFromRoute route

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


module.exports = MapCtrl