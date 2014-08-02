angular.module( "services" )
.factory( "DataProvider", function($http) {

	var factoryObj = {};

	factoryObj.loadPlaceInfo = function() {

		return $http.get('/info');

		// $http.get('/info').success(function(data) {
		// 	$scope.infoBoxes = data;
		// 	// for(var i = 0; i < data.length; i++) {
		// 	// 	$scope.addInfo(data[i])
		// 	// }			
		// });
	}

	factoryObj.loadRouteInfo = function() {
		return $http.get('/eurovelo_6');
	}

	factoryObj.savePlaceInfo = function( data ) {
		return $http.post('/info', data);
	}

	// (function() {
	// 	$http.get('/eurovelo_6').success(function(data) {
	// 		console.log(data)

	// 		for(var i = 0; i < data.length; i++) {
	// 			$scope.addLocations(data[i].nodes)
	// 		}
			
	// 		$scope.fetchInfo();
	// 	});
	// })()
	return factoryObj;
})