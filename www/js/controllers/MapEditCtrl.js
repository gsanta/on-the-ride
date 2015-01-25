(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var MapEditCtrl;

  MapEditCtrl = function($scope, $http, $timeout, MapEditorService, BicycleRouteService, BicycleRouteBuilderService, DataProviderService, BicycleRouteDaoService, VoteDaoService, LocalDataProviderService, Coord, LoginService, MapConstants) {
    var canLoadMapAgain, clearArray, copyEditedMarkers, editedMarkers, markers, newNodeCounter, polylines, routePolyline;
    routePolyline = void 0;
    canLoadMapAgain = true;
    newNodeCounter = -1;
    editedMarkers = [];
    markers = [];
    polylines = [];
    clearArray = function(array) {
      var obj, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        obj = array[_i];
        _results.push(obj.setMap(null));
      }
      return _results;
    };
    copyEditedMarkers = function(fromArray, toAssocArray) {
      var obj, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fromArray.length; _i < _len; _i++) {
        obj = fromArray[_i];
        if (obj.nodeInfo.changed) {
          _results.push(toAssocArray[obj.nodeInfo._id] = obj);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    $scope.routeInfo = void 0;
    $scope.map = void 0;
    $scope.isThereEditedNode = false;
    $scope.infoWindow = {
      isDisplayed: false
    };
    $scope.loadRoute = function() {
      var bounds, mapIds, mapZoom, ne, routeInfoPromise, sw;
      bounds = $scope.map.getBounds();
      ne = bounds.getNorthEast();
      sw = bounds.getSouthWest();
      mapZoom = MapEditorService.calculateZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()));
      mapIds = MapEditorService.getMapsForAreaAtZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()), mapZoom - 1);
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var route;
        route = BicycleRouteService.createRouteFromNodes(data, 1, [0]);
        routePolyline.setMap(null);
        routePolyline = BicycleRouteBuilderService.createPolylineFromRoute(route);
        return routePolyline.setMap($scope.map);
      });
    };
    $scope.loadRouteInfo = function() {};
    $scope.isEdit = true;
    $scope.initMap = function() {
      var routeInfoPromise;
      window.routeInfo = $scope.routeInfo;
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var centerCoordinates;
        $scope.routeInfo = data;
        return centerCoordinates = BicycleRouteBuilderService.createCoordinate(data[0].lat, data[0].lon);
      });
    };
    $scope.savePoints = function() {
      var addNodes, k, updateNodes, v;
      updateNodes = [];
      addNodes = [];
      copyEditedMarkers(markers, editedMarkers);
      for (k in editedMarkers) {
        v = editedMarkers[k];
        if (v.nodeInfo._id < 0) {
          addNodes.push(v.nodeInfo);
        } else {
          updateNodes.push(v.nodeInfo);
        }
      }
      BicycleRouteDaoService.savePoints(updateNodes);
      BicycleRouteDaoService.addPoints(addNodes);
      return $scope.isThereEditedNode = false;
    };
    $scope.addPoint = function() {
      var marker;
      marker = BicycleRouteBuilderService.addNewPointToCenterOfMap($scope.map, $scope);
      marker.nodeInfo._id = newNodeCounter;
      $scope.isThereEditedNode = true;
      newNodeCounter--;
      editedMarkers.push(marker);
      return markers.push(marker);
    };
    $scope.infoBoxes = [];
    $scope.vote = {
      value: 1,
      isReset: true
    };
    $scope.$watch('vote.isReset', function(newValue, oldValue) {
      return console.log("reset watch: " + newValue);
    });
    return $scope.$watch('vote.value', function(newValue, oldValue) {
      var nodeId, user;
      console.log("reset: " + $scope.vote.isReset);
      newValue = parseInt(newValue);
      oldValue = parseInt(oldValue);
      if (!$scope.vote.isReset && newValue !== oldValue) {
        console.log("send: " + oldValue + "," + newValue + ", " + $scope.vote.isReset);
        user = LoginService.getUserName();
        nodeId = $scope.actNode._id;
        VoteDaoService.sendUserVoteForNode(user, nodeId, newValue);
      }
      return $scope.vote.isReset = false;
    });
  };

  module.exports = MapEditCtrl;

}).call(this);

},{}]},{},[1])