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
	

		createRootFromNodeArray: ( nodeArray, startNode, map ) ->
			route = [ ];

			nodeAssocMap = {}
			for node in nodeArray
				nodeAssocMap[ node._id ] = node

			actNode = startNode
			while actNode != undefined
				route.push actNode
				actNode = nodeAssocMap[ actNode.siblings[0] ] 

			coordinates = []
			coordinates.push new google.maps.LatLng node.lat, node.lon for node in route

			# routePolyline = new google.maps.Polyline {
			#     path: coordinates,
			#     geodesic: true,
			#     strokeColor: '#FF0000',
			#     strokeOpacity: 1.0,
			#     strokeWeight: 2
			# }

			# routePolyline.setMap( map );

			for coordinate in coordinates 
				populationOptions = 
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 1,
					fillColor: '#FF0000',
					fillOpacity: 0.35,
					map: map,
					center: coordinate,
					radius: 1

				cityCircle = new google.maps.Circle populationOptions
				cityCircle.setMap map

		createCoordinate: ( lat, lon ) ->
			new google.maps.LatLng lat,lon

		findMapAreaForCoordinate: ( lat, lon ) ->
		
	factoryObj;