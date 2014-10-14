angular.module "controllers"
.controller 'RegistrationCtrl', ( $scope, $http, $timeout, LoginService ) ->

    $scope.form = undefined

    $scope.user = {

    }

    $scope.submitForm = ( form ) ->
      if form.$valid
        User = 
          userName: $scope.user.userName,
          password: $scope.user.password,
          email: $scope.user.email
        promise = LoginService.signUp User
        promise.then () ->
          LoginService.closeRegistrationDialog()
          LoginService.retryAuthentication()
        , () ->
          console.log "regisztrációs hiba"


    $scope.getCssClasses = ( ngModelContoller ) ->
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
      }

    $scope.showError = ( ngModelController , error ) ->
      return ngModelController.$error[ error ]

    $scope.cancelForm = () ->
      LoginService.closeRegistrationDialog()