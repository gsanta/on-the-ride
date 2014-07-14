angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$http) {

	(function() {
		$http.get('/eurovelo_6').success(function(data) {
			console.log(data)

			for(var i = 0; i < data.length; i++) {
				$scope.addLocations(data[i].nodes)
			}
			
			
		});
	})()

	$scope.jasminTest = "Test";
	  
	$scope.jasminTestFunc = function() {
	    $scope.jasminTestGreeting = "Hello " + $scope.jasminTest;
	}

	$scope.map = undefined;

	$scope.loadMap = function() {
		navigator.geolocation.getCurrentPosition( $scope.initialize );
		
		//google.maps.event.addDomListener(window, 'load', $scope.initialize);
	}

	$scope.loadData = function() {
		

		return "haho"
	}

	$scope.map = undefined;

	$scope.addLocations = function(locations) {

		if($scope.map == undefined) {
			var mapProp = {
				center:new google.maps.LatLng(locations[0].lat,locations[0].lon),//new google.maps.LatLng( location.coords.latitude, location.coords.longitude ),
				zoom: 12,
				mapTypeId:google.maps.MapTypeId.ROADMAP
			};

			$scope.map = new google.maps.Map( document.getElementById( "googleMap" ), mapProp );
		}

		var flightPlanCoordinates = [];

		for(var i = 0; i < locations.length; i++) {
		  	flightPlanCoordinates.push(
		  		new google.maps.LatLng(locations[i].lat, locations[i].lon)
		  	)
		}

		var flightPath = new google.maps.Polyline({
		    path: flightPlanCoordinates,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});

		flightPath.setMap($scope.map);

		// for(var i = 0; i < locations.length; i++) {

		// 	var path = locations[i].path;
		// 	for(var j = 0; j < path.length; j++) {
		// 		console.log(path[j].lat + ", " + path[j].lon)
		// 		flightPlanCoordinates.push(
		//   			new google.maps.LatLng(path[j].lat, path[j].lon)
		//   		)
		// 	}

		// 	var flightPath = new google.maps.Polyline({
		// 	    path: flightPlanCoordinates,
		// 	    geodesic: true,
		// 	    strokeColor: '#FF0000',
		// 	    strokeOpacity: 1.0,
		// 	    strokeWeight: 2
		// 	});

		// 	flightPath.setMap($scope.map);
		// 	flightPlanCoordinates = []
		// }

		// for(var i = 0; i < locations.length; i++) {
		  	// flightPlanCoordinates.push(
		  		// new google.maps.LatLng(locations[i].lat, locations[i].lon)
		  	// )
		// }
		
	}

	$scope.initialize = function( location ) {

		
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
