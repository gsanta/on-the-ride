angular.module "controllers"
.controller 'MapEditCtrl', ( $scope, $http, $timeout, Map, DataProvider,
  LocalDataProviderService, Coord, LoginService, MapConstants ) ->

  routePolyline = undefined
  canLoadMapAgain = true

  newNodeCounter = -1

  editedMarkers = []
  markers = []
  polylines = []

  clearArray = ( array ) ->
    for obj in array
      obj.setMap null
    #obj.setMap( null ) for obj in array

  copyEditedMarkers = ( fromArray, toAssocArray ) ->
    for obj in fromArray
      if obj.nodeInfo.changed
        toAssocArray[ obj.nodeInfo._id ] = obj

  $scope.routeInfo = undefined
  $scope.map = undefined

  $scope.isThereEditedNode = false

  $scope.infoWindow = {
    isDisplayed: false
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

  $scope.loadRouteInfo = ( ) ->
    routeInfoPromise = LocalDataProviderService.loadRouteInfo()

    routeInfoPromise.then ( data ) ->
      $scope.routeInfo = data
      window.routeInfo = data

      copyEditedMarkers markers, editedMarkers
      clearArray markers
      markers = []
      clearArray polylines
      polylines = []

      if $scope.isEdit && MapConstants.maxZoom == $scope.map.zoom && LoginService.isLoggedIn()
        markers = Map.createMarkersFromRoute data, $scope.map, $scope
      else
        polylines.push Map.createPolylineFromRoute data, $scope.map

  $scope.isEdit = true

  $scope.initMap = ->
    window.routeInfo = $scope.routeInfo
    routeInfoPromise = LocalDataProviderService.loadRouteInfo()#Map.fetchRouteNodes( 1, [ 0 ] )

    routeInfoPromise.then ( data ) ->
      $scope.routeInfo = data

      centerCoordinates = Map.createCoordinate data[0].lat, data[0].lon

      $scope.map = new google.maps.Map document.querySelector( '#container-map-edit' ).querySelector( '#googleMap' ), Map.createMapProperties( centerCoordinates, 13 )

      polylines.push Map.createPolylineFromRoute data, $scope.map

      google.maps.event.addListener $scope.map,'zoom_changed', () ->
        $scope.loadRouteInfo()
  
  $scope.savePoints = ->
    updateNodes = []
    addNodes = []
    copyEditedMarkers markers, editedMarkers
    for k,v of editedMarkers
      if v.nodeInfo._id < 0
        addNodes.push v.nodeInfo
      else
        updateNodes.push v.nodeInfo

    Map.savePoints updateNodes
    Map.addPoints addNodes

    $scope.isThereEditedNode = false

  $scope.addPoint = ->
    marker = Map.addNewPointToCenterOfMap $scope.map, $scope
    marker.nodeInfo._id = newNodeCounter
    $scope.isThereEditedNode = true
    newNodeCounter--
    editedMarkers.push marker
    markers.push marker 

  $scope.infoBoxes = []

  $scope.vote = {
    value: 1
    isReset: true
  }

  $scope.$watch( 'vote.isReset', ( newValue, oldValue ) ->
    console.log "reset watch: #{newValue}"
  )

  $scope.$watch( 'vote.value', ( newValue, oldValue ) ->
    console.log "reset: #{$scope.vote.isReset}"
    newValue = parseInt newValue
    oldValue = parseInt oldValue
    if( !$scope.vote.isReset && newValue != oldValue )
      console.log "send: #{oldValue},#{newValue}, #{$scope.vote.isReset}"
      user = LoginService.getUserName()
      nodeId = $scope.actNode._id #todo nodeInfo._id???
      Map.sendUserVoteForNode user, nodeId, newValue
    $scope.vote.isReset = false
  )