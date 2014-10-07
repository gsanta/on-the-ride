angular.module "controllers"
.controller 'MapEditCtrl', ( $scope, $http, $timeout, Map, DataProvider,
  LocalDataProviderService, Coord ) ->

  routePolyline = undefined
  canLoadMapAgain = true

  newCircleId = -1

  dragStart = ( c ) ->
    google.maps.event.addListener c, 'dragstart', ( e ) ->
      console.log "start"
      console.log $scope.editedCircles[ c._id ]
      if $scope.editedCircles[ c._id ] == undefined
        $scope.editedCircles.len++
        console.log "len: " + $scope.editedCircles.len
        $scope.editedCircles[ c._id ] = c

        pointOptions =
          strokeColor: '#ffff00',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#ffff00',
          fillOpacity: 0.35,
          draggable: true,
          map: c.map,
          center: c.center
          radius: c.radius

        c.setOptions pointOptions

      
      $scope.currentEditableCircle = c
      $scope.$apply()

  dragEnd = ( c ) ->
    google.maps.event.addListener c, 'dragend', ( e ) ->
      $scope.currentEditableCircle = null
      $scope.$apply() 

  click = ( c ) ->
    google.maps.event.addListener c, 'click', ( e ) ->
      1

  $scope.routeInfo = undefined
  $scope.map = undefined

  $scope.currentEditableCircle = undefined
  $scope.editedCircles = {
    len: 0
  }

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
    window.$scope = $scope
    routeInfoPromise = LocalDataProviderService.loadRouteInfo()#Map.fetchRouteNodes( 1, [ 0 ] )

    routeInfoPromise.then ( data ) ->
      $scope.routeInfo = data

      centerCoordinates = Map.createCoordinate data[0].lat, data[0].lon

      $scope.map = new google.maps.Map document.querySelector( '#view-map-edit' ).querySelector( '#googleMap' ), Map.createMapProperties( centerCoordinates, 3 )

      circles = Map.createPointsFromRoute data, $scope.map

      # google.maps.event.addListener $scope.map, 'click', (e, attr) ->
      #   console.log $scope.currentEditableCircle
      #   if $scope.currentEditableCircle
      #     $scope.currentEditableCircle.setDraggable false
      #     $scope.currentEditableCircle = null

      for circle, index in circles

        dragEnd circle
        dragStart circle
        click circle
        undefined

  $scope.savePoints = ->
    console.log "savePoints"
    console.log $scope.editedCircles
    updateCircles = []
    addCircles = []
    for k,v of $scope.editedCircles
      if k != "len"
        pointOptions =
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          draggable: true,
          map: v.map,
          center: v.center
          radius: v.radius
        v.setOptions pointOptions

        if v._id < 0
          addCircles.push v
        else
          updateCircles.push v



    Map.savePoints updateCircles
    Map.addPoints addCircles
    $scope.currentEditableCircle = null
    $scope.editedCircles = {
      len: 0
    }

  $scope.addPoint = ->
    circle = Map.addPointToCenterOfMap $scope.map
    circle._id = newCircleId--
    dragStart circle
    dragEnd circle

  $scope.infoBoxes = []