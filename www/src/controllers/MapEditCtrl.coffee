angular.module "controllers"
.controller 'MapEditCtrl', ( $scope, $http, $timeout, Map, DataProvider,
  LocalDataProviderService, Coord ) ->

  routePolyline = undefined
  canLoadMapAgain = true

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

        closureClick = ( c ) ->
          google.maps.event.addListener c, 'click', ( e ) ->
            console.log $scope.currentEditableCircle
            if $scope.currentEditableCircle
              $scope.currentEditableCircle.setDraggable false
            $scope.currentEditableCircle = c
            $scope.editedCircles.push c
            $scope.$apply() 
            c.setDraggable true
            c.strokeColor = "#00FF00"
            c.fillColor = "#00FF00"

        closureDragstart = ( c ) ->
          google.maps.event.addListener c, 'dragstart', ( e ) ->
            console.log "start"
            console.log $scope.editedCircles[ c._id ]
            if $scope.editedCircles[ c._id ] == undefined
              $scope.editedCircles.len++
              console.log "len: " + $scope.editedCircles.len
              $scope.editedCircles[ c._id ] = c

            $scope.currentEditableCircle = c
            $scope.$apply() 

        closureDragend = ( c ) ->
          google.maps.event.addListener c, 'dragend', ( e ) ->
            $scope.currentEditableCircle = null
            $scope.$apply() 

        #closureClick circle
        closureDragend circle
        closureDragstart circle

  $scope.savePoints = ->
    console.log "savePoints"
    console.log $scope.editedCircles
    circles = []
    for k,v of $scope.editedCircles
      if k != "len"
        circles.push v
    Map.savePoints circles
    $scope.currentEditableCircle = null
    $scope.editedCircles = {
      len: 0
    }

  $scope.infoBoxes = []