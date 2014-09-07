angular.module "services"
.factory "Map", ( DataProvider, MapConstants ) ->

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

	factoryObj = 

		calculateZoom: (x1, y1, x2, y2) ->
			x1 = parseFloat x1 
			x2 = parseFloat x2
			y1 = parseFloat y1
			y2 = parseFloat y2

			actDistanceSquare = Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 )

			for dist, index in mapZoomDiameterSquares
				if dist < actDistanceSquare
					if index == 0
						return 0
					else
						return index - 1
			return mapZoomDiameterSquares.length - 1

		createMapProperties: ( centerPosition, zoom, mapTypeId ) ->
			mapProp =
				center: centerPosition,
				zoom: zoom,
				mapTypeId: google.maps.MapTypeId.ROADMAP

			mapProp.mapTypeId = mapTypeId if mapTypeId? 
			mapProp	


		fetchRouteNodes: ( zoom ) ->
			DataProvider.loadRouteInfo( zoom )

		createRouteFromNodeArray: ( nodeArray, zoom ) ->

			if zoom > MapConstants.max_zoom
				throw new Error "zoom is bigger than the maximum (use MapConstants.max_zoom)"

			if zoom < 1
				throw new Error "zoom is smaller than the minimum (use MapConstants.min_zoom)"

			route = [ ]

			nodeAssocMap = {}
			for node in nodeArray
				nodeAssocMap[ node._id ] = node

			actNode = nodeAssocMap[0]

			while actNode != undefined
				route.push actNode
				for index in [ 1...zoom ]
					actNode = nodeAssocMap[ actNode.siblings[ 0 ] ]
					if actNode == undefined
						break
					route.push actNode
				if actNode != undefined
					actNode = nodeAssocMap[ actNode.siblings[ MapConstants.max_zoom - zoom ] ] 

			return route;

		createPolylineFromRoute: ( route ) ->
			coordinates = []
			coordinates.push new google.maps.LatLng node.lat, node.lon for node in route

			routePolyline = new google.maps.Polyline {
			    path: coordinates,
			    geodesic: true,
			    strokeColor: '#FF0000',
			    strokeOpacity: 1.0,
			    strokeWeight: 2
			} 

			return routePolyline


		createCoordinate: ( lat, lon ) ->
			new google.maps.LatLng lat,lon

		calculateMapIdForNodeAtZoom: ( lat, lon, zoom ) ->
			rowsColumnsAtZoom = Math.pow 2, zoom

			latFullLen = Math.abs( MapConstants.latStart - MapConstants.latEnd )
			lonFullLen = Math.abs( MapConstants.lonStart - MapConstants.lonEnd )

			distFromLatStart = Math.abs MapConstants.latStart - lat
			distFromLonStart = Math.abs MapConstants.lonStart - lon

			latLenAtZoom = latFullLen / rowsColumnsAtZoom
			lonLenAtZoom = lonFullLen / rowsColumnsAtZoom

			row = Math.floor( distFromLatStart / latLenAtZoom ) + 1
			column = Math.floor( distFromLonStart / lonLenAtZoom ) + 1

			mapIdOffset = 0
			for index in [ 0...zoom ]
				mapIdOffset += Math.pow 4, index
			mapIdOffset + ( row - 1 ) * rowsColumnsAtZoom + column - 1
		
	factoryObj;