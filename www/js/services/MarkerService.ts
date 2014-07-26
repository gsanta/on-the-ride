/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/googlemaps/google.maps.d.ts" />


var factory = function() {

	var factoryObj = {

		createMarker: (position, title, map) => {

			var marker = new google.maps.Marker({
			    position: position,
			    map: map,
			    title: title
			});

			return marker;
		},

		createInfoWindow: (text, map, marker) => {
			var infowindow = new google.maps.InfoWindow({
			    content: text
			});

			if(map && marker) {
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map,marker);
				});
			}
		}
	};

	return factoryObj;
};

factory.$inject = [];

export = factory;

