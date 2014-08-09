angular.module "controllers"
.controller "PlaceInfoCtrl" , ( $scope, $http, DataProvider ) ->
  	$scope.categories = [
  		{ name: "Accomodation" },
  		{ name: "Shop" },
  		{ name: "Sight" }
  	];

  	$scope.category = ""
  	$scope.description = ""
  	$scope.latitude = ""
  	$scope.longitude = ""

  	$scope.getCssClasses = ( ngModelContoller ) ->
	    return {
	    	error: ngModelContoller.$invalid && ngModelContoller.$dirty,
	    	success: ngModelContoller.$valid && ngModelContoller.$dirty
	    }

  	$scope.showError = ( ngModelController, error ) ->
		return ngModelController.$error[error];

	$scope.canSave = ->
		return $scope.infoForm.$dirty && $scope.infoForm.$valid

	$scope.save = ->
		data = 
			category: $scope.category.name,
			desc: $scope.description,
			lat: $scope.latitude,
			lon: $scope.longitude

		DataProvider.savePlaceInfo data
		.success ->
			alert "success saving info data"
		.error ->
			alert "failure saving info data"