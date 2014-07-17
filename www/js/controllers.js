angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$http) {

	// (function() {
	// 	$http.get('/eurovelo_6').success(function(data) {
	// 		console.log(data)

	// 		for(var i = 0; i < data.length; i++) {
	// 			$scope.addLocations(data[i].nodes)
	// 		}
			
	// 		$scope.fetchInfo();
	// 	});
	// })()

	$scope.infoBoxes = []

	$scope.fetchInfo = function() {
		$http.get('/info').success(function(data) {
			$scope.infoBoxes = data;
			// for(var i = 0; i < data.length; i++) {
			// 	$scope.addInfo(data[i])
			// }			
		});
	}

	$scope.addInfo = function(data) {
		var marker = new google.maps.Marker({
		    position: new google.maps.LatLng(data.lat,data.lon),
		    map: $scope.map,
		    title:"Hello World!"
		});

		var contentString = data.desc;

		var infowindow = new google.maps.InfoWindow({
		    content: contentString
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open($scope.map,marker);
		});
	}

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
	}

	$scope.initialize = function( location ) {

		
	}

})

.controller('FriendsCtrl', function($scope, $http) {
  	$scope.categories = [
  		{name: "Accomodation"},
  		{name: "Shop"},
  		{name: "Sight"}
  	];

  	$scope.category = "";
  	$scope.description = "";
  	$scope.latitude = "";
  	$scope.longitude = "";

  	 $scope.getCssClasses = function(ngModelContoller) {
	    return {
	    	error: ngModelContoller.$invalid && ngModelContoller.$dirty,
	    	success: ngModelContoller.$valid && ngModelContoller.$dirty
	    };
	};

  	$scope.showError = function(ngModelController, error) {
		return ngModelController.$error[error];
	};

	$scope.canSave = function() {
		return $scope.infoForm.$dirty && $scope.infoForm.$valid;
	};

	$scope.save = function() {
		var data = {
			category: $scope.category.name,
			desc: $scope.description,
			lat: $scope.latitude,
			lon: $scope.longitude
		}

		console.log(data)

		$http.post('/info', data)
		.success(function() {
			alert("success")
		})
		.error(function() {
			alert("error")
		})
	}
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});
