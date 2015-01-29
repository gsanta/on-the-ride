var RegistrationCtrl;

RegistrationCtrl = function($scope, $http, $timeout, LoginService, $location) {
  $scope.form = void 0;
  $scope.user = {};
  $scope.submitForm = function(form) {
    var User, promise;
    if (form.$valid) {
      User = {
        userName: $scope.user.userName,
        password: $scope.user.password,
        email: $scope.user.email
      };
      promise = LoginService.signUp(User);
      return promise.then(function() {
        LoginService.closeRegistrationDialog();
        return LoginService.retryAuthentication();
      }, function() {
        return console.log("regisztrációs hiba");
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
    LoginService.closeRegistrationDialog();
    return $location.path('/map');
  };
};

module.exports = RegistrationCtrl;