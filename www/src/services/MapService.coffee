angular.module "services"
.factory "Map", ( DataProvider, LocalDataProviderService, MapConstants, Coord, $compile, LoginService, $http, $q ) ->

  mapZoomDiameterSquares = [
    5825,
    1456.25,
    364.0625,
    91.016,
    22.754,
    5.691,
    1.422,
    0.3557,
    0.0892
  ]

  infoWindowContent = '''
      <div>
        <div class="list">
            <div class="item item-divider">
              Basic info
            </div>

            <div class="item"> 
              User: {{actNode.user}}<br/>
              Id: {{actNode.lat}}
            </div>

            <div class="item item-divider">
              How accurate this point is?
            </div>

            <div class="item range range-energized"> 
              <div> 
              <input type="range" name="volume" min="0" max="2" value="1" ng-model="vote.value">
              </div>
              <div>
                <i class="icon ion-happy">&nbsp;{{actNode.vote_pos}}</i>
                <i class="icon ion-sad">&nbsp;{{actNode.vote_neg}}</i>
              </div>
            </div>
        </div>
      </div>

      '''

  infowindow = new google.maps.InfoWindow()

  google.maps.event.addListener infowindow, 'closeclick', () ->
    # scope.vote.isReset = true
    # scope.vote.value = 1
    # scope.$apply()

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

      infowindow.setContent content
      infowindow.open googleMap, marker

  addDragendEventToMarker = ( marker, scope ) ->
    google.maps.event.addListener marker, 'dragend', ( event ) ->
      marker.nodeInfo.changed = true
      marker.nodeInfo.lat = event.latLng.k
      marker.nodeInfo.lon = event.latLng.B
      scope.isThereEditedNode = true

  factoryObj =

    calculateZoom: ( topLeftCoord, bottomRightCoord ) ->
      lon1 = parseFloat topLeftCoord.lon
      lon2 = parseFloat bottomRightCoord.lon
      lat1 = parseFloat topLeftCoord.lat
      lat2 = parseFloat bottomRightCoord.lat

      actDistanceSquare = Math.pow( lon1 - lon2, 2 ) +
                          Math.pow( lat1 - lat2, 2 )

      for dist, index in mapZoomDiameterSquares
        if dist < actDistanceSquare
          if index == 0
            return 1
          else
            return index
      return mapZoomDiameterSquares.length

    createMapProperties: ( centerPosition, zoom, mapTypeId ) ->
      mapProp =
        center: centerPosition,
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.TERRAIN

      mapProp.mapTypeId = mapTypeId if mapTypeId?
      mapProp


    fetchRouteNodes: ( zoom, maps ) ->
      DataProvider.loadRouteInfo( zoom, maps )

    createRouteFromNodeArray: ( nodeArray, zoom, mapIds ) ->

      if zoom > MapConstants.max_zoom
        throw new Error "zoom is bigger than the maximum
                        (use MapConstants.max_zoom)"

      if zoom < 1
        throw new Error "zoom is smaller than the minimum
                        (use MapConstants.min_zoom)"

      createRouteFromStartNode = ( startNode ) ->
        route = [ ]
        actNode = startNode

        while actNode != undefined
          route.push actNode
          if actNode.weight < zoom
            actNode = nodeAssocMap[ actNode.siblings[ 0 ] ]
          else
            actNode = nodeAssocMap[ actNode.siblings[ MapConstants.max_zoom - zoom ] ]

        route

      nodeAssocMap = {}
      for node in nodeArray
        nodeAssocMap[ node._id ] = node

      startNodes = []
      for mapId in mapIds
        startNode = this.getStartNodeFromNodesAtMap nodeArray, mapId
        if startNode
          startNodes.push startNode

      finalRoute = []
      for startNode in startNodes
        route = createRouteFromStartNode startNode
        if route.length > finalRoute.length
          finalRoute = route

      for n,i in finalRoute
        if n == undefined
          console.log "undef at #{i}"

      return finalRoute;

    getStartNodeFromNodesAtMap: ( nodes, mapId ) ->
      for node in nodes
        if mapId in node.startNodeInMap
          return  node
      undefined

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

    createPointsFromRoute: ( route, googleMap ) ->
      
      circles = []

      for node, index in route
        pointOptions =
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          draggable: true,
          map: googleMap,
          center: new google.maps.LatLng node.lat, node.lon
          radius: ( Math.random() * 10 ) + 10

        circle = new google.maps.Circle pointOptions 
        circle._id = node._id
        circles.push circle
      circles

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
        lat: 0,#todo get lat from getCenter()
        lon: 0,#todo get lon from getCenter()
        _id: -1
      }

      addClickEventToMarker( marker, scope, marker.nodeInfo, compiled[0], googleMap ) 
      addDragendEventToMarker( marker, scope )

      marker

    createCoordinate: ( lat, lon ) ->
      new google.maps.LatLng lat,lon

    calculateMapIdForNodeAtZoom: ( coord, zoom ) ->

      if coord.lon >= MapConstants.lonEnd
        coord.lon = MapConstants.lonEnd - 0.00001
      else if coord.lon < MapConstants.lonStart
        coord.lon = MapConstants.lonStart
      if coord.lat <= MapConstants.latEnd
        coord.lat = MapConstants.latEnd + 0.00001
      else if coord.lat > MapConstants.latStart
        coord.lat = MapConstants.latStart


      rowsColumnsAtZoom = Math.pow 2, zoom

      latFullLen = Math.abs( MapConstants.latStart - MapConstants.latEnd )
      lonFullLen = Math.abs( MapConstants.lonStart - MapConstants.lonEnd )

      distFromLatStart = Math.abs MapConstants.latStart - coord.lat
      distFromLonStart = Math.abs MapConstants.lonStart - coord.lon

      latLenAtZoom = latFullLen / rowsColumnsAtZoom
      lonLenAtZoom = lonFullLen / rowsColumnsAtZoom

      row = Math.floor( distFromLatStart / latLenAtZoom ) + 1
      column = Math.floor( distFromLonStart / lonLenAtZoom ) + 1

      mapIdOffset = 0
      for index in [ 0...zoom ]
        mapIdOffset += Math.pow 4, index
      mapIdOffset + ( row - 1 ) * rowsColumnsAtZoom + column - 1

    getMapsForAreaAtZoom: ( topLeftCoord, bottomRightCoord, zoom ) ->
      bottomLeftCoord = new Coord topLeftCoord.lon, bottomRightCoord.lat
      topRightCoord = new Coord bottomRightCoord.lon, topLeftCoord.lat

      tlId = this.calculateMapIdForNodeAtZoom topLeftCoord, zoom
      trId = this.calculateMapIdForNodeAtZoom topRightCoord, zoom
      blId = this.calculateMapIdForNodeAtZoom bottomLeftCoord, zoom
      brId = this.calculateMapIdForNodeAtZoom bottomRightCoord, zoom
      
      set = {}
      set[tlId] = 1; set[trId] = 1; set[blId] = 1; set[brId] = 1

      ids = []

      for k,v of set
        ids.push parseInt k, 10
      ids

    #todo put marker._id into marker.nodeInfo._id
    savePoints: ( nodes ) ->

      for node in nodes
        LocalDataProviderService.updateNode node._id, {
          lat: node.lat,
          lon: node.lon
        }

    addPoints: ( nodes ) ->
      for node in nodes
        LocalDataProviderService.addNode {
          lat: node.lat,
          lon: node.lon
        }

    getUserVoteToPoint: ( userName, nodeId ) ->
      deferred = $q.defer()

      httpPromise = $http.get "/vote/#{userName}/#{nodeId}"

      httpPromise.then ( resp ) ->
        if resp.data.then? 
          resp.data.then ( data ) ->
            if data == undefined
              data = 
                user: userName
                node: nodeId
                vote: 1
            deferred.resolve( data )

      deferred.promise

    getAllVotesToNode: ( nodeId ) ->
      deferred = $q.defer()

      httpPromise = $http.get "/vote/#{nodeId}"

      httpPromise.then ( resp ) ->
        if resp.data.then? 
          resp.data.then ( data ) ->
            if data == undefined
              data = 
                nodeId: nodeId
                pos: 0
                neg: 0
            deferred.resolve( data )

      deferred.promise

    sendUserVoteForNode: ( userName, nodeId, vote ) ->
      $http.post "/vote/new", {
        user: userName,
        nodeId: nodeId,
        vote: vote
      }

  factoryObj