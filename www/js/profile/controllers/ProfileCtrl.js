var ProfileCtrl;

ProfileCtrl = function($scope, DataProviderService, LoginService, UserService) {
  var promise;
  promise = DataProviderService.getUserInfo(LoginService.getSignedInUser());
  promise.then(function(data) {
    console.log(data);
    $scope.user = data;
    return $scope.savedUser = angular.copy($scope.user);
  });
  window.scope = $scope;
  $scope.user = {};
  $scope.savedUser = {};
  $scope.newPassword = void 0;
  $scope.passwordChange = {};
  $scope.profileFlashMessage = $scope.passwordFlashMessage = "";
  $scope.getValue = function() {
    return console.log($scope.profileFlashMessage);
  };
  $scope.getCssClasses = function(ngModelContoller) {
    return {
      error: ngModelContoller.$invalid && ngModelContoller.$dirty
    };
  };
  $scope.showError = function(ngModelController, error) {
    return ngModelController.$error[error];
  };
  $scope.canSaveForm = function(form) {
    return form.$valid;
  };
  $scope.canSaveProfileForm = function(form) {
    return form.$valid && ($scope.user.email !== $scope.savedUser.email);
  };
  $scope.submitPasswordChangeForm = function(form) {
    if (form.$dirty && form.$invalid) {
      return;
    }
    promise = LoginService.changePassword($scope.user.userName, $scope.passwordChange.password, $scope.passwordChange.newPassword);
    return promise.then(function() {
      $scope.passwordChange = {};
      form.$setPristine();
      return $scope.passwordFlashMessage = "changes saved";
    });
  };
  return $scope.submitProfileForm = function(form) {
    if (form.$dirty && form.$invalid) {
      return;
    }
    console.log("1: " + $scope.profileFlashMessage);
    promise = UserService.changeProfileData($scope.user.userName, $scope.user);
    return promise.then(function(User) {
      $scope.user = User;
      $scope.savedUser = angular.copy($scope.user);
      form.$setPristine();
      $scope.profileFlashMessage = "changes saved: " + Date.now();
      return console.log("2: " + $scope.profileFlashMessage);
    });
  };
};

module.exports = ProfileCtrl;