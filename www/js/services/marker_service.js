define(['angular'], function (angular) {
	'use strict';

	var factory = function() {

		var factoryObj = {};

		factoryObj.createMarker = function(position, title, map) {

			var marker = new google.maps.Marker({
			    position: position,//new google.maps.LatLng(data.lat,data.lon),
			    map: map,
			    title: title
			});

			return marker;
		}

		factoryObj.createInfoWindow = function(text, map, marker) {
			var infowindow = new google.maps.InfoWindow({
			    content: text
			});

			if(map && marker) {
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open($scope.map,marker);
				});
			}
		}

		return factoryObj;
	};

	factory.$inject = [];
    return factory;
});

