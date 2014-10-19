// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("controllers").controller('MapEditCtrl', function($scope, $http, $timeout, Map, DataProvider, LocalDataProviderService, Coord) {
    var canLoadMapAgain, click, dragEnd, dragStart, newCircleId, routePolyline;
    routePolyline = void 0;
    canLoadMapAgain = true;
    newCircleId = -1;
    dragStart = function(c) {
      return google.maps.event.addListener(c, 'dragstart', function(e) {
        var pointOptions;
        console.log("start");
        console.log($scope.editedCircles[c._id]);
        if ($scope.editedCircles[c._id] === void 0) {
          $scope.editedCircles.len++;
          console.log("len: " + $scope.editedCircles.len);
          $scope.editedCircles[c._id] = c;
          pointOptions = {
            strokeColor: '#ffff00',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#ffff00',
            fillOpacity: 0.35,
            draggable: true,
            map: c.map,
            center: c.center,
            radius: c.radius
          };
          c.setOptions(pointOptions);
        }
        $scope.currentEditableCircle = c;
        return $scope.$apply();
      });
    };
    dragEnd = function(c) {
      return google.maps.event.addListener(c, 'dragend', function(e) {
        $scope.currentEditableCircle = null;
        return $scope.$apply();
      });
    };
    click = function(c) {
      return google.maps.event.addListener(c, 'click', function(e) {
        return 1;
      });
    };
    $scope.routeInfo = void 0;
    $scope.map = void 0;
    $scope.currentEditableCircle = void 0;
    $scope.editedCircles = {
      len: 0
    };
    $scope.loadRoute = function() {
      var bounds, mapIds, mapZoom, ne, routeInfoPromise, sw;
      bounds = $scope.map.getBounds();
      ne = bounds.getNorthEast();
      sw = bounds.getSouthWest();
      mapZoom = Map.calculateZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()));
      mapIds = Map.getMapsForAreaAtZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()), mapZoom - 1);
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var route;
        route = Map.createRouteFromNodeArray(data, 1, [0]);
        routePolyline.setMap(null);
        routePolyline = Map.createPolylineFromRoute(route);
        return routePolyline.setMap($scope.map);
      });
    };
    $scope.initMap = function() {
      var routeInfoPromise;
      window.$scope = $scope;
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var centerCoordinates, circles;
        $scope.routeInfo = data;
        centerCoordinates = Map.createCoordinate(data[0].lat, data[0].lon);
        $scope.map = new google.maps.Map(document.querySelector('#container-map-edit').querySelector('#googleMap'), Map.createMapProperties(centerCoordinates, 3));
        return circles = Map.createMarkersFromRoute(data, $scope.map, $scope);
      });
    };
    $scope.savePoints = function() {
      var addCircles, k, pointOptions, updateCircles, v, _ref;
      updateCircles = [];
      addCircles = [];
      _ref = $scope.editedCircles;
      for (k in _ref) {
        v = _ref[k];
        if (k !== "len") {
          pointOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            draggable: true,
            map: v.map,
            center: v.center,
            radius: v.radius
          };
          v.setOptions(pointOptions);
          if (v._id < 0) {
            addCircles.push(v);
          } else {
            updateCircles.push(v);
          }
        }
      }
      Map.savePoints(updateCircles);
      Map.addPoints(addCircles);
      $scope.currentEditableCircle = null;
      return $scope.editedCircles = {
        len: 0
      };
    };
    $scope.addPoint = function() {
      var circle;
      circle = Map.addPointToCenterOfMap($scope.map);
      circle._id = newCircleId--;
      dragStart(circle);
      return dragEnd(circle);
    };
    return $scope.infoBoxes = [];
  });

}).call(this);
