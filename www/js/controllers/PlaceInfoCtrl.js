angular.module( "controllers" )
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