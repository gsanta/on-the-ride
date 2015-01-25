BicycleRouteBuilderService = ( InfoWindowService ) ->

  addClickEventToMarker = (marker, scope, node, content, googleMap) ->

    google.maps.event.addListener marker, 'click', () ->
      nodeId = parseInt node._id
      userVotePromise = factoryObj.getUserVoteToPoint( LoginService.getUserName(), nodeId )
      allVotesPromise = factoryObj.getAllVotesToNode nodeId

      scope.actNode = node
      
      allVotesPromise.then ( data ) ->
        scope.actNode.vote_pos = data.pos
        scope.actNode.vote_neg = data.neg

      userVotePromise.then ( data ) ->
        #scope.vote.isReset = true
        scope.vote.value = data.vote
      
      scope.$apply()

      InfoWindowService.getInfoWindow().setContent content
      InfoWindowService.getInfoWindow().open googleMap, marker



  addDragendEventToMarker = ( marker, scope ) ->
    google.maps.event.addListener marker, 'dragend', ( event ) ->
      marker.nodeInfo.changed = true
      marker.nodeInfo.lat = event.latLng.k
      marker.nodeInfo.lon = event.latLng.B
      scope.isThereEditedNode = true

  factoryObj =

		createPolylineFromRoute: ( route, googleMap ) ->
      coordinates = []
      coordinates.push new google.maps.LatLng node.lat, node.lon for node in route

      routePolyline = new google.maps.Polyline {
        path: coordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMap
      }

      return routePolyline

    createMarkersFromRoute: ( route, googleMap, scope ) ->

      markers = []

      compiled = $compile(infoWindowContent)(scope);

      scope.markers = markers

      for node, index in route
        markerOptions =
          map: googleMap,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng node.lat, node.lon

        marker = new google.maps.Marker markerOptions
        marker.nodeInfo = node

        markers.push marker

        addClickEventToMarker( marker, scope, node, compiled[0], googleMap ) 
        addDragendEventToMarker( marker, scope )

      console.log markers
      markers

    addNewPointToCenterOfMap: ( googleMap, scope ) ->

      compiled = $compile( infoWindowContent )( scope )

      markerOptions =
        map: googleMap,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: googleMap.getCenter() 

      marker = new google.maps.Marker markerOptions

      marker.nodeInfo = {
        user: LoginService.getUserName(),
        vote_pos: 0,
        vote_neg: 0,
        changed: true,
        lat: googleMap.getCenter().k,
        lon: googleMap.getCenter().B,
        _id: -1
      }

      addClickEventToMarker( marker, scope, marker.nodeInfo, compiled[0], googleMap ) 
      addDragendEventToMarker( marker, scope )

      marker

    createCoordinate: ( lat, lon ) ->
      new google.maps.LatLng lat,lon
		
    addClickEventToMarker: (marker, scope, node, content, googleMap) ->
      google.maps.event.addListener marker, 'click', () ->
        nodeId = parseInt node._id
        userVotePromise = factoryObj.getUserVoteToPoint( LoginService.getUserName(), nodeId )
        allVotesPromise = factoryObj.getAllVotesToNode nodeId

        scope.actNode = node
        
        allVotesPromise.then ( data ) ->
          scope.actNode.vote_pos = data.pos
          scope.actNode.vote_neg = data.neg

        userVotePromise.then ( data ) ->
          #scope.vote.isReset = true
          scope.vote.value = data.vote
        
        scope.$apply()

        InfoWindowService.getInfoWindow().setContent content
        InfoWindowService.getInfoWindow().open googleMap, marker


module.exports = BicycleRouteBuilderService