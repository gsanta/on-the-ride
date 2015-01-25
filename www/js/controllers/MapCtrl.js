(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var MapCtrl;

  MapCtrl = function($scope, $http, $timeout, MapService, DataProviderService, LocalDataProviderService, Coord) {
    var canLoadMapAgain, routePolyline;
    routePolyline = void 0;
    canLoadMapAgain = true;
    $scope.routeInfo = void 0;
    $scope.map = void 0;
    $scope.loadRoute = function() {
      var bounds, mapIds, mapZoom, ne, routeInfoPromise, sw;
      bounds = $scope.map.getBounds();
      ne = bounds.getNorthEast();
      sw = bounds.getSouthWest();
      mapZoom = MapService.calculateZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()));
      mapIds = MapService.getMapsForAreaAtZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()), mapZoom - 1);
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var route;
        route = MapService.createRouteFromNodeArray(data, 1, [0]);
        routePolyline.setMap(null);
        routePolyline = MapService.createPolylineFromRoute(route);
        return routePolyline.setMap($scope.map);
      });
    };
    $scope.initMap = function() {
      var routeInfoPromise;
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var centerCoordinates, route;
        $scope.routeInfo = data;
        centerCoordinates = MapService.createCoordinate(data[0].lat, data[0].lon);
        $scope.map = new google.maps.Map(document.querySelector('#view-map').querySelector('#googleMap'), MapService.createMapProperties(centerCoordinates, 3));
        $scope.map.getBounds();
        route = MapService.createRouteFromNodeArray(data, 1, [0]);
        routePolyline = MapService.createPolylineFromRoute(route);
        routePolyline.setMap($scope.map);
        google.maps.event.addListener($scope.map, 'zoom_changed', function() {
          return 1;
        });
        return google.maps.event.addListener($scope.map, "bounds_changed", function() {
          var callback;
          if (canLoadMapAgain) {
            $scope.loadRoute();
            callback = function() {
              return canLoadMapAgain = true;
            };
            $timeout(callback, 5000);
          }
          return canLoadMapAgain = false;
        });
      });
    };
    return $scope.infoBoxes = [];
  };

  module.exports = MapCtrl;

}).call(this);

},{}]},{},[1])