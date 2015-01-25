(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var classesModule, controllersModule, directivesModule, servicesModule;

servicesModule = angular.module("services", []);

classesModule = angular.module("classes", []);

directivesModule = angular.module("directives", []);

controllersModule = angular.module("controllers", ["services", "directives"]);

require('./services');

require('./dao');

require('./editor');

require('./map_builder');

require('./map_calculation');

require('./misc');

require('./profile');

require('./security');

servicesModule.config(function($httpProvider) {
  return $httpProvider.responseInterceptors.push('SecurityInterceptor');
});

angular.module('starter', ['ionic', 'controllers', 'services', 'classes', 'directives', 'ui.gravatar']).run(function($ionicPlatform, $rootScope, $location, LoginService) {
  return $ionicPlatform.ready(function() {
    if ((window.cordova != null) && (window.cordova.plugins.Keyboard != null)) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar != null) {
      return StatusBar.styleDefault;
    }
  });
}).config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('map', {
    url: "/map",
    templateUrl: 'templates/mapEdit.html',
    controller: 'MapEditCtrl'
  }).state('profile', {
    url: "/profile",
    templateUrl: 'templates/profile.html',
    controller: 'ProfileCtrl',
    resolve: {
      auth: function($q, $injector, LoginService) {
        return LoginService.getSignedInUser();
      }
    }
  }).state('loginTemp', {
    url: "/loginTemp",
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });
  return $urlRouterProvider.otherwise('/map');
});



},{"./dao":2,"./editor":6,"./map_builder":9,"./map_calculation":13,"./misc":20,"./profile":23,"./security":26,"./services":32}],2:[function(require,module,exports){
var module;

module = angular.module("services");

module.factory('BicycleRouteDaoService', require('./services/BicycleRouteDaoService'));

module.factory('VoteDaoService', require('./services/VoteDaoService'));



},{"./services/BicycleRouteDaoService":3,"./services/VoteDaoService":4}],3:[function(require,module,exports){
var BicycleRouteDaoService;

BicycleRouteDaoService = function() {
  var factoryObj;
  factoryObj = {
    savePoints: function(nodes) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        _results.push(LocalDataProviderService.updateNode(node._id, {
          lat: node.lat,
          lon: node.lon
        }));
      }
      return _results;
    },
    addPoints: function(nodes) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        _results.push(LocalDataProviderService.addNode({
          user: node.user,
          lat: node.lat,
          lon: node.lon
        }));
      }
      return _results;
    }
  };
  return factoryObj;
};

module.exports = BicycleRouteDaoService;



},{}],4:[function(require,module,exports){
var VoteDaoService;

VoteDaoService = function() {
  var factoryObj;
  factoryObj = {
    getUserVoteToPoint: function(userName, nodeId) {
      var deferred, httpPromise;
      deferred = $q.defer();
      httpPromise = $http.get("/vote/" + userName + "/" + nodeId);
      httpPromise.then(function(resp) {
        if (resp.data.then != null) {
          return resp.data.then(function(data) {
            if (data === void 0) {
              data = {
                user: userName,
                node: nodeId,
                vote: 1
              };
            }
            return deferred.resolve(data);
          });
        }
      });
      return deferred.promise;
    },
    getAllVotesToNode: function(nodeId) {
      var deferred, httpPromise;
      deferred = $q.defer();
      httpPromise = $http.get("/vote/" + nodeId);
      httpPromise.then(function(resp) {
        if (resp.data.then != null) {
          return resp.data.then(function(data) {
            if (data === void 0) {
              data = {
                nodeId: nodeId,
                pos: 0,
                neg: 0
              };
            }
            return deferred.resolve(data);
          });
        }
      });
      return deferred.promise;
    },
    sendUserVoteForNode: function(userName, nodeId, vote) {
      return $http.post("/vote/new", {
        user: userName,
        nodeId: nodeId,
        vote: vote
      });
    }
  };
  return factoryObj;
};

module.exports = VoteDaoService;



},{}],5:[function(require,module,exports){
var MapEditCtrl;

MapEditCtrl = function($scope, $http, $timeout, MapEditorService, BicycleRouteService, BicycleRouteBuilderService, DataProviderService, BicycleRouteDaoService, MapBuilderService, VoteDaoService, LocalDataProviderService, Coord, LoginService, MapConstants) {
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
    routeInfoPromise.then(function(data) {
      var centerCoordinates;
      $scope.routeInfo = data;
      BicycleRouteBuilderService.createCoordinate(data[0].lat, data[0].lon);
      centerCoordinates = BicycleRouteBuilderService.createCoordinate(data[0].lat, data[0].lon);
      $scope.map = new google.maps.Map(document.querySelector('#container-map-edit').querySelector('#googleMap'), MapBuilderService.createMapProperties(centerCoordinates, 13));
      polylines.push(BicycleRouteBuilderService.createPolylineFromRoute(data, $scope.map));
      return google.maps.event.addListener($scope.map, 'zoom_changed', function() {
        return $scope.loadRouteInfo();
      });
    });
    return console.log("oke");
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



},{}],6:[function(require,module,exports){
var controllersModule, servicesModule;

servicesModule = angular.module("services");

controllersModule = angular.module("controllers");

servicesModule.factory('MapEditorService', require('./services/MapEditorService'));

controllersModule.controller('MapEditCtrl', require('./controllers/MapEditCtrl'));



},{"./controllers/MapEditCtrl":5,"./services/MapEditorService":7}],7:[function(require,module,exports){
var MapEditorService;

MapEditorService = function() {
  var factoryObj;
  factoryObj = {
    createAssocArrayFromChangedMarkers: function(markers) {
      var assoc, marker, _i, _len, _results;
      assoc = [];
      _results = [];
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        if (marker.nodeInfo.changed) {
          _results.push(assoc[marker.nodeInfo._id] = marker);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };
  return factoryObj;
};

module.exports = MapEditorService;



},{}],8:[function(require,module,exports){
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



},{}],9:[function(require,module,exports){
var controllersModule, servicesModule;

servicesModule = angular.module("services");

controllersModule = angular.module("controllers");

controllersModule.controller('MapCtrl', require('./controllers/MapCtrl'));

servicesModule.factory('BicycleRouteBuilderService', require('./services/BicycleRouteBuilderService'));

servicesModule.factory('InfoWindowService', require('./services/InfoWindowService'));

servicesModule.factory('MapBuilderService', require('./services/MapBuilderService'));



},{"./controllers/MapCtrl":8,"./services/BicycleRouteBuilderService":10,"./services/InfoWindowService":11,"./services/MapBuilderService":12}],10:[function(require,module,exports){
var BicycleRouteBuilderService;

BicycleRouteBuilderService = function(InfoWindowService) {
  var addClickEventToMarker, addDragendEventToMarker, factoryObj;
  addClickEventToMarker = function(marker, scope, node, content, googleMap) {
    return google.maps.event.addListener(marker, 'click', function() {
      var allVotesPromise, nodeId, userVotePromise;
      nodeId = parseInt(node._id);
      userVotePromise = factoryObj.getUserVoteToPoint(LoginService.getUserName(), nodeId);
      allVotesPromise = factoryObj.getAllVotesToNode(nodeId);
      scope.actNode = node;
      allVotesPromise.then(function(data) {
        scope.actNode.vote_pos = data.pos;
        return scope.actNode.vote_neg = data.neg;
      });
      userVotePromise.then(function(data) {
        return scope.vote.value = data.vote;
      });
      scope.$apply();
      InfoWindowService.getInfoWindow().setContent(content);
      return InfoWindowService.getInfoWindow().open(googleMap, marker);
    });
  };
  addDragendEventToMarker = function(marker, scope) {
    return google.maps.event.addListener(marker, 'dragend', function(event) {
      marker.nodeInfo.changed = true;
      marker.nodeInfo.lat = event.latLng.k;
      marker.nodeInfo.lon = event.latLng.B;
      return scope.isThereEditedNode = true;
    });
  };
  return factoryObj = {
    createPolylineFromRoute: function(route, googleMap) {
      var coordinates, node, routePolyline, _i, _len;
      coordinates = [];
      for (_i = 0, _len = route.length; _i < _len; _i++) {
        node = route[_i];
        coordinates.push(new google.maps.LatLng(node.lat, node.lon));
      }
      routePolyline = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMap
      });
      return routePolyline;
    },
    createMarkersFromRoute: function(route, googleMap, scope) {
      var compiled, index, marker, markerOptions, markers, node, _i, _len;
      markers = [];
      compiled = $compile(infoWindowContent)(scope);
      scope.markers = markers;
      for (index = _i = 0, _len = route.length; _i < _len; index = ++_i) {
        node = route[index];
        markerOptions = {
          map: googleMap,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(node.lat, node.lon)
        };
        marker = new google.maps.Marker(markerOptions);
        marker.nodeInfo = node;
        markers.push(marker);
        addClickEventToMarker(marker, scope, node, compiled[0], googleMap);
        addDragendEventToMarker(marker, scope);
      }
      console.log(markers);
      return markers;
    },
    addNewPointToCenterOfMap: function(googleMap, scope) {
      var compiled, marker, markerOptions;
      compiled = $compile(infoWindowContent)(scope);
      markerOptions = {
        map: googleMap,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: googleMap.getCenter()
      };
      marker = new google.maps.Marker(markerOptions);
      marker.nodeInfo = {
        user: LoginService.getUserName(),
        vote_pos: 0,
        vote_neg: 0,
        changed: true,
        lat: googleMap.getCenter().k,
        lon: googleMap.getCenter().B,
        _id: -1
      };
      addClickEventToMarker(marker, scope, marker.nodeInfo, compiled[0], googleMap);
      addDragendEventToMarker(marker, scope);
      return marker;
    },
    createCoordinate: function(lat, lon) {
      return new google.maps.LatLng(lat, lon);
    },
    addClickEventToMarker: function(marker, scope, node, content, googleMap) {
      return google.maps.event.addListener(marker, 'click', function() {
        var allVotesPromise, nodeId, userVotePromise;
        nodeId = parseInt(node._id);
        userVotePromise = factoryObj.getUserVoteToPoint(LoginService.getUserName(), nodeId);
        allVotesPromise = factoryObj.getAllVotesToNode(nodeId);
        scope.actNode = node;
        allVotesPromise.then(function(data) {
          scope.actNode.vote_pos = data.pos;
          return scope.actNode.vote_neg = data.neg;
        });
        userVotePromise.then(function(data) {
          return scope.vote.value = data.vote;
        });
        scope.$apply();
        InfoWindowService.getInfoWindow().setContent(content);
        return InfoWindowService.getInfoWindow().open(googleMap, marker);
      });
    }
  };
};

module.exports = BicycleRouteBuilderService;



},{}],11:[function(require,module,exports){
var InfoWindowService, factoryObj;

InfoWindowService = function() {
  var infoWindowContent, infowindow;
  infoWindowContent = '<div>\n  <div class="list">\n      <div class="item item-divider">\n        Basic info\n      </div>\n\n      <div class="item"> \n        User: {{actNode.user}}<br/>\n        Id: {{actNode.lat}}\n      </div>\n\n      <div class="item item-divider">\n        How accurate this point is?\n      </div>\n\n      <div class="item range range-energized"> \n        <div> \n        <input type="range" name="volume" min="0" max="2" value="1" ng-model="vote.value">\n        </div>\n        <div>\n          <i class="icon ion-happy">&nbsp;{{actNode.vote_pos}}</i>\n          <i class="icon ion-sad">&nbsp;{{actNode.vote_neg}}</i>\n        </div>\n      </div>\n  </div>\n</div>\n';
  infowindow = new google.maps.InfoWindow();
  return google.maps.event.addListener(infowindow, 'closeclick', function() {
    return 1;
  });
};

factoryObj = {
  getInfoWindow: function() {
    return infowindow;
  }
};

module.exports = InfoWindowService;



},{}],12:[function(require,module,exports){
var MapBuilderService;

MapBuilderService = function() {
  var factoryObj;
  factoryObj = {
    createMapProperties: function(centerPosition, zoom, mapTypeId) {
      var mapProp;
      mapProp = {
        center: centerPosition,
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };
      if (mapTypeId != null) {
        mapProp.mapTypeId = mapTypeId;
      }
      return mapProp;
    }
  };
  return factoryObj;
};

module.exports = MapBuilderService;



},{}],13:[function(require,module,exports){
var module;

module = angular.module("services");

module.factory('BicycleRouteService', require('./services/BicycleRouteService'));

module.factory('MapPartitionService', require('./services/MapPartitionService'));



},{"./services/BicycleRouteService":14,"./services/MapPartitionService":15}],14:[function(require,module,exports){
var BicycleRouteService,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BicycleRouteService = function() {
  var createRouteFromStartNode, factoryObj;
  ({
    getStartNodeOfMapId: function(nodes, mapId) {
      var node, _i, _len;
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        if (__indexOf.call(node.startNodeInMap, mapId) >= 0) {
          return node;
        }
      }
      return null;
    }
  });
  createRouteFromStartNode = function(startNode) {
    var actNode, route;
    route = [];
    actNode = startNode;
    while (actNode !== void 0) {
      route.push(actNode);
      if (actNode.weight < zoom) {
        actNode = nodeAssocMap[actNode.siblings[0]];
      } else {
        actNode = nodeAssocMap[actNode.siblings[MapConstants.max_zoom - zoom]];
      }
    }
    return route;
  };
  factoryObj = {
    createRouteFromNodes: function(routeNodes, zoom, mapIds) {
      var finalRoute, mapId, node, route, routeNodesMap, startNode, startNodes, _i, _j, _k, _len, _len1, _len2;
      if (zoom > MapConstants.max_zoom) {
        throw new Error("zoom is bigger than the maximum (use MapConstants.max_zoom)");
      }
      if (zoom < 1) {
        throw new Error("zoom is smaller than the minimum (use MapConstants.min_zoom)");
      }
      routeNodesMap = {};
      for (_i = 0, _len = routeNodes.length; _i < _len; _i++) {
        node = routeNodes[_i];
        routeNodesMap[node._id] = node;
      }
      startNodes = [];
      for (_j = 0, _len1 = mapIds.length; _j < _len1; _j++) {
        mapId = mapIds[_j];
        startNode = this.getStartNodeOfMapId(routeNodes, mapId);
        if (startNode) {
          startNodes.push(startNode);
        }
      }
      finalRoute = [];
      for (_k = 0, _len2 = startNodes.length; _k < _len2; _k++) {
        startNode = startNodes[_k];
        route = createRouteFromStartNode(startNode);
        if (route.length > finalRoute.length) {
          finalRoute = route;
        }
      }
      return finalRoute;
    }
  };
  return factoryObj;
};

module.exports = BicycleRouteService;



},{}],15:[function(require,module,exports){
var MapPartitionService;

MapPartitionService = function() {
  var factoryObj, mapZoomDiameterSquares;
  mapZoomDiameterSquares = [5825, 1456.25, 364.0625, 91.016, 22.754, 5.691, 1.422, 0.3557, 0.0892];
  ({
    calculateMapIdForNodeAtZoom: function(coord, zoom) {
      var adjustedCoord, column, distFromLatStart, distFromLonStart, index, latFullLen, latLenAtZoom, lonFullLen, lonLenAtZoom, mapIdOffset, row, rowsColumnsAtZoom, _i;
      adjustedCoord = adjustCoordIfOutOfBounds(coord);
      rowsColumnsAtZoom = Math.pow(2, zoom);
      latFullLen = Math.abs(MapConstants.latStart - MapConstants.latEnd);
      lonFullLen = Math.abs(MapConstants.lonStart - MapConstants.lonEnd);
      distFromLatStart = Math.abs(MapConstants.latStart - adjustedCoord.lat);
      distFromLonStart = Math.abs(MapConstants.lonStart - adjustedCoord.lon);
      latLenAtZoom = latFullLen / rowsColumnsAtZoom;
      lonLenAtZoom = lonFullLen / rowsColumnsAtZoom;
      row = Math.floor(distFromLatStart / latLenAtZoom) + 1;
      column = Math.floor(distFromLonStart / lonLenAtZoom) + 1;
      mapIdOffset = 0;
      for (index = _i = 0; 0 <= zoom ? _i < zoom : _i > zoom; index = 0 <= zoom ? ++_i : --_i) {
        mapIdOffset += Math.pow(4, index);
      }
      return mapIdOffset + (row - 1) * rowsColumnsAtZoom + column - 1;
    },
    adjustCoordIfOutOfBounds: function(coord) {
      var adjustedCoord;
      adjustedCoord = {
        lat: coord.lat,
        lon: coord.lon
      };
      if (coord.lon >= MapConstants.lonEnd) {
        coord.lon = MapConstants.lonEnd - 0.00001;
      } else if (coord.lon < MapConstants.lonStart) {
        coord.lon = MapConstants.lonStart;
      }
      if (coord.lat <= MapConstants.latEnd) {
        coord.lat = MapConstants.latEnd + 0.00001;
      } else if (coord.lat > MapConstants.latStart) {
        coord.lat = MapConstants.latStart;
      }
      return adjustedCoord;
    }
  });
  factoryObj = {
    getMapsForAreaAtZoom: function(topLeftCoord, bottomRightCoord, zoom) {
      var blId, bottomLeftCoord, brId, ids, k, set, tlId, topRightCoord, trId, v;
      bottomLeftCoord = new Coord(topLeftCoord.lon, bottomRightCoord.lat);
      topRightCoord = new Coord(bottomRightCoord.lon, topLeftCoord.lat);
      tlId = this.calculateMapIdForNodeAtZoom(topLeftCoord, zoom);
      trId = this.calculateMapIdForNodeAtZoom(topRightCoord, zoom);
      blId = this.calculateMapIdForNodeAtZoom(bottomLeftCoord, zoom);
      brId = this.calculateMapIdForNodeAtZoom(bottomRightCoord, zoom);
      set = {};
      set[tlId] = 1;
      set[trId] = 1;
      set[blId] = 1;
      set[brId] = 1;
      ids = [];
      for (k in set) {
        v = set[k];
        ids.push(parseInt(k, 10));
      }
      return ids;
    },
    calculateZoomForArea: function(topLeftCoord, bottomRightCoord) {
      var actDistanceSquare, dist, index, lat1, lat2, lon1, lon2, _i, _len;
      lon1 = parseFloat(topLeftCoord.lon);
      lon2 = parseFloat(bottomRightCoord.lon);
      lat1 = parseFloat(topLeftCoord.lat);
      lat2 = parseFloat(bottomRightCoord.lat);
      actDistanceSquare = Math.pow(lon1 - lon2, 2) + Math.pow(lat1 - lat2, 2);
      for (index = _i = 0, _len = mapZoomDiameterSquares.length; _i < _len; index = ++_i) {
        dist = mapZoomDiameterSquares[index];
        if (dist < actDistanceSquare) {
          if (index === 0) {
            return 0;
          } else {
            return index;
          }
        }
      }
      return mapZoomDiameterSquares.length - 1;
    }
  };
  return factoryObj;
};

module.exports = MapPartitionService;



},{}],16:[function(require,module,exports){
var Coord;

Coord = function() {
  Coord = (function() {
    function Coord(lon, lat) {
      this.lat = lat;
      this.lon = lon;
    }

    return Coord;

  })();
  return Coord;
};

module.exports = Coord;



},{}],17:[function(require,module,exports){
var AppCtrl;

AppCtrl = function($scope, $http, $timeout, LoginService) {
  return $scope.security = {
    isLoggedIn: function() {
      return LoginService.isLoggedIn();
    },
    signUp: function() {
      return LoginService.openRegistrationDialog();
    },
    login: function() {
      return LoginService.openLoginDialog();
    },
    logout: function() {
      return LoginService.logout();
    }
  };
};

module.exports = AppCtrl;



},{}],18:[function(require,module,exports){
var flash;

flash = function($timeout) {
  return {
    restrict: 'E',
    template: "<button></button>",
    replace: true,
    scope: {
      content: "=",
      timeout: "@"
    },
    compile: function(element, attrs) {
      element.css("display", "none");
      if (!attrs.timeout) {
        attrs.timeout = 3000;
      }
      return function(scope, element, attrs) {
        return scope.$watch(function() {
          return scope.content;
        }, function(value) {
          var hideElement;
          if (value === "") {
            return;
          }
          element.text(value);
          element.css("display", "block");
          scope.content = "";
          hideElement = function() {
            scope.content = "";
            scope.$apply(function() {
              return scope.content = "";
            });
            return element.css("display", "none");
          };
          return $timeout(hideElement, parseInt(scope.timeout, 10));
        });
      };
    }
  };
};

module.exports = flash;



},{}],19:[function(require,module,exports){
var match;

match = function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      match: '='
    },
    link: function(scope, elem, attrs, ctrl) {
      return scope.$watch(function() {
        var modelValue;
        modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
        return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
      }, function(currentValue) {
        return ctrl.$setValidity('match', currentValue);
      });
    }
  };
};

