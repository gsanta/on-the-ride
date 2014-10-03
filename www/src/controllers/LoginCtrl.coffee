angular.module "controllers"
.controller 'LoginCtrl', ( $scope, $http, $timeout, LoginService ) ->

    $scope.signUp = ( User ) ->
      returnedPromise = LoginService.addUser User

      returnedPromise.then (response) ->
        console.log("addUser success")
        console.log(response)
      ,(response) ->
        console.log("addUser failure")
        console.log(response)