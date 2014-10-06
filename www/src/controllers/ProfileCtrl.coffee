angular.module "controllers"
.controller 'ProfileCtrl', ( $scope, DataProvider, LoginService ) ->
  
  promise = DataProvider.getUserInfo( "gsanta" )
  promise.then ( data ) ->
    $scope.user = data

  $scope.user = {}

  $scope.newPassword = undefined

  $scope.getCssClasses = ( ngModelContoller ) ->
    return {
      error: ngModelContoller.$invalid && ngModelContoller.$dirty,
      success: ngModelContoller.$valid && ngModelContoller.$dirty
    }

  $scope.showError = ( ngModelController , error ) ->
    console.log("shoError: #{ngModelController.$error[ error ]}" )
    return ngModelController.$error[ error ]

  $scope.canSaveForm = ( form ) ->
    return form.$valid

  $scope.submitPasswordChangeForm = ( form ) ->

  	if form.$dirty && form.$invalid
    	return

    LoginService.changePassword $scope.user.userName, $scope.user.password, form.newPassword.$modelValue



  