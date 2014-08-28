angular.module "services"
.factory "Map", ( DataProvider ) ->

	mapZoomDiameter = [
		Math.sqrt 5825,
		Math.sqrt 1456.25,
		Math.sqrt 364.0625,
		Math.sqrt 91.016,
		Math.sqrt 22.754,
		Math.sqrt 5.691,
		Math.sqrt 1.422,
		Math.sqrt 0.3557,
		Math.sqrt 0.0892
	]

	factoryObj =

		calculateZoom: (x1, x2, y1, y2) ->
			x1 = parseFloat x1
			x2 = parseFloat x2
			y1 = parseFloat y1
			y2 = parseFloat y2

			distance = Math.sqrt ( Math.pow ( x1 - x2 ), 2 + Math.pow ( y1 - y2 ), 2 ) 
			console.log "dist #{x1}, #{x2}, #{y1}, #{y2}"
			for dist, index in mapZoomDiameter
				if dist < distance
					if index == 0
						return 0
					else
						return index - 1

		createMap: ( centerPosition, zoom, domElement ,mapTypeId ) ->
			mapProp =
				center: centerPosition,
				zoom: zoom,
				mapTypeId: google.maps.MapTypeId.ROADMAP

			mapProp.mapTypeId = mapTypeId if mapTypeId?
			
			new google.maps.Map( domElement, mapProp );


		fetchRouteNodes: ( zoom ) ->
			DataProvider.loadRouteInfo( zoom )

		createRouteFromNodeArray: ( nodeArray, zoom ) ->
			console.log "menniy: #{zoom}"

			if zoom > 8
				zoom = 8

			route = [ ]

			nodeAssocMap = {}
			for node in nodeArray
				nodeAssocMap[ node._id ] = node

			actNode = nodeAssocMap[0]

			while actNode != undefined
				route.push actNode
				for index in [ 0...zoom ]
					actNode = nodeAssocMap[ actNode.siblings[ 0 ] ]
					if actNode == undefined
						break
					route.push actNode
				if actNode != undefined
					actNode = nodeAssocMap[ actNode.siblings[ 8 - zoom ] ] 
			console.log "route.length: #{route.length}"

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
		
	factoryObj;