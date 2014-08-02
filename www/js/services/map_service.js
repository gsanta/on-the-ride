angular.module( "services" )
.factory( "Map", function() {

	var factoryObj = {};

	factoryObj.createMap = function( centerPosition, zoom, domElement ,mapTypeId ) {
		var mapProp = {
			center: centerPosition,
			zoom: zoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		if( mapTypeId != undefined ) {
			mapProp.mapTypeId = mapTypeId;
		}

		return new google.maps.Map( domElement, mapProp );
	}

	factoryObj.addRoute = function( route, map ) {
		var coordinates = [];

		for( var i = 0; i < route.length; i++ ) {
		  	coordinates.push(
		  		new google.maps.LatLng( route[i].lat, route[i].lon )
		  	)
		}

		var routePolyline = new google.maps.Polyline({
		    path: coordinates,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});

		routePolyline.setMap( map );
	}

	factoryObj.createCoordinate = function( lat, lon ) {
		return new google.maps.LatLng( lat,lon )
	}

	return factoryObj;
})