module.exports = match;



},{}],20:[function(require,module,exports){
var classesModule, controllersModule, directivesModule, servicesModule;

controllersModule = angular.module("services");

servicesModule = angular.module("controllers");

directivesModule = angular.module("directives");

classesModule = angular.module("classes");

controllersModule.controller('AppCtrl', require('./controllers/AppCtrl'));

servicesModule.constant('MapConstants', require('./services/MapConstants'));

classesModule.factory('Coord', require('./classes/Coord'));

directivesModule.directive('flash', require('./directives/flash'));

directivesModule.directive('match', require('./directives/match'));



},{"./classes/Coord":16,"./controllers/AppCtrl":17,"./directives/flash":18,"./directives/match":19,"./services/MapConstants":21}],21:[function(require,module,exports){
var MapConstants;

MapConstants = {
  max_zoom: 9,
  google_map_internal_map_zoom_difference: 3,
  latStart: 70,
  lonStart: -10,
  latEnd: 30,
  lonEnd: 55,
  dbPrefix: "on_the_ride",
  maxZoom: 15,
  indexedDbVersion: 5
};

module.exports = MapConstants;



},{}],22:[function(require,module,exports){
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



},{}],23:[function(require,module,exports){
var module;

module = angular.module("controllers");

module.controller('ProfileCtrl', require('./controllers/ProfileCtrl'));



},{"./controllers/ProfileCtrl":22}],24:[function(require,module,exports){
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



},{}],25:[function(require,module,exports){
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



},{}],26:[function(require,module,exports){
var controllersModule, servicesModule;

servicesModule = angular.module("services");

controllersModule = angular.module("controllers");

controllersModule.controller('RegistrationCtrl', require('./controllers/RegistrationCtrl'));

controllersModule.controller('LoginCtrl', require('./controllers/LoginCtrl'));

servicesModule.factory('LoginService', require('./services/LoginService'));

servicesModule.factory('SecurityRetryQueue', require('./services/SecurityRetryQueue'));

servicesModule.factory('SecurityInterceptor', require('./services/SecurityInterceptor'));



},{"./controllers/LoginCtrl":24,"./controllers/RegistrationCtrl":25,"./services/LoginService":27,"./services/SecurityInterceptor":28,"./services/SecurityRetryQueue":29}],27:[function(require,module,exports){
var LoginService;

LoginService = function($http, $q, $location, SecurityRetryQueue, $ionicPopup, $rootScope, $timeout, $window) {
  var $scope, factoryObj, redirect;
  $scope = $rootScope.$new();
  SecurityRetryQueue.onItemAddedCallbacks.push(function(retryItem) {
    if (SecurityRetryQueue.hasMore()) {
      console.log("retry lefut");
      return factoryObj.showLoginDialog();
    }
  });
  $scope.loginDialog = void 0;
  $scope.registrationDialog = void 0;
  $scope.register = function() {
    console.log("register");
    if ($scope.loginDialog !== void 0) {
      $scope.loginDialog.close();
      $scope.loginDialog = void 0;
      return $timeout($scope.openRegistrationDialog, 1);
    }
  };
  $scope.login = function() {
    if ($scope.registrationDialog !== void 0) {
      $scope.registrationDialog.close();
      $scope.registrationDialog = void 0;
      return $timeout($scope.openLoginDialog, 1);
    }
  };
  $scope.openRegistrationDialog = function() {
    $scope.data = {};
    if ($scope.registrationDialog) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    return $scope.registrationDialog = $ionicPopup.show({
      templateUrl: "/templates/registration.html",
      title: 'Please sign up',
      scope: $scope
    });
  };
  $scope.openLoginDialog = function() {
    $scope.data = {};
    if ($scope.loginDialog) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    $scope.loginDialog = $ionicPopup.show({
      templateUrl: "/templates/login.html",
      title: 'Please log in',
      scope: $scope
    });
    $scope.retryAuthentication = function() {
      return SecurityRetryQueue.retryAll();
    };
    return $scope.cancelAuthentication = function() {
      SecurityRetryQueue.cancelAll();
      return redirect();
    };
  };
  redirect = function(url) {
    url = url || '/';
    return $location.path(url);
  };
  factoryObj = {
    openRegistrationDialog: function() {
      return $scope.openRegistrationDialog();
    },
    openLoginDialog: function() {
      return $scope.openLoginDialog();
    },
    closeLoginDialog: function() {
      $scope.loginDialog.close();
      return $scope.loginDialog = void 0;
    },
    closeRegistrationDialog: function() {
      $scope.registrationDialog.close();
      return $scope.registrationDialog = void 0;
    },
    retryAuthentication: function() {
      return SecurityRetryQueue.retryAll();
    },
    login: function(userName, password) {
      var deferred, handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            sessionStorage.setItem("userName", data.userName);
            return data;
          });
        } else {
          return data;
        }
      };
      return $http.post('login', {
        userName: userName,
        password: password
      }).then(handleResult);
      return deferred = $q.defer();
    },
    signUp: function(User) {
      var deferred, handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            sessionStorage.setItem("userName", data.userName);
            return data;
          });
        } else {
          return data;
        }
      };
      return $http.post('signUp', User).then(handleResult);
      return deferred = $q.defer();
    },
    logout: function() {
      sessionStorage.removeItem("userName");
      return $window.location.href = "/map";
    },
    showLoginDialog: function() {
      return $scope.openLoginDialog();
    },
    addUser: function(User) {
      var handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            return data;
          });
        } else {
          return data;
        }
      };
      return $http.post('users/new', User).then(handleResult);
    },
    removeUser: function(User) {
      var handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            return data;
          });
        } else {
          return data;
        }
      };
      return $http["delete"]("users", {
        id: User.id
      }).then(handleResult);
    },
    getSignedInUser: function() {
      var defer, promise, userName;
      userName = sessionStorage.getItem("userName");
      defer = $q.defer();
      if (userName) {
        return userName;
      } else {
        promise = SecurityRetryQueue.pushRetryFn('unauthorized-server', factoryObj.getSignedInUser);
        return promise;
      }
    },
    getUserName: function() {
      return sessionStorage.getItem("userName");
    },
    isLoggedIn: function() {
      return sessionStorage.getItem("userName") != null;
    },
    changePassword: function(userName, oldPassword, newPassword) {
      var handleResult, requestData;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            return data;
          });
        } else {
          return data;
        }
      };
      requestData = {
        userName: userName,
        oldPassword: oldPassword,
        newPassword: newPassword
      };
      return $http.put("changePassword", requestData).then(handleResult);
    }
  };
  return factoryObj;
};

module.exports = LoginService;



},{}],28:[function(require,module,exports){
var SecurityInterceptor;

SecurityInterceptor = function($injector, SecurityRetryQueue) {
  return function(promise) {
    return promise.then(function(originalResponse) {
      return originalResponse;
    }, function(originalResponse) {
      console.log("login error");
      console.log(originalResponse.status);
      if (originalResponse.status === 401) {
        promise = SecurityRetryQueue.pushRetryFn('unauthorized-server', function() {
          return $injector.get('$http')(originalResponse.config);
        });
      }
      return promise;
    });
  };
};

module.exports = SecurityInterceptor;



},{}],29:[function(require,module,exports){
var SecurityRetryQueue;

SecurityRetryQueue = function($q, $log) {
  var retryQueue, service;
  retryQueue = [];
  service = {
    onItemAddedCallbacks: [],
    hasMore: function() {
      return retryQueue.length > 0;
    },
    push: function(retryItem) {
      retryQueue.push(retryItem);
      return angular.forEach(service.onItemAddedCallbacks, function(cb) {
        var e;
        try {
          return cb(retryItem);
        } catch (_error) {
          e = _error;
          return $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
        }
      });
    },
    pushRetryFn: function(reason, retryFn) {
      var deferred, retryItem;
      if (arguments.length === 1) {
        retryFn = reason;
        reason = void 0;
      }
      deferred = $q.defer();
      retryItem = {
        reason: reason,
        retry: function() {
          return $q.when(retryFn()).then(function(value) {
            return deferred.resolve(value);
          }, function(value) {
            return deferred.reject(value);
          });
        },
        cancel: function() {
          return deferred.reject();
        }
      };
      service.push(retryItem);
      return deferred.promise;
    },
    retryReason: function() {
      return service.hasMore() && retryQueue[0].reason;
    },
    cancelAll: function() {
      var _results;
      _results = [];
      while (service.hasMore()) {
        _results.push(retryQueue.shift().cancel());
      }
      return _results;
    },
    retryAll: function() {
      var _results;
      _results = [];
      while (service.hasMore()) {
        _results.push(retryQueue.shift().retry());
      }
      return _results;
    }
  };
  return service;
};

module.exports = SecurityRetryQueue;



},{}],30:[function(require,module,exports){
var DataProviderService;

DataProviderService = function($http, $q) {
  var factoryObj;
  factoryObj = {
    loadPlaceInfo: function() {
      return $http.get('/info');
    },
    loadRouteInfo: function(zoom, maps) {
      var mapsStr, ret;
      mapsStr = maps.join();
      return ret = $http.get("route/eurovelo_6/" + zoom + "/" + mapsStr);
    },
    loadMapArea: function(id) {
      return $http.get('/map/0');
    },
    savePlaceInfo: function(data) {
      return $http.post('/info', data);
    },
    getUserInfo: function(userName) {
      var deferred;
      deferred = $q.defer();
      $http.get("/users/" + userName).then(function(resp) {
        if (resp.data.then != null) {
          return resp.data.then(function(resp2) {
            console.log("user");
            console.log(resp2);
            return deferred.resolve(resp2);
          });
        }
      });
      return deferred.promise;
    }
  };
  return factoryObj;
};

module.exports = DataProviderService;



},{}],31:[function(require,module,exports){
var LocalDataProviderService,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

LocalDataProviderService = function($http, $q, MapConstants) {
  var db, factoryObj, idbSupported, openConnection, shouldPopulateDb;
  idbSupported = false;
  if (__indexOf.call(window, "indexedDB") >= 0) {
    idbSupported = true;
  }
  db = void 0;
  openConnection = function() {
    var connRequest;
    connRequest = indexedDB.open(MapConstants.dbPrefix, MapConstants.indexedDbVersion);
    connRequest.onupgradeneeded = function(e) {
      var thisDB;
      console.log("upgradeneedeed");
      thisDB = e.target.result;
      if (!thisDB.objectStoreNames.contains("eurovelo_6")) {
        thisDB.createObjectStore("eurovelo_6", {
          autoIncrement: true
        });
      }
      if (!thisDB.objectStoreNames.contains("users")) {
        thisDB.createObjectStore("users", {
          autoIncrement: true
        });
      }
      if (!thisDB.objectStoreNames.contains("votes")) {
        return thisDB.createObjectStore("votes", {
          autoIncrement: true
        });
      }
    };
    connRequest.onerror = function(e) {
      console.log("Error");
      return console.dir(e);
    };
    return connRequest;
  };
  shouldPopulateDb = function() {
    var deferred, openRequest, queryDbIfThereAreAnyData;
    queryDbIfThereAreAnyData = function(def) {
      var cursor, route, store, transaction;
      transaction = db.transaction(["eurovelo_6"], "readonly");
      store = transaction.objectStore("eurovelo_6");
      cursor = store.openCursor();
      route = [];
      return cursor.onsuccess = function(e) {
        var res;
        res = e.target.result;
        if (res) {
          console.log("should'nt");
          return def.resolve(false);
        } else {
          console.log("should");
          return def.resolve(true);
        }
      };
    };
    deferred = $q.defer();
    if (db) {
      queryDbIfThereAreAnyData(deferred);
    } else {
      openRequest = openConnection();
      openRequest.onsuccess = function(e) {
        db = e.target.result;
        return queryDbIfThereAreAnyData(deferred);
      };
    }
    return deferred.promise;
  };
  factoryObj = {
    loadRouteInfo: function(zoom, maps) {
      var deferred, loadRouteInfoFromIndexedDb, shouldPopulatePromise, that;
      loadRouteInfoFromIndexedDb = function(def) {
        var cursor, route, store, transaction;
        transaction = db.transaction(["eurovelo_6"], "readonly");
        store = transaction.objectStore("eurovelo_6");
        cursor = store.openCursor();
        route = [];
        cursor.onsuccess = function(e) {
          var node, res;
          res = e.target.result;
          if (res) {
            node = res.value;
            node._id = res.key;
            route.push(node);
            return res["continue"]();
          }
        };
        return transaction.oncomplete = function(e) {
          return def.resolve(route);
        };
      };
      deferred = $q.defer();
      shouldPopulatePromise = shouldPopulateDb();
      that = this;
      shouldPopulatePromise.then(function(should) {
        var promise;
        if (should) {
          promise = that.clearAndPopulateDbForTesting();
          return promise.then(function() {
            return loadRouteInfoFromIndexedDb(deferred);
          });
        } else {
          return loadRouteInfoFromIndexedDb(deferred);
        }
      });
      return deferred.promise;
    },
    clearAndPopulateDbForTesting: function() {
      var clearAndpopulateDbFromArray, clearAndpopulateDbFromServer, deferred, openRequest;
      clearAndpopulateDbFromServer = function(def) {
        var dbPromise;
        dbPromise = $http.get("dummyDatabase");
        dbPromise.success(function(nodes) {
          var node, store, transaction, _i, _len;
          transaction = db.transaction(["eurovelo_6"], "readwrite");
          store = transaction.objectStore("eurovelo_6");
          store.clear();
          for (_i = 0, _len = nodes.length; _i < _len; _i++) {
            node = nodes[_i];
            store.add(node);
          }
          return def.resolve();
        });
        return dbPromise.error(function(data) {
          return console.log("failure");
        });
      };
      clearAndpopulateDbFromArray = function(def) {
        var node, store, transaction, _i, _len;
        transaction = db.transaction(["eurovelo_6"], "readwrite");
        store = transaction.objectStore("eurovelo_6");
        store.clear();
        for (_i = 0, _len = smallDatabaseForTesting.length; _i < _len; _i++) {
          node = smallDatabaseForTesting[_i];
          node.vote_pos = 0;
          node.vote_neg = 0;
          node.user = "gsanta";
          store.add(node);
        }
        return def.resolve();
      };
      deferred = $q.defer();
      if (db) {
        clearAndpopulateDbFromArray(deferred);
      } else {
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return clearAndpopulateDbFromArray(deferred);
        };
      }
      return deferred.promise;
    },
    updateNode: function(id, props) {
      var request, store, transaction;
      transaction = db.transaction(["eurovelo_6"], "readwrite");
      store = transaction.objectStore("eurovelo_6");
      request = store.put(props, id);
      request.onsuccess = function(e) {
        return console.log("success saving node");
      };
      return request.onerror = function(e) {
        return console.log("error saving node");
      };
    },
    addNode: function(node) {
      var request, store, transaction;
      transaction = db.transaction(["eurovelo_6"], "readwrite");
      store = transaction.objectStore("eurovelo_6");
      request = store.add(node);
      request.onsuccess = function(e) {
        return console.log("success adding node");
      };
      return request.onerror = function(e) {
        return console.log("error adding node");
      };
    },
    getUser: function(userName, password) {
      var deferred, loadUserInfoFromIndexedDb, openRequest;
      deferred = $q.defer();
      loadUserInfoFromIndexedDb = function(def) {
        var cursor, store, transaction, user;
        transaction = db.transaction(["users"], "readonly");
        store = transaction.objectStore("users");
        cursor = store.openCursor();
        user = void 0;
        cursor.onsuccess = function(e) {
          var actUser;
          actUser = e.target.result;
          if (actUser != null) {
            if ((actUser.value != null) && actUser.value.userName === userName) {
              user = actUser.value;
              user.id = actUser.key;
              return user.password = "";
            } else {
              return actUser["continue"]();
            }
          }
        };
        return transaction.oncomplete = function(e) {
          if (user) {
            return def.resolve(user);
          } else {
            return def.reject("login error");
          }
        };
      };
      if (db) {
        loadUserInfoFromIndexedDb(deferred);
      } else {
        console.log("openRequest");
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return loadUserInfoFromIndexedDb(deferred);
        };
      }
      return deferred.promise;
    },
    addUser: function(User) {
      var addUserToIndexedDb, deferred, openRequest;
      deferred = $q.defer();
      addUserToIndexedDb = function(def) {
        var request, store, transaction;
        transaction = db.transaction(["users"], "readwrite");
        store = transaction.objectStore("users");
        request = store.add(User);
        request.onsuccess = function(e) {
          return def.resolve(User);
        };
        return request.onerror = function(e) {
          return def.reject("problem with signing up");
        };
      };
      if (db) {
        addUserToIndexedDb(deferred);
      } else {
        console.log("openRequest");
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return addUserToIndexedDb(deferred);
        };
      }
      return deferred.promise;
    },
    updateUser: function(userName, updateObj) {
      var deferred, promise;
      deferred = $q.defer();
      promise = this.getUser(userName, void 0);
      promise.then(function(data) {
        var k, request, store, transaction, v;
        for (k in data) {
          v = data[k];
          if (updateObj[k] != null) {
            data[k] = updateObj[k];
          }
        }
        transaction = db.transaction(["users"], "readwrite");
        store = transaction.objectStore("users");
        request = store.put(data, data.id);
        return request.onsuccess = function(e) {
          return deferred.resolve(data);
        };
      });
      return deferred.promise;
    },
    removeUser: function(User) {
      var deferred, openRequest, removedUserFromIndexedDb;
      deferred = $q.defer();
      removedUserFromIndexedDb = function(def) {
        var request, store, transaction;
        console.log("removeUser");
        transaction = db.transaction(["users"], "readwrite");
        store = transaction.objectStore("users");
        request = store["delete"](User.id);
        request.onsuccess = function(e) {
          return def.resolve(User);
        };
        return request.onerror = function(e) {
          return def.reject("problem with deleting user");
        };
      };
      if (db) {
        removedUserFromIndexedDb(deferred);
      } else {
        console.log("openRequest");
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return removedUserFromIndexedDb(deferred);
        };
      }
      return deferred.promise;
    },
    getUserVoteForNode: function(userName, nodeId) {
      var deferred, loadUserVoteForNode, openRequest;
      deferred = $q.defer();
      loadUserVoteForNode = function(def) {
        var cursor, store, transaction, vote;
        nodeId = parseInt(nodeId);
        transaction = db.transaction(["votes"], "readonly");
        store = transaction.objectStore("votes");
        cursor = store.openCursor();
        vote = void 0;
        cursor.onsuccess = function(e) {
          var actVote;
          actVote = e.target.result;
          if (actVote != null) {
            if (actVote.value.user === userName && actVote.value.node === nodeId) {
              vote = actVote.value;
              return vote.id = actVote.key;
            } else {
              return actVote["continue"]();
            }
          }
        };
        return transaction.oncomplete = function(e) {
          return def.resolve(vote);
        };
      };
      if (db) {
        loadUserVoteForNode(deferred);
      } else {
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return loadUserVoteForNode(deferred);
        };
      }
      return deferred.promise;
    },
    setUserVoteForNode: function(userName, nodeId, vote) {
      var deferred, promise, setUserVoteForNodeToIndexDb;
      setUserVoteForNodeToIndexDb = function(def, data, isUpdate) {
        var request, store, transaction;
        transaction = db.transaction(["votes"], "readwrite");
        store = transaction.objectStore("votes");
        if (isUpdate) {
          request = store.put(data, data.id);
        } else {
          request = store.add(data);
        }
        request.onsuccess = function(e) {
          return def.resolve(data);
        };
        return request.onerror = function(e) {
          return def.reject("problem with deleting user");
        };
      };
      promise = factoryObj.getUserVoteForNode(userName, nodeId);
      deferred = $q.defer();
      promise.then(function(data) {
        if (data != null) {
          data.vote = vote;
          return setUserVoteForNodeToIndexDb(deferred, data, true);
        } else {
          data = {
            user: userName,
            node: nodeId,
            vote: vote
          };
          return setUserVoteForNodeToIndexDb(deferred, data, false);
        }
      });
      return deferred.promise;
    },
    getVotesForNode: function(nodeId) {
      var deferred, loadUserVoteForNode, openRequest;
      deferred = $q.defer();
      loadUserVoteForNode = function(def) {
        var cursor, store, transaction, votes;
        nodeId = parseInt(nodeId);
        transaction = db.transaction(["votes"], "readonly");
        store = transaction.objectStore("votes");
        cursor = store.openCursor();
        votes = {
          nodeId: nodeId,
          pos: 0,
          neg: 0
        };
        cursor.onsuccess = function(e) {
          var actVote;
          actVote = e.target.result;
          if (actVote != null) {
            if (actVote.value.node === nodeId) {
              if (actVote.value.vote === 0) {
                votes.neg += 1;
              } else if (actVote.value.vote === 2) {
                votes.pos += 1;
              }
            }
            return actVote["continue"]();
          }
        };
        return transaction.oncomplete = function(e) {
          return def.resolve(votes);
        };
      };
      if (db) {
        loadUserVoteForNode(deferred);
      } else {
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return loadUserVoteForNode(deferred);
        };
      }
      return deferred.promise;
    }
  };
  return factoryObj;
};

