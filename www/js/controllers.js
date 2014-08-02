
angular.module( "controllers", [ "services" ] )
.controller('MapCtrl', function( $scope,$http, Map, DataProvider ) {

	$scope.routeInfo = undefined;
	$scope.map = undefined;

	$scope.initMap = function() {
		var routeInfoPromise = DataProvider.loadRouteInfo();

		routeInfoPromise.success( function( data ) {
			$scope.routeInfo = data;

			var centerCoordinates = Map.createCoordinate( data[0].nodes[0].lat, data[0].nodes[0].lon );

			$scope.map = Map.createMap( centerCoordinates, 12, document.getElementById( "googleMap" ) );

			for(var i = 0; i < data.length; i++) {
				Map.addRoute( data[i].nodes, $scope.map )
			}
		})
	}

	$scope.infoBoxes = []
})

.controller( "PlaceInfoCtrl" , function( $scope, $http, DataProvider ) {
  	$scope.categories = [
  		{name: "Accomodation"},
  		{name: "Shop"},
  		{name: "Sight"}
  	];

  	$scope.category = "";
  	$scope.description = "";
  	$scope.latitude = "";
  	$scope.longitude = "";

  	 $scope.getCssClasses = function( ngModelContoller ) {
	    return {
	    	error: ngModelContoller.$invalid && ngModelContoller.$dirty,
	    	success: ngModelContoller.$valid && ngModelContoller.$dirty
	    };
	};

  	$scope.showError = function( ngModelController, error ) {
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

		DataProvider.savePlaceInfo( data )
		.success( function() {
			alert("success saving info data")
		} )
		.error( function() {
			alert("failure saving info data")
		} )
	}
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});
