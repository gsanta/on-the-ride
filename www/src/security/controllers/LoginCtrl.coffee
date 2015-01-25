LoginCtrl = ( $scope, $http, $timeout, LoginService, $location ) ->

    $scope.form = undefined

    $scope.user = {

    }

    $scope.submitForm = ( form ) ->
      if form.$valid
        promise = LoginService.login $scope.user.userName, $scope.user.password
        promise.then () ->
          LoginService.closeLoginDialog()
          LoginService.retryAuthentication()
        , () ->
          console.log "bejelentkezési hiba"


    $scope.getCssClasses = ( ngModelContoller ) ->
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
      }

    $scope.showError = ( ngModelController , error ) ->
      return ngModelController.$error[ error ]

    $scope.cancelForm = () ->
      LoginService.closeLoginDialog()
      $location.path('/map')

module.exports = LoginCtrl