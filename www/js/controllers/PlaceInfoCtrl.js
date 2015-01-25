(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var PlaceInfoCtrl;

  PlaceInfoCtrl = function($scope, $http, DataProviderService) {
    $scope.categories = [
      {
        name: "Accomodation"
      }, {
        name: "Shop"
      }, {
        name: "Sight"
      }
    ];
    $scope.category = "";
    $scope.description = "";
    $scope.latitude = "";
    $scope.longitude = "";
    $scope.getCssClasses = function(ngModelContoller) {
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
        success: ngModelContoller.$valid && ngModelContoller.$dirty
      };
    };
    $scope.showError = function(ngModelController, error) {
      return ngModelController.$error[error];
    };
    $scope.canSave = function() {
      return $scope.infoForm.$dirty && $scope.infoForm.$valid;
    };
    $scope.save = function() {
      var data;
      return data = {
        category: $scope.category.name,
        desc: $scope.description,
        lat: $scope.latitude,
        lon: $scope.longitude
      };
    };
    return DataProviderService.savePlaceInfo(data).success(function() {
      return alert("success saving info data");
    }).error(function() {
      return alert("failure saving info data");
    });
  };

  module.exports = PlaceInfoCtrl;

}).call(this);

},{}]},{},[1])