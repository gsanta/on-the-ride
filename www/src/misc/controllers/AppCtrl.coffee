AppCtrl = ( $scope, $http, $timeout, LoginService ) ->

  $scope.security = {
    
    isLoggedIn: () ->
      LoginService.isLoggedIn()

    signUp: () ->
      LoginService.openRegistrationDialog()

    login: () ->
      LoginService.openLoginDialog()

    logout: () ->
      LoginService.logout()

  }


module.exports = AppCtrl