module.exports = LocalDataProviderService;



},{}],32:[function(require,module,exports){
var module;

module = angular.module("services");

module.factory('FormHelper', require('./security/FormHelper'));

module.factory('DataProviderService', require('./DataProviderService'));

module.factory('LocalDataProviderService', require('./LocalDataProviderService'));



},{"./DataProviderService":30,"./LocalDataProviderService":31,"./security/FormHelper":33}],33:[function(require,module,exports){
var FormHelper;

FormHelper = function($http, $q) {
  var factoryObj;
  factoryObj = {
    loadPlaceInfo: function() {
      return $http.get('/info');
    },
    loadRouteInfo: function(zoom, maps) {
      var mapsStr, ret;
      mapsStr = maps.join();
      return ret = $http.get("route/eurovelo_6/" + zoom + "/" + mapsStr);
    },
    loadMapArea: function(id) {
      return $http.get('/map/0');
    },
    savePlaceInfo: function(data) {
      return $http.post('/info', data);
    },
    getUserInfo: function(userName) {
      var deferred;
      deferred = $q.defer();
      $http.get("/users/" + userName).then(function(resp) {
        if (resp.data.then != null) {
          return resp.data.then(function(resp2) {
            console.log("user");
            console.log(resp2);
            return deferred.resolve(resp2);
          });
        }
      });
      return deferred.promise;
    }
  };
  return factoryObj;
};

module.exports = FormHelper;



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL2FwcC5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvZGFvL2luZGV4LmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9kYW8vc2VydmljZXMvQmljeWNsZVJvdXRlRGFvU2VydmljZS5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvZGFvL3NlcnZpY2VzL1ZvdGVEYW9TZXJ2aWNlLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9lZGl0b3IvY29udHJvbGxlcnMvTWFwRWRpdEN0cmwuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL2VkaXRvci9pbmRleC5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvZWRpdG9yL3NlcnZpY2VzL01hcEVkaXRvclNlcnZpY2UuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL21hcF9idWlsZGVyL2NvbnRyb2xsZXJzL01hcEN0cmwuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL21hcF9idWlsZGVyL2luZGV4LmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9tYXBfYnVpbGRlci9zZXJ2aWNlcy9CaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZS5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvbWFwX2J1aWxkZXIvc2VydmljZXMvSW5mb1dpbmRvd1NlcnZpY2UuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL21hcF9idWlsZGVyL3NlcnZpY2VzL01hcEJ1aWxkZXJTZXJ2aWNlLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9tYXBfY2FsY3VsYXRpb24vaW5kZXguY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL21hcF9jYWxjdWxhdGlvbi9zZXJ2aWNlcy9CaWN5Y2xlUm91dGVTZXJ2aWNlLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9tYXBfY2FsY3VsYXRpb24vc2VydmljZXMvTWFwUGFydGl0aW9uU2VydmljZS5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvbWlzYy9jbGFzc2VzL0Nvb3JkLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9taXNjL2NvbnRyb2xsZXJzL0FwcEN0cmwuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL21pc2MvZGlyZWN0aXZlcy9mbGFzaC5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvbWlzYy9kaXJlY3RpdmVzL21hdGNoLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9taXNjL2luZGV4LmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9taXNjL3NlcnZpY2VzL01hcENvbnN0YW50cy5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvcHJvZmlsZS9jb250cm9sbGVycy9Qcm9maWxlQ3RybC5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvcHJvZmlsZS9pbmRleC5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvc2VjdXJpdHkvY29udHJvbGxlcnMvTG9naW5DdHJsLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9zZWN1cml0eS9jb250cm9sbGVycy9SZWdpc3RyYXRpb25DdHJsLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9zZWN1cml0eS9pbmRleC5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvc2VjdXJpdHkvc2VydmljZXMvTG9naW5TZXJ2aWNlLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9zZWN1cml0eS9zZXJ2aWNlcy9TZWN1cml0eUludGVyY2VwdG9yLmNvZmZlZSIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L3NyYy9zZWN1cml0eS9zZXJ2aWNlcy9TZWN1cml0eVJldHJ5UXVldWUuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL3NlcnZpY2VzL0RhdGFQcm92aWRlclNlcnZpY2UuY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL3NlcnZpY2VzL0xvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5jb2ZmZWUiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9zcmMvc2VydmljZXMvaW5kZXguY29mZmVlIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvc3JjL3NlcnZpY2VzL3NlY3VyaXR5L0Zvcm1IZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSxrRUFBQTs7QUFBQSxjQUFBLEdBQWlCLE9BQU8sQ0FBQyxNQUFSLENBQWUsVUFBZixFQUEyQixFQUEzQixDQUFqQixDQUFBOztBQUFBLGFBQ0EsR0FB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QixPQUF0QyxFQUZPO0lBQUEsQ0FIZjtBQUFBLElBT0EsV0FBQSxFQUFhLFNBQUUsRUFBRixHQUFBO2FBQ1gsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLEVBRFc7SUFBQSxDQVBiO0FBQUEsSUFVQSxhQUFBLEVBQWUsU0FBRSxJQUFGLEdBQUE7YUFDYixLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsRUFBb0IsSUFBcEIsRUFEYTtJQUFBLENBVmY7QUFBQSxJQWFBLFdBQUEsRUFBYSxTQUFFLFFBQUYsR0FBQTtBQUNYLFVBQUEsUUFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLEVBQUUsQ0FBQyxLQUFILENBQUEsQ0FBWCxDQUFBO0FBQUEsTUFFQSxLQUFLLENBQUMsR0FBTixDQUFXLFNBQUEsR0FBUyxRQUFwQixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUUsSUFBRixHQUFBO0FBQ0osUUFBQSxJQUFHLHNCQUFIO2lCQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBVixDQUFlLFNBQUUsS0FBRixHQUFBO0FBQ2IsWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosQ0FBQSxDQUFBO0FBQUEsWUFDQSxPQUFPLENBQUMsR0FBUixDQUFhLEtBQWIsQ0FEQSxDQUFBO21CQUVBLFFBQVEsQ0FBQyxPQUFULENBQWtCLEtBQWxCLEVBSGE7VUFBQSxDQUFmLEVBREY7U0FESTtNQUFBLENBRE4sQ0FGQSxDQUFBO2FBVUEsUUFBUSxDQUFDLFFBWEU7SUFBQSxDQWJiO0dBRkYsQ0FBQTtTQThCQSxXQWhDVztBQUFBLENBQWIsQ0FBQTs7QUFBQSxNQWtDTSxDQUFDLE9BQVAsR0FBaUIsVUFsQ2pCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwic2VydmljZXNcIiwgW11cbmNsYXNzZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSBcImNsYXNzZXNcIiwgW11cbmRpcmVjdGl2ZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSBcImRpcmVjdGl2ZXNcIiwgW11cbmNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJjb250cm9sbGVyc1wiLCBbIFwic2VydmljZXNcIiwgXCJkaXJlY3RpdmVzXCIgXVxuXG5yZXF1aXJlKCcuL3NlcnZpY2VzJylcbnJlcXVpcmUoJy4vZGFvJylcbnJlcXVpcmUoJy4vZWRpdG9yJylcbnJlcXVpcmUoJy4vbWFwX2J1aWxkZXInKVxucmVxdWlyZSgnLi9tYXBfY2FsY3VsYXRpb24nKVxucmVxdWlyZSgnLi9taXNjJylcbnJlcXVpcmUoJy4vcHJvZmlsZScpXG5yZXF1aXJlKCcuL3NlY3VyaXR5JykgXG5cblxuc2VydmljZXNNb2R1bGUuY29uZmlnICggJGh0dHBQcm92aWRlciApIC0+XG4gICRodHRwUHJvdmlkZXIucmVzcG9uc2VJbnRlcmNlcHRvcnMucHVzaCAnU2VjdXJpdHlJbnRlcmNlcHRvcidcblxuYW5ndWxhci5tb2R1bGUgJ3N0YXJ0ZXInLCBbICdpb25pYycsICdjb250cm9sbGVycycsICdzZXJ2aWNlcycsICdjbGFzc2VzJywgJ2RpcmVjdGl2ZXMnLCAndWkuZ3JhdmF0YXInIF1cbi5ydW4gKCAkaW9uaWNQbGF0Zm9ybSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBMb2dpblNlcnZpY2UgKSAtPlxuXG4gICRpb25pY1BsYXRmb3JtLnJlYWR5IC0+XG5cbiAgICBpZiB3aW5kb3cuY29yZG92YT8gYW5kIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQ/XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyIHRydWVcblxuICAgIGlmIHdpbmRvdy5TdGF0dXNCYXI/XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0XG5cbi5jb25maWcgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIgKSAtPlxuXG4gICMgJHN0YXRlUHJvdmlkZXJcbiAgIyAuc3RhdGUgJ3RhYicsIHtcbiAgIyAgIHVybDogXCIvdGFiXCIsXG4gICMgICBhYnN0cmFjdDogdHJ1ZSxcbiAgIyAgIHRlbXBsYXRlVXJsOiBcInRlbXBsYXRlcy90YWJzLmh0bWxcIlxuICAjIH1cblxuICAjIC5zdGF0ZSAndGFiLm1hcCcsIHtcbiAgIyAgIHVybDogJy9tYXAnLFxuICAjICAgdmlld3M6IHtcbiAgIyAgICAgJ3RhYi1tYXAnOiB7XG4gICMgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWFwLmh0bWwnLFxuICAjICAgICAgIGNvbnRyb2xsZXI6ICdNYXBDdHJsJ1xuICAjICAgICB9XG4gICMgICB9XG4gICMgfVxuXG4gICMgLnN0YXRlICd0YWIubWFwRWRpdCcsIHtcbiAgIyAgIHVybDogJy9tYXBFZGl0JyxcbiAgIyAgIHZpZXdzOiB7XG4gICMgICAgICd0YWItbWFwLWVkaXQnOiB7XG4gICMgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWFwRWRpdC5odG1sJyxcbiAgIyAgICAgICBjb250cm9sbGVyOiAnTWFwRWRpdEN0cmwnXG4gICMgICAgIH1cbiAgIyAgIH0sXG4gICMgICByZXNvbHZlOiB7XG4gICMgICAgIGF1dGg6ICggJHEsICRpbmplY3RvciwgTG9naW5TZXJ2aWNlICkgLT5cbiAgIyAgICAgICByZXR1cm4gTG9naW5TZXJ2aWNlLmdldFNpZ25lZEluVXNlcigpXG4gICMgICB9XG4gICMgfVxuXG4gICMgLnN0YXRlICdlZGl0Jywge1xuICAjICAgdXJsOiAnL2VkaXQnLFxuICAjICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWFwRWRpdC5odG1sJyxcbiAgIyAgIGNvbnRyb2xsZXI6ICdNYXBFZGl0Q3RybCdcbiAgIyAgIHJlc29sdmU6IHtcbiAgIyAgICAgYXV0aDogKCAkcSwgJGluamVjdG9yLCBMb2dpblNlcnZpY2UgKSAtPlxuICAjICAgICAgIHJldHVybiBMb2dpblNlcnZpY2UuZ2V0U2lnbmVkSW5Vc2VyKClcbiAgIyAgIH1cbiAgIyB9XG5cbiAgIyAuc3RhdGUgJ3RhYi5wcm9maWxlJywge1xuICAjICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAjICAgdmlld3M6IHtcbiAgIyAgICAgJ3RhYi1wcm9maWxlJzoge1xuICAjICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Byb2ZpbGUuaHRtbCcsXG4gICMgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsJ1xuICAjICAgICB9XG4gICMgICB9XG4gICMgfVxuXG4gICMgLnN0YXRlICdsb2dpbicsIHtcbiAgIyAgIHVybDogJy9sb2dpbicsXG4gICMgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgIyAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICMgfSBcblxuICAjICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UgJy90YWIvbWFwRWRpdCdcbiAgICAkc3RhdGVQcm92aWRlclxuXG4gICAgLnN0YXRlKCdtYXAnLCB7XG4gICAgICB1cmw6IFwiL21hcFwiLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWFwRWRpdC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNYXBFZGl0Q3RybCdcbiAgICB9KVxuXG4gICAgLnN0YXRlKCdwcm9maWxlJywge1xuICAgICAgdXJsOiBcIi9wcm9maWxlXCIsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgYXV0aDogKCAkcSwgJGluamVjdG9yLCBMb2dpblNlcnZpY2UgKSAtPlxuICAgICAgICAgIHJldHVybiBMb2dpblNlcnZpY2UuZ2V0U2lnbmVkSW5Vc2VyKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLnN0YXRlKCdsb2dpblRlbXAnLCB7IFxuICAgICAgdXJsOiBcIi9sb2dpblRlbXBcIixcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvZ2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG4gICAgfSlcblxuICAgICMgLnN0YXRlKCdhcHAuYnJvd3NlJywge1xuICAgICMgICB1cmw6IFwiL2Jyb3dzZVwiLFxuICAgICMgICB2aWV3czoge1xuICAgICMgICAgICdtZW51Q29udGVudCcgOntcbiAgICAjICAgICAgIHRlbXBsYXRlVXJsOiBcInRlbXBsYXRlcy9icm93c2UuaHRtbFwiXG4gICAgIyAgICAgfVxuICAgICMgICB9XG4gICAgIyB9KVxuICAgICMgLnN0YXRlKCdhcHAucGxheWxpc3RzJywge1xuICAgICMgICB1cmw6IFwiL3BsYXlsaXN0c1wiLFxuICAgICMgICB2aWV3czoge1xuICAgICMgICAgICdtZW51Q29udGVudCcgOntcbiAgICAjICAgICAgIHRlbXBsYXRlVXJsOiBcInRlbXBsYXRlcy9wbGF5bGlzdHMuaHRtbFwiLFxuICAgICMgICAgICAgY29udHJvbGxlcjogJ1BsYXlsaXN0c0N0cmwnXG4gICAgIyAgICAgfVxuICAgICMgICB9XG4gICAgIyB9KVxuXG4gICAgIyAuc3RhdGUoJ2FwcC5zaW5nbGUnLCB7XG4gICAgIyAgIHVybDogXCIvcGxheWxpc3RzLzpwbGF5bGlzdElkXCIsXG4gICAgIyAgIHZpZXdzOiB7XG4gICAgIyAgICAgJ21lbnVDb250ZW50JyA6e1xuICAgICMgICAgICAgdGVtcGxhdGVVcmw6IFwidGVtcGxhdGVzL3BsYXlsaXN0Lmh0bWxcIixcbiAgICAjICAgICAgIGNvbnRyb2xsZXI6ICdQbGF5bGlzdEN0cmwnXG4gICAgIyAgICAgfVxuICAgICMgICB9XG4gICAgIyB9KTtcbiAgXG4gICAgIyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9tYXAnKTsiLCJtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSBcInNlcnZpY2VzXCJcblxubW9kdWxlLmZhY3RvcnkoJ0JpY3ljbGVSb3V0ZURhb1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZURhb1NlcnZpY2UnKSk7XG5tb2R1bGUuZmFjdG9yeSgnVm90ZURhb1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL1ZvdGVEYW9TZXJ2aWNlJykpO1xuIiwiQmljeWNsZVJvdXRlRGFvU2VydmljZSA9ICggKSAtPlxuXG5cdGZhY3RvcnlPYmogPVxuXHRcdCN0b2RvIHB1dCBtYXJrZXIuX2lkIGludG8gbWFya2VyLm5vZGVJbmZvLl9pZFxuICAgIHNhdmVQb2ludHM6ICggbm9kZXMgKSAtPlxuXG4gICAgICBmb3Igbm9kZSBpbiBub2Rlc1xuICAgICAgICBMb2NhbERhdGFQcm92aWRlclNlcnZpY2UudXBkYXRlTm9kZSBub2RlLl9pZCwge1xuICAgICAgICAgIGxhdDogbm9kZS5sYXQsXG4gICAgICAgICAgbG9uOiBub2RlLmxvblxuICAgICAgICB9XG5cbiAgICBhZGRQb2ludHM6ICggbm9kZXMgKSAtPlxuICAgICAgZm9yIG5vZGUgaW4gbm9kZXNcbiAgICAgICAgTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmFkZE5vZGUge1xuICAgICAgICAgIHVzZXI6IG5vZGUudXNlcixcbiAgICAgICAgICBsYXQ6IG5vZGUubGF0LFxuICAgICAgICAgIGxvbjogbm9kZS5sb25cbiAgICAgICAgfVxuXG5cdHJldHVybiBmYWN0b3J5T2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQmljeWNsZVJvdXRlRGFvU2VydmljZSIsIlZvdGVEYW9TZXJ2aWNlID0gKCApIC0+XG5cblx0ZmFjdG9yeU9iaiA9XG5cdFx0Z2V0VXNlclZvdGVUb1BvaW50OiAoIHVzZXJOYW1lLCBub2RlSWQgKSAtPlxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAgIGh0dHBQcm9taXNlID0gJGh0dHAuZ2V0IFwiL3ZvdGUvI3t1c2VyTmFtZX0vI3tub2RlSWR9XCJcblxuICAgICAgaHR0cFByb21pc2UudGhlbiAoIHJlc3AgKSAtPlxuICAgICAgICBpZiByZXNwLmRhdGEudGhlbj8gXG4gICAgICAgICAgcmVzcC5kYXRhLnRoZW4gKCBkYXRhICkgLT5cbiAgICAgICAgICAgIGlmIGRhdGEgPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgIGRhdGEgPSBcbiAgICAgICAgICAgICAgICB1c2VyOiB1c2VyTmFtZVxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVJZFxuICAgICAgICAgICAgICAgIHZvdGU6IDFcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKVxuXG4gICAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICBnZXRBbGxWb3Rlc1RvTm9kZTogKCBub2RlSWQgKSAtPlxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAgIGh0dHBQcm9taXNlID0gJGh0dHAuZ2V0IFwiL3ZvdGUvI3tub2RlSWR9XCJcblxuICAgICAgaHR0cFByb21pc2UudGhlbiAoIHJlc3AgKSAtPlxuICAgICAgICBpZiByZXNwLmRhdGEudGhlbj8gXG4gICAgICAgICAgcmVzcC5kYXRhLnRoZW4gKCBkYXRhICkgLT5cbiAgICAgICAgICAgIGlmIGRhdGEgPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgIGRhdGEgPSBcbiAgICAgICAgICAgICAgICBub2RlSWQ6IG5vZGVJZFxuICAgICAgICAgICAgICAgIHBvczogMFxuICAgICAgICAgICAgICAgIG5lZzogMFxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApXG5cbiAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgIHNlbmRVc2VyVm90ZUZvck5vZGU6ICggdXNlck5hbWUsIG5vZGVJZCwgdm90ZSApIC0+XG4gICAgICAkaHR0cC5wb3N0IFwiL3ZvdGUvbmV3XCIsIHtcbiAgICAgICAgdXNlcjogdXNlck5hbWUsXG4gICAgICAgIG5vZGVJZDogbm9kZUlkLFxuICAgICAgICB2b3RlOiB2b3RlXG4gICAgICB9XG5cblx0cmV0dXJuIGZhY3RvcnlPYmpcblxubW9kdWxlLmV4cG9ydHMgPSBWb3RlRGFvU2VydmljZSIsIk1hcEVkaXRDdHJsID0gKCAkc2NvcGUsICRodHRwLCAkdGltZW91dCwgTWFwRWRpdG9yU2VydmljZSwgQmljeWNsZVJvdXRlU2VydmljZSwgQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UsIERhdGFQcm92aWRlclNlcnZpY2UsXG4gIEJpY3ljbGVSb3V0ZURhb1NlcnZpY2UsIE1hcEJ1aWxkZXJTZXJ2aWNlLCBWb3RlRGFvU2VydmljZSwgTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLCBDb29yZCwgTG9naW5TZXJ2aWNlLCBNYXBDb25zdGFudHMgKSAtPlxuXG4gIHJvdXRlUG9seWxpbmUgPSB1bmRlZmluZWRcbiAgY2FuTG9hZE1hcEFnYWluID0gdHJ1ZVxuXG4gIG5ld05vZGVDb3VudGVyID0gLTFcblxuICBlZGl0ZWRNYXJrZXJzID0gW11cbiAgbWFya2VycyA9IFtdXG4gIHBvbHlsaW5lcyA9IFtdXG5cbiAgY2xlYXJBcnJheSA9ICggYXJyYXkgKSAtPlxuICAgIGZvciBvYmogaW4gYXJyYXlcbiAgICAgIG9iai5zZXRNYXAgbnVsbFxuICAgICNvYmouc2V0TWFwKCBudWxsICkgZm9yIG9iaiBpbiBhcnJheVxuXG4gIGNvcHlFZGl0ZWRNYXJrZXJzID0gKCBmcm9tQXJyYXksIHRvQXNzb2NBcnJheSApIC0+XG4gICAgZm9yIG9iaiBpbiBmcm9tQXJyYXlcbiAgICAgIGlmIG9iai5ub2RlSW5mby5jaGFuZ2VkXG4gICAgICAgIHRvQXNzb2NBcnJheVsgb2JqLm5vZGVJbmZvLl9pZCBdID0gb2JqXG5cbiAgJHNjb3BlLnJvdXRlSW5mbyA9IHVuZGVmaW5lZFxuICAkc2NvcGUubWFwID0gdW5kZWZpbmVkXG5cbiAgJHNjb3BlLmlzVGhlcmVFZGl0ZWROb2RlID0gZmFsc2VcblxuICAkc2NvcGUuaW5mb1dpbmRvdyA9IHtcbiAgICBpc0Rpc3BsYXllZDogZmFsc2VcbiAgfVxuXG4gICRzY29wZS5sb2FkUm91dGUgPSAoKSAtPlxuICAgIGJvdW5kcyA9ICRzY29wZS5tYXAuZ2V0Qm91bmRzKClcbiAgICBuZSA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKVxuICAgIHN3ID0gYm91bmRzLmdldFNvdXRoV2VzdCgpXG4gICAgbWFwWm9vbSA9IE1hcEVkaXRvclNlcnZpY2UuY2FsY3VsYXRlWm9vbSggXG4gICAgICBuZXcgQ29vcmQoIHN3LmxuZygpLCBuZS5sYXQoKSApLFxuICAgICAgbmV3IENvb3JkKCBuZS5sbmcoKSwgc3cubGF0KCkgKVxuICAgIClcblxuICAgIG1hcElkcyA9ICBNYXBFZGl0b3JTZXJ2aWNlLmdldE1hcHNGb3JBcmVhQXRab29tKFxuICAgICAgbmV3IENvb3JkKCBzdy5sbmcoKSwgbmUubGF0KCkgKSxcbiAgICAgIG5ldyBDb29yZCggbmUubG5nKCksIHN3LmxhdCgpICksIG1hcFpvb20gLSAxXG4gICAgKVxuXG4gICAgcm91dGVJbmZvUHJvbWlzZSA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5sb2FkUm91dGVJbmZvKCkjTWFwU2VydmljZS5mZXRjaFJvdXRlTm9kZXMgbWFwWm9vbSwgbWFwSWRzXG5cblxuICAgIHJvdXRlSW5mb1Byb21pc2UudGhlbiAoIGRhdGEgKSAtPlxuICAgICAgcm91dGUgPSBCaWN5Y2xlUm91dGVTZXJ2aWNlLmNyZWF0ZVJvdXRlRnJvbU5vZGVzIGRhdGEsIDEsIFsgMCBdI21hcFpvb20sIG1hcElkc1xuXG4gICAgICByb3V0ZVBvbHlsaW5lLnNldE1hcCBudWxsXG4gICAgICByb3V0ZVBvbHlsaW5lID0gQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UuY3JlYXRlUG9seWxpbmVGcm9tUm91dGUgcm91dGVcbiAgICAgIHJvdXRlUG9seWxpbmUuc2V0TWFwKCAkc2NvcGUubWFwICk7XG5cbiAgICAgICMgY2FsbGJhY2sgPSAoKSAtPlxuICAgICAgIyAgIHJvdXRlUG9seWxpbmUuc2V0TWFwIG51bGxcbiAgICAgICMgICByb3V0ZVBvbHlsaW5lLnNldE1hcCggJHNjb3BlLm1hcCApO1xuICAgICAgIyAgIGNvbnNvbGUubG9nIFwibW9zdCBzZXRNYXBcIlxuICAgICAgIyAkdGltZW91dCBjYWxsYmFjaywgNjAwMFxuXG4gICRzY29wZS5sb2FkUm91dGVJbmZvID0gKCApIC0+XG4gICAgIyByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKVxuXG4gICAgIyByb3V0ZUluZm9Qcm9taXNlLnRoZW4gKCBkYXRhICkgLT5cbiAgICAjICAgJHNjb3BlLnJvdXRlSW5mbyA9IGRhdGFcbiAgICAjICAgd2luZG93LnJvdXRlSW5mbyA9IGRhdGFcblxuICAgICMgICBjb3B5RWRpdGVkTWFya2VycyBtYXJrZXJzLCBlZGl0ZWRNYXJrZXJzXG4gICAgIyAgIGNsZWFyQXJyYXkgbWFya2Vyc1xuICAgICMgICBtYXJrZXJzID0gW11cbiAgICAjICAgY2xlYXJBcnJheSBwb2x5bGluZXNcbiAgICAjICAgcG9seWxpbmVzID0gW11cblxuICAgICMgICBpZiAkc2NvcGUuaXNFZGl0ICYmIE1hcENvbnN0YW50cy5tYXhab29tID09ICRzY29wZS5tYXAuem9vbSAmJiBMb2dpblNlcnZpY2UuaXNMb2dnZWRJbigpXG4gICAgIyAgICAgbWFya2VycyA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZU1hcmtlcnNGcm9tUm91dGUgZGF0YSwgJHNjb3BlLm1hcCwgJHNjb3BlXG4gICAgIyAgIGVsc2VcbiAgICAjICAgICBwb2x5bGluZXMucHVzaCBCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZS5jcmVhdGVQb2x5bGluZUZyb21Sb3V0ZSBkYXRhLCAkc2NvcGUubWFwXG5cbiAgJHNjb3BlLmlzRWRpdCA9IHRydWVcblxuICAkc2NvcGUuaW5pdE1hcCA9IC0+XG4gICAgd2luZG93LnJvdXRlSW5mbyA9ICRzY29wZS5yb3V0ZUluZm9cbiAgICByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKSNNYXBTZXJ2aWNlLmZldGNoUm91dGVOb2RlcyggMSwgWyAwIF0gKVxuXG4gICAgcm91dGVJbmZvUHJvbWlzZS50aGVuICggZGF0YSApIC0+XG4gICAgICAkc2NvcGUucm91dGVJbmZvID0gZGF0YVxuICAgICAgQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UuY3JlYXRlQ29vcmRpbmF0ZSBkYXRhWzBdLmxhdCwgZGF0YVswXS5sb25cbiAgICAgIGNlbnRlckNvb3JkaW5hdGVzID0gQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UuY3JlYXRlQ29vcmRpbmF0ZSBkYXRhWzBdLmxhdCwgZGF0YVswXS5sb25cblxuICAgICAgJHNjb3BlLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAgZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJyNjb250YWluZXItbWFwLWVkaXQnICkucXVlcnlTZWxlY3RvciggJyNnb29nbGVNYXAnICksIE1hcEJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZU1hcFByb3BlcnRpZXMoIGNlbnRlckNvb3JkaW5hdGVzLCAxMyApXG5cbiAgICAgIHBvbHlsaW5lcy5wdXNoIEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlIGRhdGEsICRzY29wZS5tYXBcblxuICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIgJHNjb3BlLm1hcCwnem9vbV9jaGFuZ2VkJywgKCkgLT5cbiAgICAgICAgJHNjb3BlLmxvYWRSb3V0ZUluZm8oKVxuXG4gICAgY29uc29sZS5sb2coXCJva2VcIilcbiAgXG4gICRzY29wZS5zYXZlUG9pbnRzID0gLT5cbiAgICB1cGRhdGVOb2RlcyA9IFtdXG4gICAgYWRkTm9kZXMgPSBbXVxuICAgIGNvcHlFZGl0ZWRNYXJrZXJzIG1hcmtlcnMsIGVkaXRlZE1hcmtlcnNcbiAgICBmb3Igayx2IG9mIGVkaXRlZE1hcmtlcnNcbiAgICAgIGlmIHYubm9kZUluZm8uX2lkIDwgMFxuICAgICAgICBhZGROb2Rlcy5wdXNoIHYubm9kZUluZm9cbiAgICAgIGVsc2VcbiAgICAgICAgdXBkYXRlTm9kZXMucHVzaCB2Lm5vZGVJbmZvXG5cbiAgICBCaWN5Y2xlUm91dGVEYW9TZXJ2aWNlLnNhdmVQb2ludHMgdXBkYXRlTm9kZXNcbiAgICBCaWN5Y2xlUm91dGVEYW9TZXJ2aWNlLmFkZFBvaW50cyBhZGROb2Rlc1xuXG4gICAgJHNjb3BlLmlzVGhlcmVFZGl0ZWROb2RlID0gZmFsc2VcblxuICAkc2NvcGUuYWRkUG9pbnQgPSAtPlxuICAgIG1hcmtlciA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmFkZE5ld1BvaW50VG9DZW50ZXJPZk1hcCAkc2NvcGUubWFwLCAkc2NvcGVcbiAgICBtYXJrZXIubm9kZUluZm8uX2lkID0gbmV3Tm9kZUNvdW50ZXJcbiAgICAkc2NvcGUuaXNUaGVyZUVkaXRlZE5vZGUgPSB0cnVlXG4gICAgbmV3Tm9kZUNvdW50ZXItLVxuICAgIGVkaXRlZE1hcmtlcnMucHVzaCBtYXJrZXJcbiAgICBtYXJrZXJzLnB1c2ggbWFya2VyIFxuXG4gICRzY29wZS5pbmZvQm94ZXMgPSBbXVxuXG4gICRzY29wZS52b3RlID0ge1xuICAgIHZhbHVlOiAxXG4gICAgaXNSZXNldDogdHJ1ZVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaCggJ3ZvdGUuaXNSZXNldCcsICggbmV3VmFsdWUsIG9sZFZhbHVlICkgLT5cbiAgICBjb25zb2xlLmxvZyBcInJlc2V0IHdhdGNoOiAje25ld1ZhbHVlfVwiXG4gIClcblxuICAkc2NvcGUuJHdhdGNoKCAndm90ZS52YWx1ZScsICggbmV3VmFsdWUsIG9sZFZhbHVlICkgLT5cbiAgICBjb25zb2xlLmxvZyBcInJlc2V0OiAjeyRzY29wZS52b3RlLmlzUmVzZXR9XCJcbiAgICBuZXdWYWx1ZSA9IHBhcnNlSW50IG5ld1ZhbHVlXG4gICAgb2xkVmFsdWUgPSBwYXJzZUludCBvbGRWYWx1ZVxuICAgIGlmKCAhJHNjb3BlLnZvdGUuaXNSZXNldCAmJiBuZXdWYWx1ZSAhPSBvbGRWYWx1ZSApXG4gICAgICBjb25zb2xlLmxvZyBcInNlbmQ6ICN7b2xkVmFsdWV9LCN7bmV3VmFsdWV9LCAjeyRzY29wZS52b3RlLmlzUmVzZXR9XCJcbiAgICAgIHVzZXIgPSBMb2dpblNlcnZpY2UuZ2V0VXNlck5hbWUoKVxuICAgICAgbm9kZUlkID0gJHNjb3BlLmFjdE5vZGUuX2lkICN0b2RvIG5vZGVJbmZvLl9pZD8/P1xuICAgICAgVm90ZURhb1NlcnZpY2Uuc2VuZFVzZXJWb3RlRm9yTm9kZSB1c2VyLCBub2RlSWQsIG5ld1ZhbHVlXG4gICAgJHNjb3BlLnZvdGUuaXNSZXNldCA9IGZhbHNlXG4gIClcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBFZGl0Q3RybCIsInNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJzZXJ2aWNlc1wiXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwiY29udHJvbGxlcnNcIlxuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdNYXBFZGl0b3JTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9NYXBFZGl0b3JTZXJ2aWNlJykpO1xuXG5jb250cm9sbGVyc01vZHVsZS5jb250cm9sbGVyKCdNYXBFZGl0Q3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvTWFwRWRpdEN0cmwnKSk7IiwiTWFwRWRpdG9yU2VydmljZSA9ICggICkgLT5cblxuICBmYWN0b3J5T2JqID1cbiAgICBjcmVhdGVBc3NvY0FycmF5RnJvbUNoYW5nZWRNYXJrZXJzOiAoIG1hcmtlcnMgKSAtPlxuICAgICAgYXNzb2MgPSBbXVxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIGlmIG1hcmtlci5ub2RlSW5mby5jaGFuZ2VkXG4gICAgICAgICAgYXNzb2NbIG1hcmtlci5ub2RlSW5mby5faWQgXSA9IG1hcmtlclxuXG4gIGZhY3RvcnlPYmpcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBFZGl0b3JTZXJ2aWNlIiwiTWFwQ3RybCA9ICggJHNjb3BlLCAkaHR0cCwgJHRpbWVvdXQsIE1hcFNlcnZpY2UsIERhdGFQcm92aWRlclNlcnZpY2UsXG4gIExvY2FsRGF0YVByb3ZpZGVyU2VydmljZSwgQ29vcmQgKSAtPlxuXG4gIHJvdXRlUG9seWxpbmUgPSB1bmRlZmluZWRcbiAgY2FuTG9hZE1hcEFnYWluID0gdHJ1ZVxuXG4gICRzY29wZS5yb3V0ZUluZm8gPSB1bmRlZmluZWRcbiAgJHNjb3BlLm1hcCA9IHVuZGVmaW5lZFxuXG4gICRzY29wZS5sb2FkUm91dGUgPSAoKSAtPlxuXG4gICAgYm91bmRzID0gJHNjb3BlLm1hcC5nZXRCb3VuZHMoKVxuICAgIG5lID0gYm91bmRzLmdldE5vcnRoRWFzdCgpXG4gICAgc3cgPSBib3VuZHMuZ2V0U291dGhXZXN0KClcbiAgICBtYXBab29tID0gTWFwU2VydmljZS5jYWxjdWxhdGVab29tKCBcbiAgICAgIG5ldyBDb29yZCggc3cubG5nKCksIG5lLmxhdCgpICksXG4gICAgICBuZXcgQ29vcmQoIG5lLmxuZygpLCBzdy5sYXQoKSApXG4gICAgKVxuXG4gICAgbWFwSWRzID0gIE1hcFNlcnZpY2UuZ2V0TWFwc0ZvckFyZWFBdFpvb20oXG4gICAgICBuZXcgQ29vcmQoIHN3LmxuZygpLCBuZS5sYXQoKSApLFxuICAgICAgbmV3IENvb3JkKCBuZS5sbmcoKSwgc3cubGF0KCkgKSwgbWFwWm9vbSAtIDFcbiAgICApXG5cbiAgICByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKSNNYXBTZXJ2aWNlLmZldGNoUm91dGVOb2RlcyBtYXBab29tLCBtYXBJZHNcblxuXG4gICAgcm91dGVJbmZvUHJvbWlzZS50aGVuICggZGF0YSApIC0+XG4gICAgICByb3V0ZSA9IE1hcFNlcnZpY2UuY3JlYXRlUm91dGVGcm9tTm9kZUFycmF5IGRhdGEsIDEsIFsgMCBdI21hcFpvb20sIG1hcElkc1xuXG4gICAgICByb3V0ZVBvbHlsaW5lLnNldE1hcCBudWxsXG4gICAgICByb3V0ZVBvbHlsaW5lID0gTWFwU2VydmljZS5jcmVhdGVQb2x5bGluZUZyb21Sb3V0ZSByb3V0ZVxuICAgICAgcm91dGVQb2x5bGluZS5zZXRNYXAoICRzY29wZS5tYXAgKTtcblxuICAgICAgIyBjYWxsYmFjayA9ICgpIC0+XG4gICAgICAjICAgcm91dGVQb2x5bGluZS5zZXRNYXAgbnVsbFxuICAgICAgIyAgIHJvdXRlUG9seWxpbmUuc2V0TWFwKCAkc2NvcGUubWFwICk7XG4gICAgICAjICAgY29uc29sZS5sb2cgXCJtb3N0IHNldE1hcFwiXG4gICAgICAjICR0aW1lb3V0IGNhbGxiYWNrLCA2MDAwXG5cblxuICAkc2NvcGUuaW5pdE1hcCA9IC0+XG4gICAgIyBEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRNYXBBcmVhKCAwICkuc3VjY2VzcyAoIGRhdGEgKSAtPlxuICAgICMgICBjb25zb2xlLmxvZyBcImxvYWRNYXBBcmVhXCJcbiAgICAjICAgY29uc29sZS5sb2cgZGF0YVxuXG4gICAgcm91dGVJbmZvUHJvbWlzZSA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5sb2FkUm91dGVJbmZvKCkjTWFwU2VydmljZS5mZXRjaFJvdXRlTm9kZXMoIDEsIFsgMCBdIClcblxuICAgIHJvdXRlSW5mb1Byb21pc2UudGhlbiAoIGRhdGEgKSAtPlxuICAgICAgJHNjb3BlLnJvdXRlSW5mbyA9IGRhdGFcblxuICAgICAgY2VudGVyQ29vcmRpbmF0ZXMgPSBNYXBTZXJ2aWNlLmNyZWF0ZUNvb3JkaW5hdGUgZGF0YVswXS5sYXQsIGRhdGFbMF0ubG9uXG5cbiAgICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcjdmlldy1tYXAnICkucXVlcnlTZWxlY3RvciggJyNnb29nbGVNYXAnICksIE1hcFNlcnZpY2UuY3JlYXRlTWFwUHJvcGVydGllcyggY2VudGVyQ29vcmRpbmF0ZXMsIDMgKVxuXG4gICAgICAkc2NvcGUubWFwLmdldEJvdW5kcygpXG5cbiAgICAgIHJvdXRlID0gTWFwU2VydmljZS5jcmVhdGVSb3V0ZUZyb21Ob2RlQXJyYXkgZGF0YSwgMSwgWyAwIF1cblxuICAgICAgcm91dGVQb2x5bGluZSA9IE1hcFNlcnZpY2UuY3JlYXRlUG9seWxpbmVGcm9tUm91dGUgcm91dGVcblxuICAgICAgcm91dGVQb2x5bGluZS5zZXRNYXAoICRzY29wZS5tYXAgKVxuXG5cbiAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyICRzY29wZS5tYXAsJ3pvb21fY2hhbmdlZCcsICgpIC0+XG4gICAgICAgIDFcbiAgICAgICAgIyBpZiBjYW5Mb2FkTWFwQWdhaW5cbiAgICAgICAgIyAgICRzY29wZS5sb2FkUm91dGUoKVxuICAgICAgICAjICAgY2FsbGJhY2sgPSAoKSAtPlxuICAgICAgICAjICAgICBjYW5Mb2FkTWFwQWdhaW4gPSB0cnVlXG4gICAgICAgICMgICAkdGltZW91dCBjYWxsYmFjaywgMjAwMDBcbiAgICAgICAgIyBjYW5Mb2FkTWFwQWdhaW4gPSBmYWxzZSBcblxuXG4gICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lciAkc2NvcGUubWFwLCBcImJvdW5kc19jaGFuZ2VkXCIsICgpIC0+XG4gICAgICAgIGlmIGNhbkxvYWRNYXBBZ2FpblxuICAgICAgICAgICRzY29wZS5sb2FkUm91dGUoKVxuICAgICAgICAgIGNhbGxiYWNrID0gKCkgLT5cbiAgICAgICAgICAgIGNhbkxvYWRNYXBBZ2FpbiA9IHRydWVcbiAgICAgICAgICAkdGltZW91dCBjYWxsYmFjaywgNTAwMFxuICAgICAgICBjYW5Mb2FkTWFwQWdhaW4gPSBmYWxzZVxuXG4gICRzY29wZS5pbmZvQm94ZXMgPSBbXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RybCIsInNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJzZXJ2aWNlc1wiXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwiY29udHJvbGxlcnNcIlxuXG5jb250cm9sbGVyc01vZHVsZS5jb250cm9sbGVyKCdNYXBDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9NYXBDdHJsJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UnKSk7XG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdJbmZvV2luZG93U2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvSW5mb1dpbmRvd1NlcnZpY2UnKSk7XG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdNYXBCdWlsZGVyU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvTWFwQnVpbGRlclNlcnZpY2UnKSk7XG4iLCJCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZSA9ICggSW5mb1dpbmRvd1NlcnZpY2UgKSAtPlxuXG4gIGFkZENsaWNrRXZlbnRUb01hcmtlciA9IChtYXJrZXIsIHNjb3BlLCBub2RlLCBjb250ZW50LCBnb29nbGVNYXApIC0+XG5cbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lciBtYXJrZXIsICdjbGljaycsICgpIC0+XG4gICAgICBub2RlSWQgPSBwYXJzZUludCBub2RlLl9pZFxuICAgICAgdXNlclZvdGVQcm9taXNlID0gZmFjdG9yeU9iai5nZXRVc2VyVm90ZVRvUG9pbnQoIExvZ2luU2VydmljZS5nZXRVc2VyTmFtZSgpLCBub2RlSWQgKVxuICAgICAgYWxsVm90ZXNQcm9taXNlID0gZmFjdG9yeU9iai5nZXRBbGxWb3Rlc1RvTm9kZSBub2RlSWRcblxuICAgICAgc2NvcGUuYWN0Tm9kZSA9IG5vZGVcbiAgICAgIFxuICAgICAgYWxsVm90ZXNQcm9taXNlLnRoZW4gKCBkYXRhICkgLT5cbiAgICAgICAgc2NvcGUuYWN0Tm9kZS52b3RlX3BvcyA9IGRhdGEucG9zXG4gICAgICAgIHNjb3BlLmFjdE5vZGUudm90ZV9uZWcgPSBkYXRhLm5lZ1xuXG4gICAgICB1c2VyVm90ZVByb21pc2UudGhlbiAoIGRhdGEgKSAtPlxuICAgICAgICAjc2NvcGUudm90ZS5pc1Jlc2V0ID0gdHJ1ZVxuICAgICAgICBzY29wZS52b3RlLnZhbHVlID0gZGF0YS52b3RlXG4gICAgICBcbiAgICAgIHNjb3BlLiRhcHBseSgpXG5cbiAgICAgIEluZm9XaW5kb3dTZXJ2aWNlLmdldEluZm9XaW5kb3coKS5zZXRDb250ZW50IGNvbnRlbnRcbiAgICAgIEluZm9XaW5kb3dTZXJ2aWNlLmdldEluZm9XaW5kb3coKS5vcGVuIGdvb2dsZU1hcCwgbWFya2VyXG5cblxuXG4gIGFkZERyYWdlbmRFdmVudFRvTWFya2VyID0gKCBtYXJrZXIsIHNjb3BlICkgLT5cbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lciBtYXJrZXIsICdkcmFnZW5kJywgKCBldmVudCApIC0+XG4gICAgICBtYXJrZXIubm9kZUluZm8uY2hhbmdlZCA9IHRydWVcbiAgICAgIG1hcmtlci5ub2RlSW5mby5sYXQgPSBldmVudC5sYXRMbmcua1xuICAgICAgbWFya2VyLm5vZGVJbmZvLmxvbiA9IGV2ZW50LmxhdExuZy5CXG4gICAgICBzY29wZS5pc1RoZXJlRWRpdGVkTm9kZSA9IHRydWVcblxuICBmYWN0b3J5T2JqID1cblxuXHRcdGNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlOiAoIHJvdXRlLCBnb29nbGVNYXAgKSAtPlxuICAgICAgY29vcmRpbmF0ZXMgPSBbXVxuICAgICAgY29vcmRpbmF0ZXMucHVzaCBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIG5vZGUubGF0LCBub2RlLmxvbiBmb3Igbm9kZSBpbiByb3V0ZVxuXG4gICAgICByb3V0ZVBvbHlsaW5lID0gbmV3IGdvb2dsZS5tYXBzLlBvbHlsaW5lIHtcbiAgICAgICAgcGF0aDogY29vcmRpbmF0ZXMsXG4gICAgICAgIGdlb2Rlc2ljOiB0cnVlLFxuICAgICAgICBzdHJva2VDb2xvcjogJyNGRjAwMDAnLFxuICAgICAgICBzdHJva2VPcGFjaXR5OiAxLjAsXG4gICAgICAgIHN0cm9rZVdlaWdodDogMixcbiAgICAgICAgbWFwOiBnb29nbGVNYXBcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvdXRlUG9seWxpbmVcblxuICAgIGNyZWF0ZU1hcmtlcnNGcm9tUm91dGU6ICggcm91dGUsIGdvb2dsZU1hcCwgc2NvcGUgKSAtPlxuXG4gICAgICBtYXJrZXJzID0gW11cblxuICAgICAgY29tcGlsZWQgPSAkY29tcGlsZShpbmZvV2luZG93Q29udGVudCkoc2NvcGUpO1xuXG4gICAgICBzY29wZS5tYXJrZXJzID0gbWFya2Vyc1xuXG4gICAgICBmb3Igbm9kZSwgaW5kZXggaW4gcm91dGVcbiAgICAgICAgbWFya2VyT3B0aW9ucyA9XG4gICAgICAgICAgbWFwOiBnb29nbGVNYXAsXG4gICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1AsXG4gICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgbm9kZS5sYXQsIG5vZGUubG9uXG5cbiAgICAgICAgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlciBtYXJrZXJPcHRpb25zXG4gICAgICAgIG1hcmtlci5ub2RlSW5mbyA9IG5vZGVcblxuICAgICAgICBtYXJrZXJzLnB1c2ggbWFya2VyXG5cbiAgICAgICAgYWRkQ2xpY2tFdmVudFRvTWFya2VyKCBtYXJrZXIsIHNjb3BlLCBub2RlLCBjb21waWxlZFswXSwgZ29vZ2xlTWFwICkgXG4gICAgICAgIGFkZERyYWdlbmRFdmVudFRvTWFya2VyKCBtYXJrZXIsIHNjb3BlIClcblxuICAgICAgY29uc29sZS5sb2cgbWFya2Vyc1xuICAgICAgbWFya2Vyc1xuXG4gICAgYWRkTmV3UG9pbnRUb0NlbnRlck9mTWFwOiAoIGdvb2dsZU1hcCwgc2NvcGUgKSAtPlxuXG4gICAgICBjb21waWxlZCA9ICRjb21waWxlKCBpbmZvV2luZG93Q29udGVudCApKCBzY29wZSApXG5cbiAgICAgIG1hcmtlck9wdGlvbnMgPVxuICAgICAgICBtYXA6IGdvb2dsZU1hcCxcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QLFxuICAgICAgICBwb3NpdGlvbjogZ29vZ2xlTWFwLmdldENlbnRlcigpIFxuXG4gICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyIG1hcmtlck9wdGlvbnNcblxuICAgICAgbWFya2VyLm5vZGVJbmZvID0ge1xuICAgICAgICB1c2VyOiBMb2dpblNlcnZpY2UuZ2V0VXNlck5hbWUoKSxcbiAgICAgICAgdm90ZV9wb3M6IDAsXG4gICAgICAgIHZvdGVfbmVnOiAwLFxuICAgICAgICBjaGFuZ2VkOiB0cnVlLFxuICAgICAgICBsYXQ6IGdvb2dsZU1hcC5nZXRDZW50ZXIoKS5rLFxuICAgICAgICBsb246IGdvb2dsZU1hcC5nZXRDZW50ZXIoKS5CLFxuICAgICAgICBfaWQ6IC0xXG4gICAgICB9XG5cbiAgICAgIGFkZENsaWNrRXZlbnRUb01hcmtlciggbWFya2VyLCBzY29wZSwgbWFya2VyLm5vZGVJbmZvLCBjb21waWxlZFswXSwgZ29vZ2xlTWFwICkgXG4gICAgICBhZGREcmFnZW5kRXZlbnRUb01hcmtlciggbWFya2VyLCBzY29wZSApXG5cbiAgICAgIG1hcmtlclxuXG4gICAgY3JlYXRlQ29vcmRpbmF0ZTogKCBsYXQsIGxvbiApIC0+XG4gICAgICBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIGxhdCxsb25cblx0XHRcbiAgICBhZGRDbGlja0V2ZW50VG9NYXJrZXI6IChtYXJrZXIsIHNjb3BlLCBub2RlLCBjb250ZW50LCBnb29nbGVNYXApIC0+XG4gICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lciBtYXJrZXIsICdjbGljaycsICgpIC0+XG4gICAgICAgIG5vZGVJZCA9IHBhcnNlSW50IG5vZGUuX2lkXG4gICAgICAgIHVzZXJWb3RlUHJvbWlzZSA9IGZhY3RvcnlPYmouZ2V0VXNlclZvdGVUb1BvaW50KCBMb2dpblNlcnZpY2UuZ2V0VXNlck5hbWUoKSwgbm9kZUlkIClcbiAgICAgICAgYWxsVm90ZXNQcm9taXNlID0gZmFjdG9yeU9iai5nZXRBbGxWb3Rlc1RvTm9kZSBub2RlSWRcblxuICAgICAgICBzY29wZS5hY3ROb2RlID0gbm9kZVxuICAgICAgICBcbiAgICAgICAgYWxsVm90ZXNQcm9taXNlLnRoZW4gKCBkYXRhICkgLT5cbiAgICAgICAgICBzY29wZS5hY3ROb2RlLnZvdGVfcG9zID0gZGF0YS5wb3NcbiAgICAgICAgICBzY29wZS5hY3ROb2RlLnZvdGVfbmVnID0gZGF0YS5uZWdcblxuICAgICAgICB1c2VyVm90ZVByb21pc2UudGhlbiAoIGRhdGEgKSAtPlxuICAgICAgICAgICNzY29wZS52b3RlLmlzUmVzZXQgPSB0cnVlXG4gICAgICAgICAgc2NvcGUudm90ZS52YWx1ZSA9IGRhdGEudm90ZVxuICAgICAgICBcbiAgICAgICAgc2NvcGUuJGFwcGx5KClcblxuICAgICAgICBJbmZvV2luZG93U2VydmljZS5nZXRJbmZvV2luZG93KCkuc2V0Q29udGVudCBjb250ZW50XG4gICAgICAgIEluZm9XaW5kb3dTZXJ2aWNlLmdldEluZm9XaW5kb3coKS5vcGVuIGdvb2dsZU1hcCwgbWFya2VyXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZSIsIkluZm9XaW5kb3dTZXJ2aWNlID0gKCApIC0+XG5cbiAgaW5mb1dpbmRvd0NvbnRlbnQgPSAnJydcbiAgICA8ZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImxpc3RcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSBpdGVtLWRpdmlkZXJcIj5cbiAgICAgICAgICAgIEJhc2ljIGluZm9cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+IFxuICAgICAgICAgICAgVXNlcjoge3thY3ROb2RlLnVzZXJ9fTxici8+XG4gICAgICAgICAgICBJZDoge3thY3ROb2RlLmxhdH19XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSBpdGVtLWRpdmlkZXJcIj5cbiAgICAgICAgICAgIEhvdyBhY2N1cmF0ZSB0aGlzIHBvaW50IGlzP1xuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW0gcmFuZ2UgcmFuZ2UtZW5lcmdpemVkXCI+IFxuICAgICAgICAgICAgPGRpdj4gXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbmFtZT1cInZvbHVtZVwiIG1pbj1cIjBcIiBtYXg9XCIyXCIgdmFsdWU9XCIxXCIgbmctbW9kZWw9XCJ2b3RlLnZhbHVlXCI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpb24taGFwcHlcIj4mbmJzcDt7e2FjdE5vZGUudm90ZV9wb3N9fTwvaT5cbiAgICAgICAgICAgICAgPGkgY2xhc3M9XCJpY29uIGlvbi1zYWRcIj4mbmJzcDt7e2FjdE5vZGUudm90ZV9uZWd9fTwvaT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICAnJydcblxuICBpbmZvd2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coKVxuXG4gIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyIGluZm93aW5kb3csICdjbG9zZWNsaWNrJywgKCkgLT5cbiAgICAxXG4gICAgIyBzY29wZS52b3RlLmlzUmVzZXQgPSB0cnVlXG4gICAgIyBzY29wZS52b3RlLnZhbHVlID0gMVxuICAgICMgc2NvcGUuJGFwcGx5KClcblxuXHRmYWN0b3J5T2JqID1cblx0IFxuICAgIGdldEluZm9XaW5kb3c6ICgpIC0+XG4gICAgICByZXR1cm4gaW5mb3dpbmRvd1xuXG4gICMgZmFjdG9yeU9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IEluZm9XaW5kb3dTZXJ2aWNlIiwiTWFwQnVpbGRlclNlcnZpY2UgPSAoICkgLT5cblxuICBmYWN0b3J5T2JqID1cbiAgICBjcmVhdGVNYXBQcm9wZXJ0aWVzOiAoIGNlbnRlclBvc2l0aW9uLCB6b29tLCBtYXBUeXBlSWQgKSAtPlxuICAgICAgbWFwUHJvcCA9XG4gICAgICAgIGNlbnRlcjogY2VudGVyUG9zaXRpb24sXG4gICAgICAgIHpvb206IHpvb20sXG4gICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlRFUlJBSU5cblxuICAgICAgbWFwUHJvcC5tYXBUeXBlSWQgPSBtYXBUeXBlSWQgaWYgbWFwVHlwZUlkP1xuICAgICAgcmV0dXJuIG1hcFByb3BcblxuICByZXR1cm4gZmFjdG9yeU9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEJ1aWxkZXJTZXJ2aWNlIiwibW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJzZXJ2aWNlc1wiXG5cbm1vZHVsZS5mYWN0b3J5KCdCaWN5Y2xlUm91dGVTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9CaWN5Y2xlUm91dGVTZXJ2aWNlJykpO1xubW9kdWxlLmZhY3RvcnkoJ01hcFBhcnRpdGlvblNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL01hcFBhcnRpdGlvblNlcnZpY2UnKSk7XG4iLCJCaWN5Y2xlUm91dGVTZXJ2aWNlID0gKCApIC0+XG5cbiAgZ2V0U3RhcnROb2RlT2ZNYXBJZDogKCBub2RlcywgbWFwSWQgKSAtPlxuICAgIGZvciBub2RlIGluIG5vZGVzXG4gICAgICBpZiBtYXBJZCBpbiBub2RlLnN0YXJ0Tm9kZUluTWFwXG4gICAgICAgIHJldHVybiAgbm9kZVxuICAgIFxuICAgIHJldHVybiBudWxsXG5cbiAgY3JlYXRlUm91dGVGcm9tU3RhcnROb2RlID0gKCBzdGFydE5vZGUgKSAtPlxuICAgIHJvdXRlID0gWyBdXG4gICAgYWN0Tm9kZSA9IHN0YXJ0Tm9kZVxuXG4gICAgd2hpbGUgYWN0Tm9kZSAhPSB1bmRlZmluZWRcbiAgICAgIHJvdXRlLnB1c2ggYWN0Tm9kZVxuICAgICAgaWYgYWN0Tm9kZS53ZWlnaHQgPCB6b29tXG4gICAgICAgIGFjdE5vZGUgPSBub2RlQXNzb2NNYXBbIGFjdE5vZGUuc2libGluZ3NbIDAgXSBdXG4gICAgICBlbHNlXG4gICAgICAgIGFjdE5vZGUgPSBub2RlQXNzb2NNYXBbIGFjdE5vZGUuc2libGluZ3NbIE1hcENvbnN0YW50cy5tYXhfem9vbSAtIHpvb20gXSBdXG5cbiAgICByZXR1cm4gcm91dGVcblxuICBmYWN0b3J5T2JqID1cblxuICAgIGNyZWF0ZVJvdXRlRnJvbU5vZGVzOiAoIHJvdXRlTm9kZXMsIHpvb20sIG1hcElkcyApIC0+XG5cbiAgICAgIGlmIHpvb20gPiBNYXBDb25zdGFudHMubWF4X3pvb21cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiem9vbSBpcyBiaWdnZXIgdGhhbiB0aGUgbWF4aW11bVxuICAgICAgICAgICAgICAgICAgICAgICAgKHVzZSBNYXBDb25zdGFudHMubWF4X3pvb20pXCJcblxuICAgICAgaWYgem9vbSA8IDFcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiem9vbSBpcyBzbWFsbGVyIHRoYW4gdGhlIG1pbmltdW1cbiAgICAgICAgICAgICAgICAgICAgICAgICh1c2UgTWFwQ29uc3RhbnRzLm1pbl96b29tKVwiXG5cbiAgICAgIHJvdXRlTm9kZXNNYXAgPSB7fVxuICAgICAgZm9yIG5vZGUgaW4gcm91dGVOb2Rlc1xuICAgICAgICByb3V0ZU5vZGVzTWFwWyBub2RlLl9pZCBdID0gbm9kZVxuXG4gICAgICBzdGFydE5vZGVzID0gW11cbiAgICAgIGZvciBtYXBJZCBpbiBtYXBJZHNcbiAgICAgICAgc3RhcnROb2RlID0gdGhpcy5nZXRTdGFydE5vZGVPZk1hcElkIHJvdXRlTm9kZXMsIG1hcElkXG4gICAgICAgIGlmIHN0YXJ0Tm9kZVxuICAgICAgICAgIHN0YXJ0Tm9kZXMucHVzaCBzdGFydE5vZGVcblxuICAgICAgZmluYWxSb3V0ZSA9IFtdXG4gICAgICBmb3Igc3RhcnROb2RlIGluIHN0YXJ0Tm9kZXNcbiAgICAgICAgcm91dGUgPSBjcmVhdGVSb3V0ZUZyb21TdGFydE5vZGUgc3RhcnROb2RlXG4gICAgICAgIGlmIHJvdXRlLmxlbmd0aCA+IGZpbmFsUm91dGUubGVuZ3RoXG4gICAgICAgICAgZmluYWxSb3V0ZSA9IHJvdXRlXG5cbiAgICAgIHJldHVybiBmaW5hbFJvdXRlO1xuXG4gIHJldHVybiBmYWN0b3J5T2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQmljeWNsZVJvdXRlU2VydmljZSIsIk1hcFBhcnRpdGlvblNlcnZpY2UgPSAoICkgLT5cblxuICBtYXBab29tRGlhbWV0ZXJTcXVhcmVzID0gW1xuICAgIDU4MjUsXG4gICAgMTQ1Ni4yNSxcbiAgICAzNjQuMDYyNSxcbiAgICA5MS4wMTYsXG4gICAgMjIuNzU0LFxuICAgIDUuNjkxLFxuICAgIDEuNDIyLFxuICAgIDAuMzU1NyxcbiAgICAwLjA4OTJcbiAgXVxuXG4gIGNhbGN1bGF0ZU1hcElkRm9yTm9kZUF0Wm9vbTogKCBjb29yZCwgem9vbSApIC0+XG5cbiAgICBhZGp1c3RlZENvb3JkID0gYWRqdXN0Q29vcmRJZk91dE9mQm91bmRzKCBjb29yZCApXG5cblxuICAgIHJvd3NDb2x1bW5zQXRab29tID0gTWF0aC5wb3cgMiwgem9vbVxuXG4gICAgbGF0RnVsbExlbiA9IE1hdGguYWJzKCBNYXBDb25zdGFudHMubGF0U3RhcnQgLSBNYXBDb25zdGFudHMubGF0RW5kIClcbiAgICBsb25GdWxsTGVuID0gTWF0aC5hYnMoIE1hcENvbnN0YW50cy5sb25TdGFydCAtIE1hcENvbnN0YW50cy5sb25FbmQgKVxuXG4gICAgZGlzdEZyb21MYXRTdGFydCA9IE1hdGguYWJzIE1hcENvbnN0YW50cy5sYXRTdGFydCAtIGFkanVzdGVkQ29vcmQubGF0XG4gICAgZGlzdEZyb21Mb25TdGFydCA9IE1hdGguYWJzIE1hcENvbnN0YW50cy5sb25TdGFydCAtIGFkanVzdGVkQ29vcmQubG9uXG5cbiAgICBsYXRMZW5BdFpvb20gPSBsYXRGdWxsTGVuIC8gcm93c0NvbHVtbnNBdFpvb21cbiAgICBsb25MZW5BdFpvb20gPSBsb25GdWxsTGVuIC8gcm93c0NvbHVtbnNBdFpvb21cblxuICAgIHJvdyA9IE1hdGguZmxvb3IoIGRpc3RGcm9tTGF0U3RhcnQgLyBsYXRMZW5BdFpvb20gKSArIDFcbiAgICBjb2x1bW4gPSBNYXRoLmZsb29yKCBkaXN0RnJvbUxvblN0YXJ0IC8gbG9uTGVuQXRab29tICkgKyAxXG5cbiAgICBtYXBJZE9mZnNldCA9IDBcbiAgICBmb3IgaW5kZXggaW4gWyAwLi4uem9vbSBdXG4gICAgICBtYXBJZE9mZnNldCArPSBNYXRoLnBvdyA0LCBpbmRleFxuICAgIG1hcElkT2Zmc2V0ICsgKCByb3cgLSAxICkgKiByb3dzQ29sdW1uc0F0Wm9vbSArIGNvbHVtbiAtIDFcblxuICBhZGp1c3RDb29yZElmT3V0T2ZCb3VuZHM6ICggY29vcmQgKSAtPlxuICAgIGFkanVzdGVkQ29vcmQgPVxuICAgICAgbGF0OiBjb29yZC5sYXRcbiAgICAgIGxvbjogY29vcmQubG9uXG5cbiAgICBpZiBjb29yZC5sb24gPj0gTWFwQ29uc3RhbnRzLmxvbkVuZFxuICAgICAgY29vcmQubG9uID0gTWFwQ29uc3RhbnRzLmxvbkVuZCAtIDAuMDAwMDFcbiAgICBlbHNlIGlmIGNvb3JkLmxvbiA8IE1hcENvbnN0YW50cy5sb25TdGFydFxuICAgICAgY29vcmQubG9uID0gTWFwQ29uc3RhbnRzLmxvblN0YXJ0XG4gICAgaWYgY29vcmQubGF0IDw9IE1hcENvbnN0YW50cy5sYXRFbmRcbiAgICAgIGNvb3JkLmxhdCA9IE1hcENvbnN0YW50cy5sYXRFbmQgKyAwLjAwMDAxXG4gICAgZWxzZSBpZiBjb29yZC5sYXQgPiBNYXBDb25zdGFudHMubGF0U3RhcnRcbiAgICAgIGNvb3JkLmxhdCA9IE1hcENvbnN0YW50cy5sYXRTdGFydFxuXG4gICAgYWRqdXN0ZWRDb29yZFxuXG4gIGZhY3RvcnlPYmogPVxuXG4gICAgZ2V0TWFwc0ZvckFyZWFBdFpvb206ICggdG9wTGVmdENvb3JkLCBib3R0b21SaWdodENvb3JkLCB6b29tICkgLT5cbiAgICAgIGJvdHRvbUxlZnRDb29yZCA9IG5ldyBDb29yZCB0b3BMZWZ0Q29vcmQubG9uLCBib3R0b21SaWdodENvb3JkLmxhdFxuICAgICAgdG9wUmlnaHRDb29yZCA9IG5ldyBDb29yZCBib3R0b21SaWdodENvb3JkLmxvbiwgdG9wTGVmdENvb3JkLmxhdFxuXG4gICAgICB0bElkID0gdGhpcy5jYWxjdWxhdGVNYXBJZEZvck5vZGVBdFpvb20gdG9wTGVmdENvb3JkLCB6b29tXG4gICAgICB0cklkID0gdGhpcy5jYWxjdWxhdGVNYXBJZEZvck5vZGVBdFpvb20gdG9wUmlnaHRDb29yZCwgem9vbVxuICAgICAgYmxJZCA9IHRoaXMuY2FsY3VsYXRlTWFwSWRGb3JOb2RlQXRab29tIGJvdHRvbUxlZnRDb29yZCwgem9vbVxuICAgICAgYnJJZCA9IHRoaXMuY2FsY3VsYXRlTWFwSWRGb3JOb2RlQXRab29tIGJvdHRvbVJpZ2h0Q29vcmQsIHpvb21cbiAgICAgIFxuICAgICAgc2V0ID0ge31cbiAgICAgIHNldFt0bElkXSA9IDE7IHNldFt0cklkXSA9IDE7IHNldFtibElkXSA9IDE7IHNldFticklkXSA9IDFcblxuICAgICAgaWRzID0gW11cblxuICAgICAgZm9yIGssdiBvZiBzZXRcbiAgICAgICAgaWRzLnB1c2ggcGFyc2VJbnQgaywgMTBcbiAgICAgIGlkc1xuXG4gICAgY2FsY3VsYXRlWm9vbUZvckFyZWE6ICggdG9wTGVmdENvb3JkLCBib3R0b21SaWdodENvb3JkICkgLT5cbiAgICAgIGxvbjEgPSBwYXJzZUZsb2F0IHRvcExlZnRDb29yZC5sb25cbiAgICAgIGxvbjIgPSBwYXJzZUZsb2F0IGJvdHRvbVJpZ2h0Q29vcmQubG9uXG4gICAgICBsYXQxID0gcGFyc2VGbG9hdCB0b3BMZWZ0Q29vcmQubGF0XG4gICAgICBsYXQyID0gcGFyc2VGbG9hdCBib3R0b21SaWdodENvb3JkLmxhdFxuXG4gICAgICBhY3REaXN0YW5jZVNxdWFyZSA9IE1hdGgucG93KCBsb24xIC0gbG9uMiwgMiApICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5wb3coIGxhdDEgLSBsYXQyLCAyIClcblxuICAgICAgZm9yIGRpc3QsIGluZGV4IGluIG1hcFpvb21EaWFtZXRlclNxdWFyZXNcbiAgICAgICAgaWYgZGlzdCA8IGFjdERpc3RhbmNlU3F1YXJlXG4gICAgICAgICAgaWYgaW5kZXggPT0gMFxuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaW5kZXhcbiAgICAgIHJldHVybiBtYXBab29tRGlhbWV0ZXJTcXVhcmVzLmxlbmd0aCAtIDFcblxuXG4gIHJldHVybiBmYWN0b3J5T2JqXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwUGFydGl0aW9uU2VydmljZSIsIkNvb3JkID0gKCkgLT5cblxuICBjbGFzcyBDb29yZFxuICAgIGNvbnN0cnVjdG9yOiAobG9uLCBsYXQpIC0+XG4gICAgICBAbGF0ID0gbGF0XG4gICAgICBAbG9uID0gbG9uXG5cbiAgcmV0dXJuIENvb3JkXG5cbiBtb2R1bGUuZXhwb3J0cyA9IENvb3JkXG4iLCJBcHBDdHJsID0gKCAkc2NvcGUsICRodHRwLCAkdGltZW91dCwgTG9naW5TZXJ2aWNlICkgLT5cblxuICAkc2NvcGUuc2VjdXJpdHkgPSB7XG4gICAgXG4gICAgaXNMb2dnZWRJbjogKCkgLT5cbiAgICAgIExvZ2luU2VydmljZS5pc0xvZ2dlZEluKClcblxuICAgIHNpZ25VcDogKCkgLT5cbiAgICAgIExvZ2luU2VydmljZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nKClcblxuICAgIGxvZ2luOiAoKSAtPlxuICAgICAgTG9naW5TZXJ2aWNlLm9wZW5Mb2dpbkRpYWxvZygpXG5cbiAgICBsb2dvdXQ6ICgpIC0+XG4gICAgICBMb2dpblNlcnZpY2UubG9nb3V0KClcblxuICB9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDdHJsIiwiZmxhc2ggPSAoICR0aW1lb3V0ICkgLT5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnXG4gICAgdGVtcGxhdGU6IFwiPGJ1dHRvbj48L2J1dHRvbj5cIlxuICAgIHJlcGxhY2U6IHRydWVcbiAgICBzY29wZToge1xuICAgICAgY29udGVudDogXCI9XCJcbiAgICAgIHRpbWVvdXQ6IFwiQFwiXG4gICAgfVxuICAgIGNvbXBpbGU6ICggZWxlbWVudCwgYXR0cnMgKSAtPlxuICAgICAgZWxlbWVudC5jc3MoIFwiZGlzcGxheVwiLCBcIm5vbmVcIiApXG4gICAgICBpZiAoIWF0dHJzLnRpbWVvdXQpIFxuICAgICAgICBhdHRycy50aW1lb3V0ID0gMzAwMFxuXG4gICAgICByZXR1cm4gKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cblxuICAgICAgICBzY29wZS4kd2F0Y2ggKCkgLT4gcmV0dXJuIHNjb3BlLmNvbnRlbnQsIFxuICAgICAgICAoIHZhbHVlICkgLT5cbiAgICAgICAgICBpZiB2YWx1ZSA9PSBcIlwiXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgIGVsZW1lbnQudGV4dCggdmFsdWUgKVxuICAgICAgICAgIGVsZW1lbnQuY3NzKCBcImRpc3BsYXlcIiwgXCJibG9ja1wiKVxuICAgICAgICAgIHNjb3BlLmNvbnRlbnQgPSBcIlwiXG5cbiAgICAgICAgICBoaWRlRWxlbWVudCA9ICgpIC0+XG4gICAgICAgICAgICBzY29wZS5jb250ZW50ID0gXCJcIiBcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseSAoKSAtPlxuICAgICAgICAgICAgICBzY29wZS5jb250ZW50ID0gXCJcIlxuICAgICAgICAgICAgZWxlbWVudC5jc3MoIFwiZGlzcGxheVwiLCBcIm5vbmVcIiApXG5cbiAgICAgICAgICAkdGltZW91dCBoaWRlRWxlbWVudCwgcGFyc2VJbnQoIHNjb3BlLnRpbWVvdXQsIDEwIClcbiAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZsYXNoIiwibWF0Y2ggPSAoKSAtPlxuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiB7XG4gICAgICBtYXRjaDogJz0nXG4gICAgfSxcbiAgICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzLCBjdHJsKSAtPlxuICAgICAgc2NvcGUuJHdhdGNoICgpIC0+XG4gICAgICAgIG1vZGVsVmFsdWUgPSBjdHJsLiRtb2RlbFZhbHVlIHx8IGN0cmwuJCRpbnZhbGlkTW9kZWxWYWx1ZVxuICAgICAgICByZXR1cm4gKCBjdHJsLiRwcmlzdGluZSAmJiBhbmd1bGFyLmlzVW5kZWZpbmVkIG1vZGVsVmFsdWUgKSB8fCBzY29wZS5tYXRjaCA9PSBtb2RlbFZhbHVlXG4gICAgICAsKCBjdXJyZW50VmFsdWUgKSAtPlxuICAgICAgICBjdHJsLiRzZXRWYWxpZGl0eSAnbWF0Y2gnICwgY3VycmVudFZhbHVlXG4gIH1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaCIsImNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJzZXJ2aWNlc1wiXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwiY29udHJvbGxlcnNcIlxuZGlyZWN0aXZlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwiZGlyZWN0aXZlc1wiXG5jbGFzc2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJjbGFzc2VzXCJcblxuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignQXBwQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvQXBwQ3RybCcpKTtcblxuc2VydmljZXNNb2R1bGUuY29uc3RhbnQoJ01hcENvbnN0YW50cycsIHJlcXVpcmUoJy4vc2VydmljZXMvTWFwQ29uc3RhbnRzJykpO1xuXG5jbGFzc2VzTW9kdWxlLmZhY3RvcnkoICdDb29yZCcsIHJlcXVpcmUoICcuL2NsYXNzZXMvQ29vcmQnICkgKVxuXG5kaXJlY3RpdmVzTW9kdWxlLmRpcmVjdGl2ZSggJ2ZsYXNoJywgcmVxdWlyZSggJy4vZGlyZWN0aXZlcy9mbGFzaCcgKSApXG5kaXJlY3RpdmVzTW9kdWxlLmRpcmVjdGl2ZSggJ21hdGNoJywgcmVxdWlyZSggJy4vZGlyZWN0aXZlcy9tYXRjaCcgKSApIiwiTWFwQ29uc3RhbnRzID0ge1xuICBtYXhfem9vbTogOSxcbiAgZ29vZ2xlX21hcF9pbnRlcm5hbF9tYXBfem9vbV9kaWZmZXJlbmNlOiAzLFxuICBsYXRTdGFydDogNzAsXG4gIGxvblN0YXJ0OiAtMTAsXG4gIGxhdEVuZDogMzAsXG4gIGxvbkVuZDogNTUsXG4gIGRiUHJlZml4OiBcIm9uX3RoZV9yaWRlXCIsXG4gIG1heFpvb206IDE1LFxuICBpbmRleGVkRGJWZXJzaW9uOiA1XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uc3RhbnRzIiwiUHJvZmlsZUN0cmwgPSAoICRzY29wZSwgRGF0YVByb3ZpZGVyU2VydmljZSwgTG9naW5TZXJ2aWNlLCBVc2VyU2VydmljZSApIC0+XG4gIFxuICBwcm9taXNlID0gRGF0YVByb3ZpZGVyU2VydmljZS5nZXRVc2VySW5mbyggTG9naW5TZXJ2aWNlLmdldFNpZ25lZEluVXNlcigpIClcbiAgcHJvbWlzZS50aGVuICggZGF0YSApIC0+XG4gICAgY29uc29sZS5sb2cgZGF0YVxuICAgICRzY29wZS51c2VyID0gZGF0YVxuICAgICRzY29wZS5zYXZlZFVzZXIgPSBhbmd1bGFyLmNvcHkgJHNjb3BlLnVzZXJcblxuICB3aW5kb3cuc2NvcGUgPSAkc2NvcGVcblxuICAkc2NvcGUudXNlciA9IHt9XG5cbiAgJHNjb3BlLnNhdmVkVXNlciA9IHt9XG5cbiAgJHNjb3BlLm5ld1Bhc3N3b3JkID0gdW5kZWZpbmVkXG5cbiAgJHNjb3BlLnBhc3N3b3JkQ2hhbmdlID0ge1xuXG4gIH1cblxuICAkc2NvcGUucHJvZmlsZUZsYXNoTWVzc2FnZSA9ICRzY29wZS5wYXNzd29yZEZsYXNoTWVzc2FnZSA9IFwiXCJcblxuICAkc2NvcGUuZ2V0VmFsdWUgPSAoKSAtPlxuICAgIGNvbnNvbGUubG9nICRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlXG5cbiAgJHNjb3BlLmdldENzc0NsYXNzZXMgPSAoIG5nTW9kZWxDb250b2xsZXIgKSAtPlxuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogbmdNb2RlbENvbnRvbGxlci4kaW52YWxpZCAmJiBuZ01vZGVsQ29udG9sbGVyLiRkaXJ0eSxcbiAgICB9XG5cbiAgJHNjb3BlLnNob3dFcnJvciA9ICggbmdNb2RlbENvbnRyb2xsZXIgLCBlcnJvciApIC0+XG4gICAgcmV0dXJuIG5nTW9kZWxDb250cm9sbGVyLiRlcnJvclsgZXJyb3IgXVxuXG4gICRzY29wZS5jYW5TYXZlRm9ybSA9ICggZm9ybSApIC0+XG4gICAgcmV0dXJuIGZvcm0uJHZhbGlkXG5cbiAgJHNjb3BlLmNhblNhdmVQcm9maWxlRm9ybSA9ICggZm9ybSApIC0+XG4gICAgcmV0dXJuIGZvcm0uJHZhbGlkICYmICggJHNjb3BlLnVzZXIuZW1haWwgIT0gJHNjb3BlLnNhdmVkVXNlci5lbWFpbCApXG5cbiAgJHNjb3BlLnN1Ym1pdFBhc3N3b3JkQ2hhbmdlRm9ybSA9ICggZm9ybSApIC0+XG5cbiAgICBpZiBmb3JtLiRkaXJ0eSAmJiBmb3JtLiRpbnZhbGlkXG4gICAgICByZXR1cm5cblxuICAgIHByb21pc2UgPSBMb2dpblNlcnZpY2UuY2hhbmdlUGFzc3dvcmQgJHNjb3BlLnVzZXIudXNlck5hbWUsICRzY29wZS5wYXNzd29yZENoYW5nZS5wYXNzd29yZCwgJHNjb3BlLnBhc3N3b3JkQ2hhbmdlLm5ld1Bhc3N3b3JkXG5cbiAgICBwcm9taXNlLnRoZW4gKCkgLT5cbiAgICAgICRzY29wZS5wYXNzd29yZENoYW5nZSA9IHt9XG4gICAgICBmb3JtLiRzZXRQcmlzdGluZSgpXG4gICAgICAkc2NvcGUucGFzc3dvcmRGbGFzaE1lc3NhZ2UgPSBcImNoYW5nZXMgc2F2ZWRcIlxuXG4gICRzY29wZS5zdWJtaXRQcm9maWxlRm9ybSA9ICggZm9ybSApIC0+XG4gICAgaWYgZm9ybS4kZGlydHkgJiYgZm9ybS4kaW52YWxpZFxuICAgICAgcmV0dXJuXG4gICAgY29uc29sZS5sb2cgXCIxOiAjeyRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlfVwiXG4gICAgcHJvbWlzZSA9IFVzZXJTZXJ2aWNlLmNoYW5nZVByb2ZpbGVEYXRhICRzY29wZS51c2VyLnVzZXJOYW1lLCAkc2NvcGUudXNlclxuXG4gICAgcHJvbWlzZS50aGVuICggVXNlciApIC0+XG4gICAgICAkc2NvcGUudXNlciA9IFVzZXJcbiAgICAgICRzY29wZS5zYXZlZFVzZXIgPSBhbmd1bGFyLmNvcHkgJHNjb3BlLnVzZXJcbiAgICAgIGZvcm0uJHNldFByaXN0aW5lKClcblxuICAgICAgJHNjb3BlLnByb2ZpbGVGbGFzaE1lc3NhZ2UgPSBcImNoYW5nZXMgc2F2ZWQ6IFwiICsgRGF0ZS5ub3coKSBcbiAgICAgIGNvbnNvbGUubG9nIFwiMjogI3skc2NvcGUucHJvZmlsZUZsYXNoTWVzc2FnZX1cIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZmlsZUN0cmwiLCJtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSBcImNvbnRyb2xsZXJzXCJcblxubW9kdWxlLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9Qcm9maWxlQ3RybCcpKTsiLCJMb2dpbkN0cmwgPSAoICRzY29wZSwgJGh0dHAsICR0aW1lb3V0LCBMb2dpblNlcnZpY2UsICRsb2NhdGlvbiApIC0+XG5cbiAgICAkc2NvcGUuZm9ybSA9IHVuZGVmaW5lZFxuXG4gICAgJHNjb3BlLnVzZXIgPSB7XG5cbiAgICB9XG5cbiAgICAkc2NvcGUuc3VibWl0Rm9ybSA9ICggZm9ybSApIC0+XG4gICAgICBpZiBmb3JtLiR2YWxpZFxuICAgICAgICBwcm9taXNlID0gTG9naW5TZXJ2aWNlLmxvZ2luICRzY29wZS51c2VyLnVzZXJOYW1lLCAkc2NvcGUudXNlci5wYXNzd29yZFxuICAgICAgICBwcm9taXNlLnRoZW4gKCkgLT5cbiAgICAgICAgICBMb2dpblNlcnZpY2UuY2xvc2VMb2dpbkRpYWxvZygpXG4gICAgICAgICAgTG9naW5TZXJ2aWNlLnJldHJ5QXV0aGVudGljYXRpb24oKVxuICAgICAgICAsICgpIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgXCJiZWplbGVudGtlesOpc2kgaGliYVwiXG5cblxuICAgICRzY29wZS5nZXRDc3NDbGFzc2VzID0gKCBuZ01vZGVsQ29udG9sbGVyICkgLT5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yOiBuZ01vZGVsQ29udG9sbGVyLiRpbnZhbGlkICYmIG5nTW9kZWxDb250b2xsZXIuJGRpcnR5LFxuICAgICAgfVxuXG4gICAgJHNjb3BlLnNob3dFcnJvciA9ICggbmdNb2RlbENvbnRyb2xsZXIgLCBlcnJvciApIC0+XG4gICAgICByZXR1cm4gbmdNb2RlbENvbnRyb2xsZXIuJGVycm9yWyBlcnJvciBdXG5cbiAgICAkc2NvcGUuY2FuY2VsRm9ybSA9ICgpIC0+XG4gICAgICBMb2dpblNlcnZpY2UuY2xvc2VMb2dpbkRpYWxvZygpXG4gICAgICAkbG9jYXRpb24ucGF0aCgnL21hcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW5DdHJsIiwiUmVnaXN0cmF0aW9uQ3RybCA9ICggJHNjb3BlLCAkaHR0cCwgJHRpbWVvdXQsIExvZ2luU2VydmljZSwgJGxvY2F0aW9uICkgLT5cblxuICAgICRzY29wZS5mb3JtID0gdW5kZWZpbmVkXG5cbiAgICAkc2NvcGUudXNlciA9IHtcblxuICAgIH1cblxuICAgICRzY29wZS5zdWJtaXRGb3JtID0gKCBmb3JtICkgLT5cbiAgICAgIGlmIGZvcm0uJHZhbGlkXG4gICAgICAgIFVzZXIgPSBcbiAgICAgICAgICB1c2VyTmFtZTogJHNjb3BlLnVzZXIudXNlck5hbWUsXG4gICAgICAgICAgcGFzc3dvcmQ6ICRzY29wZS51c2VyLnBhc3N3b3JkLFxuICAgICAgICAgIGVtYWlsOiAkc2NvcGUudXNlci5lbWFpbFxuICAgICAgICBwcm9taXNlID0gTG9naW5TZXJ2aWNlLnNpZ25VcCBVc2VyXG4gICAgICAgIHByb21pc2UudGhlbiAoKSAtPlxuICAgICAgICAgIExvZ2luU2VydmljZS5jbG9zZVJlZ2lzdHJhdGlvbkRpYWxvZygpXG4gICAgICAgICAgTG9naW5TZXJ2aWNlLnJldHJ5QXV0aGVudGljYXRpb24oKVxuICAgICAgICAsICgpIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgXCJyZWdpc3p0csOhY2nDs3MgaGliYVwiXG5cblxuICAgICRzY29wZS5nZXRDc3NDbGFzc2VzID0gKCBuZ01vZGVsQ29udG9sbGVyICkgLT5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yOiBuZ01vZGVsQ29udG9sbGVyLiRpbnZhbGlkICYmIG5nTW9kZWxDb250b2xsZXIuJGRpcnR5LFxuICAgICAgfVxuXG4gICAgJHNjb3BlLnNob3dFcnJvciA9ICggbmdNb2RlbENvbnRyb2xsZXIgLCBlcnJvciApIC0+XG4gICAgICByZXR1cm4gbmdNb2RlbENvbnRyb2xsZXIuJGVycm9yWyBlcnJvciBdXG5cbiAgICAkc2NvcGUuY2FuY2VsRm9ybSA9ICgpIC0+XG4gICAgICBMb2dpblNlcnZpY2UuY2xvc2VSZWdpc3RyYXRpb25EaWFsb2coKVxuICAgICAgJGxvY2F0aW9uLnBhdGgoJy9tYXAnKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVnaXN0cmF0aW9uQ3RybCIsInNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUgXCJzZXJ2aWNlc1wiXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwiY29udHJvbGxlcnNcIlxuXG5jb250cm9sbGVyc01vZHVsZS5jb250cm9sbGVyKCdSZWdpc3RyYXRpb25DdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9SZWdpc3RyYXRpb25DdHJsJykpO1xuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignTG9naW5DdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9Mb2dpbkN0cmwnKSk7XG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ0xvZ2luU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvTG9naW5TZXJ2aWNlJykpO1xuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnU2VjdXJpdHlSZXRyeVF1ZXVlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9TZWN1cml0eVJldHJ5UXVldWUnKSk7XG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdTZWN1cml0eUludGVyY2VwdG9yJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9TZWN1cml0eUludGVyY2VwdG9yJykpOyIsIkxvZ2luU2VydmljZSA9ICggJGh0dHAsICRxLCAkbG9jYXRpb24sIFNlY3VyaXR5UmV0cnlRdWV1ZSwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsICR0aW1lb3V0LCAkd2luZG93ICkgLT5cblxuICAkc2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcoKSBcblxuICAjVG9kbyBpbXBsZW1lbnQgb2JzZXJ2ZXIgaW5zdGVhZCBvZiB0aGlzXG4gIFNlY3VyaXR5UmV0cnlRdWV1ZS5vbkl0ZW1BZGRlZENhbGxiYWNrcy5wdXNoICggcmV0cnlJdGVtICkgLT5cbiAgICBpZiBTZWN1cml0eVJldHJ5UXVldWUuaGFzTW9yZSgpXG4gICAgICBjb25zb2xlLmxvZyBcInJldHJ5IGxlZnV0XCJcbiAgICAgIGZhY3RvcnlPYmouc2hvd0xvZ2luRGlhbG9nKClcblxuXG4gICRzY29wZS5sb2dpbkRpYWxvZyA9IHVuZGVmaW5lZFxuICAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nID0gdW5kZWZpbmVkXG5cbiAgJHNjb3BlLnJlZ2lzdGVyID0gKCkgLT5cbiAgICBjb25zb2xlLmxvZyBcInJlZ2lzdGVyXCJcbiAgICBpZiAkc2NvcGUubG9naW5EaWFsb2cgIT0gdW5kZWZpbmVkXG4gICAgICAkc2NvcGUubG9naW5EaWFsb2cuY2xvc2UoKVxuICAgICAgJHNjb3BlLmxvZ2luRGlhbG9nID0gdW5kZWZpbmVkXG4gICAgICAjVG9kbyBwb3RlbnRpYWwgYnVnLCB1c2UgcmV0dXJuZWQgcHJvbWlzZSB0byBvcGVuIHJlZ2lzdHJhdGlvbiBkaWFsb2dcbiAgICAgICR0aW1lb3V0ICRzY29wZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nLCAxXG4gIFxuICAkc2NvcGUubG9naW4gPSAoKSAtPlxuICAgIGlmICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgIT0gdW5kZWZpbmVkXG4gICAgICAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nLmNsb3NlKClcbiAgICAgICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgPSB1bmRlZmluZWRcbiAgICAgICNUb2RvIHBvdGVudGlhbCBidWcsIHVzZSByZXR1cm5lZCBwcm9taXNlIHRvIG9wZW4gcmVnaXN0cmF0aW9uIGRpYWxvZ1xuICAgICAgJHRpbWVvdXQgJHNjb3BlLm9wZW5Mb2dpbkRpYWxvZywgMVxuXG4gICRzY29wZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nID0gKCkgLT5cbiAgICAkc2NvcGUuZGF0YSA9IHt9XG5cbiAgICBpZiAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgJ1RyeWluZyB0byBvcGVuIGEgZGlhbG9nIHRoYXQgaXMgYWxyZWFkeSBvcGVuISdcbiAgICAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nID0gJGlvbmljUG9wdXAuc2hvd1xuICAgICAgdGVtcGxhdGVVcmw6IFwiL3RlbXBsYXRlcy9yZWdpc3RyYXRpb24uaHRtbFwiLFxuICAgICAgdGl0bGU6ICdQbGVhc2Ugc2lnbiB1cCcsXG4gICAgICBzY29wZTogJHNjb3BlXG5cbiAgJHNjb3BlLm9wZW5Mb2dpbkRpYWxvZyA9ICgpIC0+XG4gICAgJHNjb3BlLmRhdGEgPSB7fVxuXG4gICAgaWYgJHNjb3BlLmxvZ2luRGlhbG9nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgJ1RyeWluZyB0byBvcGVuIGEgZGlhbG9nIHRoYXQgaXMgYWxyZWFkeSBvcGVuISdcbiAgICAkc2NvcGUubG9naW5EaWFsb2cgPSAkaW9uaWNQb3B1cC5zaG93XG4gICAgICB0ZW1wbGF0ZVVybDogXCIvdGVtcGxhdGVzL2xvZ2luLmh0bWxcIlxuICAgICAgdGl0bGU6ICdQbGVhc2UgbG9nIGluJyxcbiAgICAgIHNjb3BlOiAkc2NvcGUgXG5cbiAgICAkc2NvcGUucmV0cnlBdXRoZW50aWNhdGlvbiA9ICgpIC0+XG4gICAgICBTZWN1cml0eVJldHJ5UXVldWUucmV0cnlBbGwoKVxuXG4gICAgJHNjb3BlLmNhbmNlbEF1dGhlbnRpY2F0aW9uID0gKCkgLT5cbiAgICAgIFNlY3VyaXR5UmV0cnlRdWV1ZS5jYW5jZWxBbGwoKVxuICAgICAgcmVkaXJlY3QoKVxuXG4gIHJlZGlyZWN0ID0gKHVybCkgLT5cbiAgICB1cmwgPSB1cmwgfHwgJy8nO1xuICAgICRsb2NhdGlvbi5wYXRoIHVybFxuXG4gIGZhY3RvcnlPYmogPSBcbiAgICBvcGVuUmVnaXN0cmF0aW9uRGlhbG9nOiAoKSAtPlxuICAgICAgJHNjb3BlLm9wZW5SZWdpc3RyYXRpb25EaWFsb2coKVxuXG4gICAgb3BlbkxvZ2luRGlhbG9nOiAoKSAtPlxuICAgICAgJHNjb3BlLm9wZW5Mb2dpbkRpYWxvZygpXG5cbiAgICBjbG9zZUxvZ2luRGlhbG9nOiAoKSAtPlxuICAgICAgJHNjb3BlLmxvZ2luRGlhbG9nLmNsb3NlKClcbiAgICAgICRzY29wZS5sb2dpbkRpYWxvZyA9IHVuZGVmaW5lZFxuXG4gICAgY2xvc2VSZWdpc3RyYXRpb25EaWFsb2c6ICgpIC0+XG4gICAgICAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nLmNsb3NlKClcbiAgICAgICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgPSB1bmRlZmluZWRcblxuICAgIHJldHJ5QXV0aGVudGljYXRpb246ICgpIC0+XG4gICAgICBTZWN1cml0eVJldHJ5UXVldWUucmV0cnlBbGwoKVxuXG4gICAgbG9naW46ICggdXNlck5hbWUsIHBhc3N3b3JkICkgLT5cbiAgICAgIGhhbmRsZVJlc3VsdCA9ICggcmVzdWx0ICkgLT5cbiAgICAgICAgaWYgdHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT0gXCJmdW5jdGlvblwiICBcbiAgICAgICAgICByZXN1bHQuZGF0YS50aGVuICAoIGRhdGEgKSAtPlxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSBcInVzZXJOYW1lXCIsIGRhdGEudXNlck5hbWVcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCAnbG9naW4nLCB7IHVzZXJOYW1lOiB1c2VyTmFtZSwgcGFzc3dvcmQ6IHBhc3N3b3JkIH0gKVxuICAgICAgICAudGhlbiAoIGhhbmRsZVJlc3VsdCApXG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIHNpZ25VcDogKCBVc2VyICkgLT5cbiAgICAgIGhhbmRsZVJlc3VsdCA9ICggcmVzdWx0ICkgLT5cbiAgICAgICAgaWYgdHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT0gXCJmdW5jdGlvblwiICBcbiAgICAgICAgICByZXN1bHQuZGF0YS50aGVuICAoIGRhdGEgKSAtPlxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSBcInVzZXJOYW1lXCIsIGRhdGEudXNlck5hbWVcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCAnc2lnblVwJywgVXNlciApXG4gICAgICAgIC50aGVuICggaGFuZGxlUmVzdWx0IClcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgbG9nb3V0OiAoKSAtPlxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSggXCJ1c2VyTmFtZVwiIClcbiAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL21hcFwiXG5cbiAgICBzaG93TG9naW5EaWFsb2c6ICgpIC0+XG4gICAgICAkc2NvcGUub3BlbkxvZ2luRGlhbG9nKClcblxuICAgIGFkZFVzZXI6ICggVXNlciApIC0+XG4gICAgICBoYW5kbGVSZXN1bHQgPSAoIHJlc3VsdCApIC0+XG4gICAgICAgIGlmIHR5cGVvZiByZXN1bHQuZGF0YS50aGVuID09IFwiZnVuY3Rpb25cIiAgXG4gICAgICAgICAgcmVzdWx0LmRhdGEudGhlbiAgKCBkYXRhICkgLT5cbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCd1c2Vycy9uZXcnLCBVc2VyKVxuICAgICAgICAudGhlbiAoIGhhbmRsZVJlc3VsdCApXG5cbiAgICByZW1vdmVVc2VyOiAoIFVzZXIgKSAtPlxuICAgICAgaGFuZGxlUmVzdWx0ID0gKCByZXN1bHQgKSAtPlxuICAgICAgICBpZiB0eXBlb2YgcmVzdWx0LmRhdGEudGhlbiA9PSBcImZ1bmN0aW9uXCIgIFxuICAgICAgICAgIHJlc3VsdC5kYXRhLnRoZW4gICggZGF0YSApIC0+XG4gICAgICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgICBlbHNlIFxuICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKFwidXNlcnNcIiwge2lkOiBVc2VyLmlkfSlcbiAgICAgICAgLnRoZW4gKCBoYW5kbGVSZXN1bHQgKVxuXG4gICAgZ2V0U2lnbmVkSW5Vc2VyOiAtPlxuICAgICAgdXNlck5hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtIFwidXNlck5hbWVcIlxuXG4gICAgICBkZWZlciA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmIHVzZXJOYW1lIFxuICAgICAgICByZXR1cm4gdXNlck5hbWVcbiAgICAgIGVsc2UgXG4gICAgICAgIHByb21pc2UgPSBTZWN1cml0eVJldHJ5UXVldWUucHVzaFJldHJ5Rm4gJ3VuYXV0aG9yaXplZC1zZXJ2ZXInLCBmYWN0b3J5T2JqLmdldFNpZ25lZEluVXNlclxuICAgICAgICByZXR1cm4gcHJvbWlzZVxuXG4gICAgZ2V0VXNlck5hbWU6IC0+XG4gICAgICBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtIFwidXNlck5hbWVcIlxuXG4gICAgaXNMb2dnZWRJbjogLT5cbiAgICAgIHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oIFwidXNlck5hbWVcIiApP1xuXG4gICAgY2hhbmdlUGFzc3dvcmQ6ICggdXNlck5hbWUsIG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCApIC0+XG4gICAgICBoYW5kbGVSZXN1bHQgPSAoIHJlc3VsdCApIC0+XG4gICAgICAgIGlmIHR5cGVvZiByZXN1bHQuZGF0YS50aGVuID09IFwiZnVuY3Rpb25cIiAgXG4gICAgICAgICAgcmVzdWx0LmRhdGEudGhlbiAgKCBkYXRhICkgLT5cbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgcmV0dXJuIGRhdGFcblxuICAgICAgcmVxdWVzdERhdGEgPVxuICAgICAgICB1c2VyTmFtZTogdXNlck5hbWUsXG4gICAgICAgIG9sZFBhc3N3b3JkOiBvbGRQYXNzd29yZCxcbiAgICAgICAgbmV3UGFzc3dvcmQ6IG5ld1Bhc3N3b3JkXG4gICAgICByZXR1cm4gJGh0dHAucHV0KCBcImNoYW5nZVBhc3N3b3JkXCIsIHJlcXVlc3REYXRhIClcbiAgICAgICAgLnRoZW4gKCBoYW5kbGVSZXN1bHQgKVxuIFxuICBmYWN0b3J5T2JqXG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW5TZXJ2aWNlIiwiU2VjdXJpdHlJbnRlcmNlcHRvciA9ICggJGluamVjdG9yLCBTZWN1cml0eVJldHJ5UXVldWUgKSAtPlxuICByZXR1cm4gKCBwcm9taXNlICkgLT5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuIChvcmlnaW5hbFJlc3BvbnNlKSAtPlxuICAgICAgcmV0dXJuIG9yaWdpbmFsUmVzcG9uc2VcbiAgICAsICggb3JpZ2luYWxSZXNwb25zZSApIC0+XG4gICAgICBjb25zb2xlLmxvZyBcImxvZ2luIGVycm9yXCJcbiAgICAgIGNvbnNvbGUubG9nIG9yaWdpbmFsUmVzcG9uc2Uuc3RhdHVzXG4gICAgICBpZiBvcmlnaW5hbFJlc3BvbnNlLnN0YXR1cyA9PSA0MDFcblxuICAgICAgICBwcm9taXNlID0gU2VjdXJpdHlSZXRyeVF1ZXVlLnB1c2hSZXRyeUZuICd1bmF1dGhvcml6ZWQtc2VydmVyJywgKCkgLT5cbiAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnJGh0dHAnKSBvcmlnaW5hbFJlc3BvbnNlLmNvbmZpZ1xuXG4gICAgICByZXR1cm4gcHJvbWlzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlY3VyaXR5SW50ZXJjZXB0b3JcbiIsIlNlY3VyaXR5UmV0cnlRdWV1ZSA9ICggJHEsICRsb2cgKSAtPlxuICByZXRyeVF1ZXVlID0gW11cbiAgc2VydmljZSA9XG4gICAgIyBUaGUgc2VjdXJpdHkgc2VydmljZSBwdXRzIGl0cyBvd24gaGFuZGxlciBpbiBoZXJlIVxuICAgIG9uSXRlbUFkZGVkQ2FsbGJhY2tzOiBbXSxcbiAgICBcbiAgICBoYXNNb3JlOiAoKSAtPlxuICAgICAgcmV0dXJuIHJldHJ5UXVldWUubGVuZ3RoID4gMFxuXG4gICAgcHVzaDogKCByZXRyeUl0ZW0gKSAtPlxuICAgICAgcmV0cnlRdWV1ZS5wdXNoIHJldHJ5SXRlbVxuICAgICAgXG4gICAgICBhbmd1bGFyLmZvckVhY2ggc2VydmljZS5vbkl0ZW1BZGRlZENhbGxiYWNrcywgKCBjYiApIC0+XG4gICAgICAgIHRyeSBjYiggcmV0cnlJdGVtIClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICRsb2cuZXJyb3IgJ3NlY3VyaXR5UmV0cnlRdWV1ZS5wdXNoKHJldHJ5SXRlbSk6IGNhbGxiYWNrIHRocmV3IGFuIGVycm9yJyArIGVcblxuICAgIHB1c2hSZXRyeUZuOiAoIHJlYXNvbiwgcmV0cnlGbiApIC0+XG5cbiAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxuICAgICAgICByZXRyeUZuID0gcmVhc29uXG4gICAgICAgIHJlYXNvbiA9IHVuZGVmaW5lZFxuXG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgIHJldHJ5SXRlbSA9XG4gICAgICAgIHJlYXNvbjogcmVhc29uLFxuICAgICAgICByZXRyeTogKCkgLT5cblxuICAgICAgICAgICRxLndoZW4oIHJldHJ5Rm4oKSApLnRoZW4oICggdmFsdWUgKSAtPlxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSB2YWx1ZVxuICAgICAgICAgICwgKCB2YWx1ZSApIC0+XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgdmFsdWVcbiAgICAgICAgICApXG5cbiAgICAgICAgY2FuY2VsOiAoKSAtPlxuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpXG5cbiAgICAgIHNlcnZpY2UucHVzaCByZXRyeUl0ZW1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICByZXRyeVJlYXNvbjogKCkgLT5cbiAgICAgIHJldHVybiBzZXJ2aWNlLmhhc01vcmUoKSAmJiByZXRyeVF1ZXVlWzBdLnJlYXNvblxuXG4gICAgY2FuY2VsQWxsOiAoKSAtPlxuICAgICAgd2hpbGUgc2VydmljZS5oYXNNb3JlKCkgXG4gICAgICAgIHJldHJ5UXVldWUuc2hpZnQoKS5jYW5jZWwoKVxuXG4gICAgcmV0cnlBbGw6ICgpIC0+XG4gICAgICB3aGlsZSBzZXJ2aWNlLmhhc01vcmUoKVxuICAgICAgICByZXRyeVF1ZXVlLnNoaWZ0KCkucmV0cnkoKVxuXG4gIHJldHVybiBzZXJ2aWNlXG5cbm1vZHVsZS5leHBvcnRzID0gU2VjdXJpdHlSZXRyeVF1ZXVlIiwiRGF0YVByb3ZpZGVyU2VydmljZSA9ICggJGh0dHAsICRxICkgLT5cbiAgXG4gIGZhY3RvcnlPYmogPVxuICBcbiAgICBsb2FkUGxhY2VJbmZvOiAtPlxuICAgICAgJGh0dHAuZ2V0ICcvaW5mbydcblxuICAgIGxvYWRSb3V0ZUluZm86ICggem9vbSwgbWFwcyApIC0+XG4gICAgICBtYXBzU3RyID0gbWFwcy5qb2luKClcbiAgICAgIHJldCA9ICRodHRwLmdldCBcInJvdXRlL2V1cm92ZWxvXzYvI3t6b29tfS8je21hcHNTdHJ9XCJcblxuICAgIGxvYWRNYXBBcmVhOiAoIGlkICkgLT5cbiAgICAgICRodHRwLmdldCAnL21hcC8wJ1xuXG4gICAgc2F2ZVBsYWNlSW5mbzogKCBkYXRhICkgLT5cbiAgICAgICRodHRwLnBvc3QgJy9pbmZvJywgZGF0YVxuXG4gICAgZ2V0VXNlckluZm86ICggdXNlck5hbWUgKSAtPlxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAgICRodHRwLmdldCBcIi91c2Vycy8je3VzZXJOYW1lfVwiXG4gICAgICAudGhlbiAoIHJlc3AgKSAtPlxuICAgICAgICBpZiByZXNwLmRhdGEudGhlbj8gXG4gICAgICAgICAgcmVzcC5kYXRhLnRoZW4gKCByZXNwMiApIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXJcIilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCByZXNwMiApXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCByZXNwMiApXG5cbiAgICAgIGRlZmVycmVkLnByb21pc2VcblxuXG5cbiAgZmFjdG9yeU9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFQcm92aWRlclNlcnZpY2UiLCJMb2NhbERhdGFQcm92aWRlclNlcnZpY2UgPSAoICRodHRwLCAkcSwgTWFwQ29uc3RhbnRzICkgLT5cblxuICBpZGJTdXBwb3J0ZWQgPSBmYWxzZVxuICBpZiBcImluZGV4ZWREQlwiIGluIHdpbmRvd1xuICAgIGlkYlN1cHBvcnRlZCA9IHRydWUgXG4gIGRiID0gdW5kZWZpbmVkXG5cbiAgI3RvZG8gY2hlY2sgaW5kZXhlZGRiIGlzIHN1cHBvcnRlZFxuICBvcGVuQ29ubmVjdGlvbiA9ICgpIC0+XG4gICAgY29ublJlcXVlc3QgPSBpbmRleGVkREIub3BlbihcbiAgICAgIE1hcENvbnN0YW50cy5kYlByZWZpeCxcbiAgICAgIE1hcENvbnN0YW50cy5pbmRleGVkRGJWZXJzaW9uXG4gICAgKVxuXG4gICAgY29ublJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gKCBlICkgLT5cbiAgICAgIGNvbnNvbGUubG9nIFwidXBncmFkZW5lZWRlZWRcIlxuICAgICAgdGhpc0RCID0gZS50YXJnZXQucmVzdWx0XG5cbiAgICAgIGlmICF0aGlzREIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyggXCJldXJvdmVsb182XCIgKVxuICAgICAgICB0aGlzREIuY3JlYXRlT2JqZWN0U3RvcmUgXCJldXJvdmVsb182XCIsIHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9XG5cbiAgICAgIGlmICF0aGlzREIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyggXCJ1c2Vyc1wiIClcbiAgICAgICAgdGhpc0RCLmNyZWF0ZU9iamVjdFN0b3JlIFwidXNlcnNcIiwgeyBhdXRvSW5jcmVtZW50OiB0cnVlIH1cblxuICAgICAgaWYgIXRoaXNEQi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKCBcInZvdGVzXCIgKVxuICAgICAgICB0aGlzREIuY3JlYXRlT2JqZWN0U3RvcmUgXCJ2b3Rlc1wiLCB7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfVxuXG4gICAgY29ublJlcXVlc3Qub25lcnJvciA9ICggZSApIC0+XG4gICAgICBjb25zb2xlLmxvZyBcIkVycm9yXCJcbiAgICAgIGNvbnNvbGUuZGlyIGVcblxuICAgIGNvbm5SZXF1ZXN0XG5cbiAgc2hvdWxkUG9wdWxhdGVEYiA9ICgpIC0+XG4gICAgcXVlcnlEYklmVGhlcmVBcmVBbnlEYXRhID0gKCBkZWYgKSAtPlxuICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbiBbIFwiZXVyb3ZlbG9fNlwiIF0sIFwicmVhZG9ubHlcIlxuICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSBcImV1cm92ZWxvXzZcIlxuICAgICAgY3Vyc29yID0gc3RvcmUub3BlbkN1cnNvcigpXG5cbiAgICAgIHJvdXRlID0gW11cblxuICAgICAgY3Vyc29yLm9uc3VjY2VzcyA9ICggZSApIC0+XG4gICAgICAgIHJlcyA9IGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICBpZiByZXNcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInNob3VsZCdudFwiXG4gICAgICAgICAgZGVmLnJlc29sdmUgZmFsc2VcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInNob3VsZFwiXG4gICAgICAgICAgZGVmLnJlc29sdmUgdHJ1ZVxuXG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBpZiBkYlxuICAgICAgcXVlcnlEYklmVGhlcmVBcmVBbnlEYXRhKCBkZWZlcnJlZCApXG4gICAgZWxzZVxuICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpXG5cbiAgICAgIG9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9ICggZSApIC0+XG4gICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0XG4gICAgICAgIHF1ZXJ5RGJJZlRoZXJlQXJlQW55RGF0YSggZGVmZXJyZWQgKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIGZhY3RvcnlPYmogPVxuXG4gICAgbG9hZFJvdXRlSW5mbzogKCB6b29tLCBtYXBzICkgLT5cbiAgICAgIGxvYWRSb3V0ZUluZm9Gcm9tSW5kZXhlZERiID0gKCBkZWYgKSAtPlxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJldXJvdmVsb182XCIgXSwgXCJyZWFkb25seVwiXG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUgXCJldXJvdmVsb182XCJcbiAgICAgICAgY3Vyc29yID0gc3RvcmUub3BlbkN1cnNvcigpXG5cbiAgICAgICAgcm91dGUgPSBbXVxuXG4gICAgICAgIGN1cnNvci5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIHJlcyA9IGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICAgIGlmIHJlc1xuICAgICAgICAgICAgbm9kZSA9IHJlcy52YWx1ZVxuICAgICAgICAgICAgbm9kZS5faWQgPSByZXMua2V5XG4gICAgICAgICAgICByb3V0ZS5wdXNoIG5vZGVcbiAgICAgICAgICAgIHJlcy5jb250aW51ZSgpO1xuXG4gICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZXNvbHZlIHJvdXRlXG5cbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgICBzaG91bGRQb3B1bGF0ZVByb21pc2UgPSBzaG91bGRQb3B1bGF0ZURiKClcbiAgICAgIHRoYXQgPSB0aGlzXG4gICAgICBzaG91bGRQb3B1bGF0ZVByb21pc2UudGhlbiAoIHNob3VsZCApIC0+XG4gICAgICAgIGlmIHNob3VsZFxuICAgICAgICAgIHByb21pc2UgPSB0aGF0LmNsZWFyQW5kUG9wdWxhdGVEYkZvclRlc3RpbmcoKVxuICAgICAgICAgIHByb21pc2UudGhlbiAoKSAtPlxuICAgICAgICAgICAgbG9hZFJvdXRlSW5mb0Zyb21JbmRleGVkRGIoIGRlZmVycmVkIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxvYWRSb3V0ZUluZm9Gcm9tSW5kZXhlZERiKCBkZWZlcnJlZCApXG5cblxuICAgICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICAgY2xlYXJBbmRQb3B1bGF0ZURiRm9yVGVzdGluZzogKCkgLT5cbiAgICAgIGNsZWFyQW5kcG9wdWxhdGVEYkZyb21TZXJ2ZXIgPSAoIGRlZiApIC0+XG4gICAgICAgIGRiUHJvbWlzZSA9ICRodHRwLmdldCBcImR1bW15RGF0YWJhc2VcIlxuICAgICAgICBkYlByb21pc2Uuc3VjY2VzcyAoIG5vZGVzICkgLT5cbiAgICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJldXJvdmVsb182XCIgXSwgXCJyZWFkd3JpdGVcIlxuICAgICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUgXCJldXJvdmVsb182XCJcbiAgICAgICAgICBzdG9yZS5jbGVhcigpXG5cbiAgICAgICAgICBmb3Igbm9kZSBpbiBub2Rlc1xuICAgICAgICAgICAgc3RvcmUuYWRkIG5vZGVcbiAgICAgICAgICBkZWYucmVzb2x2ZSgpXG5cbiAgICAgICAgZGJQcm9taXNlLmVycm9yICggZGF0YSApIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgXCJmYWlsdXJlXCJcblxuICAgICAgY2xlYXJBbmRwb3B1bGF0ZURiRnJvbUFycmF5ID0gKCBkZWYgKSAtPlxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJldXJvdmVsb182XCIgXSwgXCJyZWFkd3JpdGVcIlxuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlIFwiZXVyb3ZlbG9fNlwiXG4gICAgICAgIHN0b3JlLmNsZWFyKClcblxuICAgICAgICBmb3Igbm9kZSBpbiBzbWFsbERhdGFiYXNlRm9yVGVzdGluZ1xuICAgICAgICAgIG5vZGUudm90ZV9wb3MgPSAwXG4gICAgICAgICAgbm9kZS52b3RlX25lZyA9IDBcbiAgICAgICAgICBub2RlLnVzZXIgPSBcImdzYW50YVwiXG4gICAgICAgICAgc3RvcmUuYWRkIG5vZGVcbiAgICAgICAgZGVmLnJlc29sdmUoKVxuXG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgIGlmIGRiXG4gICAgICAgIGNsZWFyQW5kcG9wdWxhdGVEYkZyb21BcnJheSggZGVmZXJyZWQgKVxuICAgICAgZWxzZVxuICAgICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKClcblxuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0XG4gICAgICAgICAgY2xlYXJBbmRwb3B1bGF0ZURiRnJvbUFycmF5KCBkZWZlcnJlZCApXG4gICAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICB1cGRhdGVOb2RlOiAoIGlkLCBwcm9wcyApIC0+XG4gICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJldXJvdmVsb182XCIgXSwgXCJyZWFkd3JpdGVcIlxuICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSBcImV1cm92ZWxvXzZcIlxuICAgICAgcmVxdWVzdCA9IHN0b3JlLnB1dCBwcm9wcywgaWRcblxuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcInN1Y2Nlc3Mgc2F2aW5nIG5vZGVcIlxuXG4gICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoIGUgKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcImVycm9yIHNhdmluZyBub2RlXCJcblxuXG4gICAgYWRkTm9kZTogKCBub2RlICkgLT5cbiAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24gWyBcImV1cm92ZWxvXzZcIiBdLCBcInJlYWR3cml0ZVwiXG4gICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlIFwiZXVyb3ZlbG9fNlwiXG4gICAgICByZXF1ZXN0ID0gc3RvcmUuYWRkIG5vZGVcblxuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcInN1Y2Nlc3MgYWRkaW5nIG5vZGVcIlxuXG4gICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoIGUgKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcImVycm9yIGFkZGluZyBub2RlXCJcblxuICAgIGdldFVzZXI6ICggdXNlck5hbWUsIHBhc3N3b3JkICkgLT5cbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgICBsb2FkVXNlckluZm9Gcm9tSW5kZXhlZERiID0gKCBkZWYgKSAtPlxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJ1c2Vyc1wiIF0sIFwicmVhZG9ubHlcIlxuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlIFwidXNlcnNcIlxuICAgICAgICBjdXJzb3IgPSBzdG9yZS5vcGVuQ3Vyc29yKClcblxuICAgICAgICB1c2VyID0gdW5kZWZpbmVkXG5cbiAgICAgICAgY3Vyc29yLm9uc3VjY2VzcyA9ICggZSApIC0+XG4gICAgICAgICAgYWN0VXNlciA9IGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICAgIGlmIGFjdFVzZXI/XG4gICAgICAgICAgICBpZiBhY3RVc2VyLnZhbHVlPyAmJiBhY3RVc2VyLnZhbHVlLnVzZXJOYW1lID09IHVzZXJOYW1lXG4gICAgICAgICAgICAgIHVzZXIgPSBhY3RVc2VyLnZhbHVlXG4gICAgICAgICAgICAgIHVzZXIuaWQgPSBhY3RVc2VyLmtleVxuICAgICAgICAgICAgICB1c2VyLnBhc3N3b3JkID0gXCJcIlxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgYWN0VXNlci5jb250aW51ZSgpO1xuXG4gICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSAoIGUgKSAtPlxuICAgICAgICAgIGlmIHVzZXJcbiAgICAgICAgICAgIGRlZi5yZXNvbHZlIHVzZXJcbiAgICAgICAgICBlbHNlIGRlZi5yZWplY3QgXCJsb2dpbiBlcnJvclwiXG5cbiAgICAgIGlmIGRiXG4gICAgICAgIGxvYWRVc2VySW5mb0Zyb21JbmRleGVkRGIoIGRlZmVycmVkIClcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2cgXCJvcGVuUmVxdWVzdFwiXG4gICAgICAgIG9wZW5SZXF1ZXN0ID0gb3BlbkNvbm5lY3Rpb24oKVxuXG4gICAgICAgIG9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9ICggZSApIC0+XG4gICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHRcbiAgICAgICAgICBsb2FkVXNlckluZm9Gcm9tSW5kZXhlZERiKCBkZWZlcnJlZCApXG5cbiAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgIGFkZFVzZXI6ICggVXNlciApIC0+XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICAgYWRkVXNlclRvSW5kZXhlZERiID0gKCBkZWYgKSAtPlxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJ1c2Vyc1wiIF0sIFwicmVhZHdyaXRlXCJcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSBcInVzZXJzXCJcbiAgICAgICAgcmVxdWVzdCA9IHN0b3JlLmFkZCBVc2VyXG5cbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZXNvbHZlIFVzZXJcblxuICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZWplY3QgXCJwcm9ibGVtIHdpdGggc2lnbmluZyB1cFwiXG5cbiAgICAgIGlmIGRiXG4gICAgICAgIGFkZFVzZXJUb0luZGV4ZWREYiggZGVmZXJyZWQgKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyBcIm9wZW5SZXF1ZXN0XCJcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpXG5cbiAgICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gKCBlICkgLT5cbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICAgIGFkZFVzZXJUb0luZGV4ZWREYiggZGVmZXJyZWQgKVxuICAgICAgXG4gICAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICB1cGRhdGVVc2VyOiAoIHVzZXJOYW1lLCB1cGRhdGVPYmogKSAtPlxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAgIHByb21pc2UgPSB0aGlzLmdldFVzZXIgdXNlck5hbWUsIHVuZGVmaW5lZFxuXG4gICAgICBwcm9taXNlLnRoZW4gKCBkYXRhICkgLT5cbiAgICAgICAgZm9yIGssdiBvZiBkYXRhXG4gICAgICAgICAgaWYgdXBkYXRlT2JqWyBrIF0/XG4gICAgICAgICAgICBkYXRhWyBrIF0gPSB1cGRhdGVPYmpbIGsgXVxuXG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24gWyBcInVzZXJzXCIgXSwgXCJyZWFkd3JpdGVcIlxuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlIFwidXNlcnNcIlxuICAgICAgICByZXF1ZXN0ID0gc3RvcmUucHV0IGRhdGEsIGRhdGEuaWRcblxuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9ICggZSApIC0+XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSBkYXRhXG5cbiAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgIHJlbW92ZVVzZXI6ICggVXNlciApIC0+XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICAgcmVtb3ZlZFVzZXJGcm9tSW5kZXhlZERiID0gKCBkZWYgKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcInJlbW92ZVVzZXJcIlxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJ1c2Vyc1wiIF0sIFwicmVhZHdyaXRlXCJcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSBcInVzZXJzXCJcbiAgICAgICAgcmVxdWVzdCA9IHN0b3JlLmRlbGV0ZSBVc2VyLmlkXG5cbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZXNvbHZlIFVzZXJcblxuICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZWplY3QgXCJwcm9ibGVtIHdpdGggZGVsZXRpbmcgdXNlclwiXG5cbiAgICAgIGlmIGRiXG4gICAgICAgIHJlbW92ZWRVc2VyRnJvbUluZGV4ZWREYiggZGVmZXJyZWQgKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyBcIm9wZW5SZXF1ZXN0XCJcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpXG5cbiAgICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gKCBlICkgLT5cbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICAgIHJlbW92ZWRVc2VyRnJvbUluZGV4ZWREYiggZGVmZXJyZWQgKVxuICAgICAgXG4gICAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICBnZXRVc2VyVm90ZUZvck5vZGU6ICggdXNlck5hbWUsIG5vZGVJZCApIC0+XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICAgbG9hZFVzZXJWb3RlRm9yTm9kZSA9ICggZGVmICkgLT5cbiAgICAgICAgbm9kZUlkID0gcGFyc2VJbnQgbm9kZUlkXG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24gWyBcInZvdGVzXCIgXSwgXCJyZWFkb25seVwiXG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUgXCJ2b3Rlc1wiXG4gICAgICAgIGN1cnNvciA9IHN0b3JlLm9wZW5DdXJzb3IoKVxuXG4gICAgICAgIHZvdGUgPSB1bmRlZmluZWRcblxuICAgICAgICBjdXJzb3Iub25zdWNjZXNzID0gKCBlICkgLT5cbiAgICAgICAgICBhY3RWb3RlID0gZS50YXJnZXQucmVzdWx0XG4gICAgICAgICAgaWYgYWN0Vm90ZT9cbiAgICAgICAgICAgIGlmIGFjdFZvdGUudmFsdWUudXNlciA9PSB1c2VyTmFtZSAmJiBhY3RWb3RlLnZhbHVlLm5vZGUgPT0gbm9kZUlkXG4gICAgICAgICAgICAgIHZvdGUgPSBhY3RWb3RlLnZhbHVlXG4gICAgICAgICAgICAgIHZvdGUuaWQgPSBhY3RWb3RlLmtleVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgYWN0Vm90ZS5jb250aW51ZSgpO1xuXG4gICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZXNvbHZlIHZvdGVcblxuICAgICAgaWYgZGJcbiAgICAgICAgbG9hZFVzZXJWb3RlRm9yTm9kZSggZGVmZXJyZWQgKVxuICAgICAgZWxzZVxuICAgICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKClcblxuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0XG4gICAgICAgICAgbG9hZFVzZXJWb3RlRm9yTm9kZSggZGVmZXJyZWQgKVxuXG4gICAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICBzZXRVc2VyVm90ZUZvck5vZGU6ICggdXNlck5hbWUsIG5vZGVJZCwgdm90ZSApIC0+XG4gICAgICBzZXRVc2VyVm90ZUZvck5vZGVUb0luZGV4RGIgPSAoIGRlZiwgZGF0YSwgaXNVcGRhdGUgKSAtPlxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uIFsgXCJ2b3Rlc1wiIF0sIFwicmVhZHdyaXRlXCJcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSBcInZvdGVzXCJcblxuICAgICAgICBpZiBpc1VwZGF0ZVxuICAgICAgICAgIHJlcXVlc3QgPSBzdG9yZS5wdXQgZGF0YSwgZGF0YS5pZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVxdWVzdCA9IHN0b3JlLmFkZCBkYXRhXG5cbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZXNvbHZlIGRhdGFcblxuICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZWplY3QgXCJwcm9ibGVtIHdpdGggZGVsZXRpbmcgdXNlclwiXG5cbiAgICAgIHByb21pc2UgPSBmYWN0b3J5T2JqLmdldFVzZXJWb3RlRm9yTm9kZSB1c2VyTmFtZSwgbm9kZUlkXG5cbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgICBwcm9taXNlLnRoZW4gKCBkYXRhICkgLT5cblxuICAgICAgICBpZiBkYXRhP1xuICAgICAgICAgIGRhdGEudm90ZSA9IHZvdGVcbiAgICAgICAgICBzZXRVc2VyVm90ZUZvck5vZGVUb0luZGV4RGIgZGVmZXJyZWQsIGRhdGEsIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRhdGEgPVxuICAgICAgICAgICAgdXNlcjogdXNlck5hbWVcbiAgICAgICAgICAgIG5vZGU6IG5vZGVJZFxuICAgICAgICAgICAgdm90ZTogdm90ZVxuICAgICAgICAgIHNldFVzZXJWb3RlRm9yTm9kZVRvSW5kZXhEYiBkZWZlcnJlZCwgZGF0YSwgZmFsc2VcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICAgZ2V0Vm90ZXNGb3JOb2RlOiAoIG5vZGVJZCApIC0+XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICAgbG9hZFVzZXJWb3RlRm9yTm9kZSA9ICggZGVmICkgLT5cbiAgICAgICAgbm9kZUlkID0gcGFyc2VJbnQgbm9kZUlkXG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24gWyBcInZvdGVzXCIgXSwgXCJyZWFkb25seVwiXG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUgXCJ2b3Rlc1wiXG4gICAgICAgIGN1cnNvciA9IHN0b3JlLm9wZW5DdXJzb3IoKVxuXG4gICAgICAgIHZvdGVzID1cbiAgICAgICAgICBub2RlSWQ6IG5vZGVJZFxuICAgICAgICAgIHBvczogMFxuICAgICAgICAgIG5lZzogMFxuXG4gICAgICAgIGN1cnNvci5vbnN1Y2Nlc3MgPSAoIGUgKSAtPlxuICAgICAgICAgIGFjdFZvdGUgPSBlLnRhcmdldC5yZXN1bHRcbiAgICAgICAgICBpZiBhY3RWb3RlP1xuICAgICAgICAgICAgaWYgYWN0Vm90ZS52YWx1ZS5ub2RlID09IG5vZGVJZFxuICAgICAgICAgICAgICBpZiBhY3RWb3RlLnZhbHVlLnZvdGUgPT0gMFxuICAgICAgICAgICAgICAgIHZvdGVzLm5lZyArPSAxXG4gICAgICAgICAgICAgIGVsc2UgaWYgYWN0Vm90ZS52YWx1ZS52b3RlID09IDJcbiAgICAgICAgICAgICAgICB2b3Rlcy5wb3MgKz0gMVxuICAgICAgICAgICAgYWN0Vm90ZS5jb250aW51ZSgpO1xuXG4gICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSAoIGUgKSAtPlxuICAgICAgICAgIGRlZi5yZXNvbHZlIHZvdGVzXG5cbiAgICAgIGlmIGRiXG4gICAgICAgIGxvYWRVc2VyVm90ZUZvck5vZGUoIGRlZmVycmVkIClcbiAgICAgIGVsc2VcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpXG5cbiAgICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gKCBlICkgLT5cbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICAgIGxvYWRVc2VyVm90ZUZvck5vZGUoIGRlZmVycmVkIClcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZVxuXG5cbiAgZmFjdG9yeU9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZSIsIm1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlIFwic2VydmljZXNcIlxuXG5tb2R1bGUuZmFjdG9yeSgnRm9ybUhlbHBlcicsIHJlcXVpcmUoJy4vc2VjdXJpdHkvRm9ybUhlbHBlcicpKTtcbm1vZHVsZS5mYWN0b3J5KCdEYXRhUHJvdmlkZXJTZXJ2aWNlJywgcmVxdWlyZSgnLi9EYXRhUHJvdmlkZXJTZXJ2aWNlJykpO1xubW9kdWxlLmZhY3RvcnkoJ0xvY2FsRGF0YVByb3ZpZGVyU2VydmljZScsIHJlcXVpcmUoJy4vTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlJykpO1xuXG4iLCJGb3JtSGVscGVyID0gKCAkaHR0cCwgJHEgKSAtPlxuICBcbiAgZmFjdG9yeU9iaiA9XG4gIFxuICAgIGxvYWRQbGFjZUluZm86IC0+XG4gICAgICAkaHR0cC5nZXQgJy9pbmZvJ1xuXG4gICAgbG9hZFJvdXRlSW5mbzogKCB6b29tLCBtYXBzICkgLT5cbiAgICAgIG1hcHNTdHIgPSBtYXBzLmpvaW4oKVxuICAgICAgcmV0ID0gJGh0dHAuZ2V0IFwicm91dGUvZXVyb3ZlbG9fNi8je3pvb219LyN7bWFwc1N0cn1cIlxuXG4gICAgbG9hZE1hcEFyZWE6ICggaWQgKSAtPlxuICAgICAgJGh0dHAuZ2V0ICcvbWFwLzAnXG5cbiAgICBzYXZlUGxhY2VJbmZvOiAoIGRhdGEgKSAtPlxuICAgICAgJGh0dHAucG9zdCAnL2luZm8nLCBkYXRhXG5cbiAgICBnZXRVc2VySW5mbzogKCB1c2VyTmFtZSApIC0+XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICAgJGh0dHAuZ2V0IFwiL3VzZXJzLyN7dXNlck5hbWV9XCJcbiAgICAgIC50aGVuICggcmVzcCApIC0+XG4gICAgICAgIGlmIHJlc3AuZGF0YS50aGVuPyBcbiAgICAgICAgICByZXNwLmRhdGEudGhlbiAoIHJlc3AyICkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXNlclwiKVxuICAgICAgICAgICAgY29uc29sZS5sb2coIHJlc3AyIClcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIHJlc3AyIClcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZVxuXG5cblxuICBmYWN0b3J5T2JqXG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybUhlbHBlciJdfQ==
