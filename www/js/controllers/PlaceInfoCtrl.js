// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("controllers").controller("PlaceInfoCtrl", function($scope, $http, DataProvider) {
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
    return DataProvider.savePlaceInfo(data).success(function() {
      return alert("success saving info data");
    }).error(function() {
      return alert("failure saving info data");
    });
  });

}).call(this);
