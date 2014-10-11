angular.module "controllers"
.controller 'ProfileCtrl', ( $scope, DataProvider, LoginService, UserService ) ->
  
  promise = DataProvider.getUserInfo( "gsanta" )
  promise.then ( data ) ->
    $scope.user = data
    $scope.savedUser = angular.copy $scope.user

  $scope.user = {}

  $scope.savedUser = {}

  $scope.newPassword = undefined

  $scope.passwordChange = {

  }

  $scope.getCssClasses = ( ngModelContoller ) ->
    return {
      error: ngModelContoller.$invalid && ngModelContoller.$dirty,
    }

  $scope.showError = ( ngModelController , error ) ->
    console.log("shoError: #{ngModelController.$error[ error ]}" )
    return ngModelController.$error[ error ]

  $scope.canSaveForm = ( form ) ->
    return form.$valid

  $scope.canSaveProfileForm = ( form ) ->
    console.log($scope.savedUser)
    return form.$valid && ( $scope.user.email != $scope.savedUser.email )

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
      $scope.savedUser = angular.copy $scope.user
      form.$setPristine()
      $scope.profileFlashMessage = "changes saved"



  