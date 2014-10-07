// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("controllers").controller('ProfileCtrl', function($scope, DataProvider, LoginService, UserService, flash) {
    var promise;
    promise = DataProvider.getUserInfo("gsanta");
    promise.then(function(data) {
      return $scope.user = data;
    });
    $scope.user = {};
    $scope.newPassword = void 0;
    $scope.passwordChange = {};
    $scope.getCssClasses = function(ngModelContoller) {
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
        success: ngModelContoller.$valid && ngModelContoller.$dirty
      };
    };
    $scope.showError = function(ngModelController, error) {
      console.log("shoError: " + ngModelController.$error[error]);
      return ngModelController.$error[error];
    };
    $scope.canSaveForm = function(form) {
      return form.$valid;
    };
    $scope.submitPasswordChangeForm = function(form) {
      if (form.$dirty && form.$invalid) {
        return;
      }
      promise = LoginService.changePassword($scope.user.userName, $scope.passwordChange.password, $scope.passwordChange.newPassword);
      return promise.then(function() {
        $scope.passwordChange = {};
        return form.$setPristine();
      });
    };
    return $scope.submitProfileForm = function(form) {
      if (form.$dirty && form.$invalid) {
        return;
      }
      promise = UserService.changeProfileData($scope.user.userName, $scope.user);
      return promise.then(function(User) {
        $scope.user = User;
        form.$setPristine();
        return flash('Saved!');
      });
    };
  });

}).call(this);
