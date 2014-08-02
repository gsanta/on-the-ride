angular.module "services"
.factory "Map", ->

	factoryObj =

		createMap: ( centerPosition, zoom, domElement ,mapTypeId ) ->
			mapProp =
				center: centerPosition,
				zoom: zoom,
				mapTypeId: google.maps.MapTypeId.ROADMAP

			mapProp.mapTypeId = mapTypeId if mapTypeId?
			
			new google.maps.Map( domElement, mapProp );
	

		addRoute: ( route, map ) ->
			coordinates = [];

			coordinates.push new google.maps.LatLng coordinate.lat, coordinate.lon for coordinate in route

			routePolyline = new google.maps.Polyline {
			    path: coordinates,
			    geodesic: true,
			    strokeColor: '#FF0000',
			    strokeOpacity: 1.0,
			    strokeWeight: 2
			}

			routePolyline.setMap( map );

		createCoordinate: ( lat, lon ) ->
			new google.maps.LatLng lat,lon
		
	factoryObj;