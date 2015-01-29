var LoginCtrl;

LoginCtrl = function($scope, $http, $timeout, LoginService, $location) {
  $scope.form = void 0;
  $scope.user = {};
  $scope.submitForm = function(form) {
    var promise;
    if (form.$valid) {
      promise = LoginService.login($scope.user.userName, $scope.user.password);
      return promise.then(function() {
        LoginService.closeLoginDialog();
        return LoginService.retryAuthentication();
      }, function() {
        return console.log("bejelentkezési hiba");
      });
    }
  };
  $scope.getCssClasses = function(ngModelContoller) {
    return {
      error: ngModelContoller.$invalid && ngModelContoller.$dirty
    };
  };
  $scope.showError = function(ngModelController, error) {
    return ngModelController.$error[error];
  };
  return $scope.cancelForm = function() {
    LoginService.closeLoginDialog();
    return $location.path('/map');
  };
};

module.exports = LoginCtrl;
