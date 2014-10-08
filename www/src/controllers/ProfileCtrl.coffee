angular.module "controllers"
.controller 'ProfileCtrl', ( $scope, DataProvider, LoginService, UserService ) ->
  
  promise = DataProvider.getUserInfo( "gsanta" )
  promise.then ( data ) ->
    $scope.user = data

  $scope.user = {}

  $scope.newPassword = undefined

  $scope.passwordChange = {

  }

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

    promise = LoginService.changePassword $scope.user.userName, $scope.passwordChange.password, $scope.passwordChange.newPassword

    promise.then () ->
      $scope.passwordChange = {}
      form.$setPristine()
      $scope.passwordFlashMessage = "changes saved"

  $scope.submitProfileForm = ( form ) ->
    if form.$dirty && form.$invalid
      return

    promise = UserService.changeProfileData $scope.user.userName, $scope.user

    promise.then ( User ) ->
      $scope.user = User
      form.$setPristine()
      $scope.profileFlashMessage = "changes saved"



  