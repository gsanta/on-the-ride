angular.module "services"
.factory "Map", ( DataProvider ) ->

	factoryObj =

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
			route = [ ];

			nodeAssocMap = {}
			for node in nodeArray
				nodeAssocMap[ node._id ] = node

			actNode = nodeAssocMap[0]
			1 
			while actNode != undefined
				route.push actNode
				actNode = nodeAssocMap[ actNode.siblings[ 8 - zoom ] ] 

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