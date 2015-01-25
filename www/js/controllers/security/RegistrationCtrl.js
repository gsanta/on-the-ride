(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
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

}).call(this);

},{}]},{},[1])