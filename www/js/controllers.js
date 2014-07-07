angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$http) {

	(function() {
		$http.get('/items').success(function(data) {
			console.log(data)
		});
	})()

	$scope.loadMap = function() {
		navigator.geolocation.getCurrentPosition( $scope.initialize );
		
		//google.maps.event.addDomListener(window, 'load', $scope.initialize);
	}

	$scope.loadData = function() {
		

		return "haho"
	}

	$scope.initialize = function( location ) {
		console.log( location )

		

		/*var mapProp = {
			center:new google.maps.LatLng(0, -180),//new google.maps.LatLng( location.coords.latitude, location.coords.longitude ),
			zoom: 3,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		};

		var map = new google.maps.Map( document.getElementById( "googleMap" ), mapProp );

		 var flightPlanCoordinates = [
		    new google.maps.LatLng(37.772323, -122.214897),
		    new google.maps.LatLng(21.291982, -157.821856),
		    new google.maps.LatLng(-18.142599, 178.431),
		    new google.maps.LatLng(-27.46758, 153.027892)
		  ];
		  var flightPath = new google.maps.Polyline({
		    path: flightPlanCoordinates,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		  });

		  flightPath.setMap(map);*/
	}

})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});
