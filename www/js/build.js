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

},{"./dao":2,"./editor":6,"./map_builder":9,"./map_calculation":13,"./misc":20,"./profile":23,"./security":27,"./services":33}],2:[function(require,module,exports){
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
var controllersModule, servicesModule;

controllersModule = angular.module("controllers");

servicesModule = angular.module("services");

controllersModule.controller('ProfileCtrl', require('./controllers/ProfileCtrl'));

servicesModule.factory('UserService', require('./services/UserService'));

},{"./controllers/ProfileCtrl":22,"./services/UserService":24}],24:[function(require,module,exports){
var UserService;

UserService = function($http) {
  var factoryObj;
  factoryObj = {
    changeProfileData: function(userName, changeObj) {
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
      return $http.put("users/" + userName, changeObj).then(handleResult);
    }
  };
  return factoryObj;
};

module.exports = UserService;

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
var controllersModule, servicesModule;

servicesModule = angular.module("services");

controllersModule = angular.module("controllers");

controllersModule.controller('RegistrationCtrl', require('./controllers/RegistrationCtrl'));

controllersModule.controller('LoginCtrl', require('./controllers/LoginCtrl'));

servicesModule.factory('LoginService', require('./services/LoginService'));

servicesModule.factory('SecurityRetryQueue', require('./services/SecurityRetryQueue'));

servicesModule.factory('SecurityInterceptor', require('./services/SecurityInterceptor'));

},{"./controllers/LoginCtrl":25,"./controllers/RegistrationCtrl":26,"./services/LoginService":28,"./services/SecurityInterceptor":29,"./services/SecurityRetryQueue":30}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
(function() {
  var module;

  module = angular.module("services");

  module.factory('FormHelper', require('./security/FormHelper'));

  module.factory('DataProviderService', require('./DataProviderService'));

  module.factory('LocalDataProviderService', require('./LocalDataProviderService'));

}).call(this);

},{"./DataProviderService":31,"./LocalDataProviderService":32,"./security/FormHelper":34}],34:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvYXBwLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvZGFvL2luZGV4LmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvZGFvL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZURhb1NlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9kYW8vc2VydmljZXMvVm90ZURhb1NlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9lZGl0b3IvY29udHJvbGxlcnMvTWFwRWRpdEN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9lZGl0b3IvaW5kZXguanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9lZGl0b3Ivc2VydmljZXMvTWFwRWRpdG9yU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9idWlsZGVyL2NvbnRyb2xsZXJzL01hcEN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9tYXBfYnVpbGRlci9pbmRleC5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9idWlsZGVyL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvbWFwX2J1aWxkZXIvc2VydmljZXMvSW5mb1dpbmRvd1NlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9tYXBfYnVpbGRlci9zZXJ2aWNlcy9NYXBCdWlsZGVyU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9jYWxjdWxhdGlvbi9pbmRleC5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9jYWxjdWxhdGlvbi9zZXJ2aWNlcy9CaWN5Y2xlUm91dGVTZXJ2aWNlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvbWFwX2NhbGN1bGF0aW9uL3NlcnZpY2VzL01hcFBhcnRpdGlvblNlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2NsYXNzZXMvQ29vcmQuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2NvbnRyb2xsZXJzL0FwcEN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2RpcmVjdGl2ZXMvZmxhc2guanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2RpcmVjdGl2ZXMvbWF0Y2guanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2luZGV4LmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvbWlzYy9zZXJ2aWNlcy9NYXBDb25zdGFudHMuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9wcm9maWxlL2NvbnRyb2xsZXJzL1Byb2ZpbGVDdHJsLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvcHJvZmlsZS9pbmRleC5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL3Byb2ZpbGUvc2VydmljZXMvVXNlclNlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9jb250cm9sbGVycy9Mb2dpbkN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9jb250cm9sbGVycy9SZWdpc3RyYXRpb25DdHJsLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VjdXJpdHkvaW5kZXguanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9zZXJ2aWNlcy9Mb2dpblNlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9zZXJ2aWNlcy9TZWN1cml0eUludGVyY2VwdG9yLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VjdXJpdHkvc2VydmljZXMvU2VjdXJpdHlSZXRyeVF1ZXVlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VydmljZXMvRGF0YVByb3ZpZGVyU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL3NlcnZpY2VzL0xvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL3NlcnZpY2VzL2luZGV4LmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VydmljZXMvc2VjdXJpdHkvRm9ybUhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBjbGFzc2VzTW9kdWxlLCBjb250cm9sbGVyc01vZHVsZSwgZGlyZWN0aXZlc01vZHVsZSwgc2VydmljZXNNb2R1bGU7XG5cbnNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJzZXJ2aWNlc1wiLCBbXSk7XG5cbmNsYXNzZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImNsYXNzZXNcIiwgW10pO1xuXG5kaXJlY3RpdmVzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJkaXJlY3RpdmVzXCIsIFtdKTtcblxuY29udHJvbGxlcnNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImNvbnRyb2xsZXJzXCIsIFtcInNlcnZpY2VzXCIsIFwiZGlyZWN0aXZlc1wiXSk7XG5cbnJlcXVpcmUoJy4vc2VydmljZXMnKTtcblxucmVxdWlyZSgnLi9kYW8nKTtcblxucmVxdWlyZSgnLi9lZGl0b3InKTtcblxucmVxdWlyZSgnLi9tYXBfYnVpbGRlcicpO1xuXG5yZXF1aXJlKCcuL21hcF9jYWxjdWxhdGlvbicpO1xuXG5yZXF1aXJlKCcuL21pc2MnKTtcblxucmVxdWlyZSgnLi9wcm9maWxlJyk7XG5cbnJlcXVpcmUoJy4vc2VjdXJpdHknKTtcblxuc2VydmljZXNNb2R1bGUuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgcmV0dXJuICRodHRwUHJvdmlkZXIucmVzcG9uc2VJbnRlcmNlcHRvcnMucHVzaCgnU2VjdXJpdHlJbnRlcmNlcHRvcicpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzdGFydGVyJywgWydpb25pYycsICdjb250cm9sbGVycycsICdzZXJ2aWNlcycsICdjbGFzc2VzJywgJ2RpcmVjdGl2ZXMnLCAndWkuZ3JhdmF0YXInXSkucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIExvZ2luU2VydmljZSkge1xuICByZXR1cm4gJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCh3aW5kb3cuY29yZG92YSAhPSBudWxsKSAmJiAod2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCAhPSBudWxsKSkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQ7IFxuICAgIH1cbiAgfSk7XG59KS5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWFwJywge1xuICAgIHVybDogXCIvbWFwXCIsXG4gICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWFwRWRpdC5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnTWFwRWRpdEN0cmwnXG4gIH0pLnN0YXRlKCdwcm9maWxlJywge1xuICAgIHVybDogXCIvcHJvZmlsZVwiLFxuICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Byb2ZpbGUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhdXRoOiBmdW5jdGlvbigkcSwgJGluamVjdG9yLCBMb2dpblNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5nZXRTaWduZWRJblVzZXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKCdsb2dpblRlbXAnLCB7XG4gICAgdXJsOiBcIi9sb2dpblRlbXBcIixcbiAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICB9KTtcbiAgcmV0dXJuICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9tYXAnKTtcbn0pO1xuIiwidmFyIG1vZHVsZTtcblxubW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJzZXJ2aWNlc1wiKTtcblxubW9kdWxlLmZhY3RvcnkoJ0JpY3ljbGVSb3V0ZURhb1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZURhb1NlcnZpY2UnKSk7XG5cbm1vZHVsZS5mYWN0b3J5KCdWb3RlRGFvU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvVm90ZURhb1NlcnZpY2UnKSk7XG4iLCJ2YXIgQmljeWNsZVJvdXRlRGFvU2VydmljZTtcblxuQmljeWNsZVJvdXRlRGFvU2VydmljZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmFjdG9yeU9iajtcbiAgZmFjdG9yeU9iaiA9IHtcbiAgICBzYXZlUG9pbnRzOiBmdW5jdGlvbihub2Rlcykge1xuICAgICAgdmFyIG5vZGUsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG5vZGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2goTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLnVwZGF0ZU5vZGUobm9kZS5faWQsIHtcbiAgICAgICAgICBsYXQ6IG5vZGUubGF0LFxuICAgICAgICAgIGxvbjogbm9kZS5sb25cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0sXG4gICAgYWRkUG9pbnRzOiBmdW5jdGlvbihub2Rlcykge1xuICAgICAgdmFyIG5vZGUsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG5vZGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2goTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmFkZE5vZGUoe1xuICAgICAgICAgIHVzZXI6IG5vZGUudXNlcixcbiAgICAgICAgICBsYXQ6IG5vZGUubGF0LFxuICAgICAgICAgIGxvbjogbm9kZS5sb25cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGZhY3RvcnlPYmo7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpY3ljbGVSb3V0ZURhb1NlcnZpY2U7XG4iLCJ2YXIgVm90ZURhb1NlcnZpY2U7XG5cblZvdGVEYW9TZXJ2aWNlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmYWN0b3J5T2JqO1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGdldFVzZXJWb3RlVG9Qb2ludDogZnVuY3Rpb24odXNlck5hbWUsIG5vZGVJZCkge1xuICAgICAgdmFyIGRlZmVycmVkLCBodHRwUHJvbWlzZTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIGh0dHBQcm9taXNlID0gJGh0dHAuZ2V0KFwiL3ZvdGUvXCIgKyB1c2VyTmFtZSArIFwiL1wiICsgbm9kZUlkKTtcbiAgICAgIGh0dHBQcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBpZiAocmVzcC5kYXRhLnRoZW4gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiByZXNwLmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgdXNlcjogdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZUlkLFxuICAgICAgICAgICAgICAgIHZvdGU6IDFcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgZ2V0QWxsVm90ZXNUb05vZGU6IGZ1bmN0aW9uKG5vZGVJZCkge1xuICAgICAgdmFyIGRlZmVycmVkLCBodHRwUHJvbWlzZTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIGh0dHBQcm9taXNlID0gJGh0dHAuZ2V0KFwiL3ZvdGUvXCIgKyBub2RlSWQpO1xuICAgICAgaHR0cFByb21pc2UudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGlmIChyZXNwLmRhdGEudGhlbiAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3AuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBub2RlSWQ6IG5vZGVJZCxcbiAgICAgICAgICAgICAgICBwb3M6IDAsXG4gICAgICAgICAgICAgICAgbmVnOiAwXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHNlbmRVc2VyVm90ZUZvck5vZGU6IGZ1bmN0aW9uKHVzZXJOYW1lLCBub2RlSWQsIHZvdGUpIHtcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KFwiL3ZvdGUvbmV3XCIsIHtcbiAgICAgICAgdXNlcjogdXNlck5hbWUsXG4gICAgICAgIG5vZGVJZDogbm9kZUlkLFxuICAgICAgICB2b3RlOiB2b3RlXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWb3RlRGFvU2VydmljZTtcbiIsInZhciBNYXBFZGl0Q3RybDtcblxuTWFwRWRpdEN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkdGltZW91dCwgTWFwRWRpdG9yU2VydmljZSwgQmljeWNsZVJvdXRlU2VydmljZSwgQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UsIERhdGFQcm92aWRlclNlcnZpY2UsIEJpY3ljbGVSb3V0ZURhb1NlcnZpY2UsIE1hcEJ1aWxkZXJTZXJ2aWNlLCBWb3RlRGFvU2VydmljZSwgTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLCBDb29yZCwgTG9naW5TZXJ2aWNlLCBNYXBDb25zdGFudHMpIHtcbiAgdmFyIGNhbkxvYWRNYXBBZ2FpbiwgY2xlYXJBcnJheSwgY29weUVkaXRlZE1hcmtlcnMsIGVkaXRlZE1hcmtlcnMsIG1hcmtlcnMsIG5ld05vZGVDb3VudGVyLCBwb2x5bGluZXMsIHJvdXRlUG9seWxpbmU7XG4gIHJvdXRlUG9seWxpbmUgPSB2b2lkIDA7XG4gIGNhbkxvYWRNYXBBZ2FpbiA9IHRydWU7XG4gIG5ld05vZGVDb3VudGVyID0gLTE7XG4gIGVkaXRlZE1hcmtlcnMgPSBbXTtcbiAgbWFya2VycyA9IFtdO1xuICBwb2x5bGluZXMgPSBbXTtcbiAgY2xlYXJBcnJheSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIG9iaiwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBhcnJheS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgb2JqID0gYXJyYXlbX2ldO1xuICAgICAgX3Jlc3VsdHMucHVzaChvYmouc2V0TWFwKG51bGwpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9O1xuICBjb3B5RWRpdGVkTWFya2VycyA9IGZ1bmN0aW9uKGZyb21BcnJheSwgdG9Bc3NvY0FycmF5KSB7XG4gICAgdmFyIG9iaiwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBmcm9tQXJyYXkubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIG9iaiA9IGZyb21BcnJheVtfaV07XG4gICAgICBpZiAob2JqLm5vZGVJbmZvLmNoYW5nZWQpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh0b0Fzc29jQXJyYXlbb2JqLm5vZGVJbmZvLl9pZF0gPSBvYmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG4gICRzY29wZS5yb3V0ZUluZm8gPSB2b2lkIDA7XG4gICRzY29wZS5tYXAgPSB2b2lkIDA7XG4gICRzY29wZS5pc1RoZXJlRWRpdGVkTm9kZSA9IGZhbHNlO1xuICAkc2NvcGUuaW5mb1dpbmRvdyA9IHtcbiAgICBpc0Rpc3BsYXllZDogZmFsc2VcbiAgfTtcbiAgJHNjb3BlLmxvYWRSb3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZHMsIG1hcElkcywgbWFwWm9vbSwgbmUsIHJvdXRlSW5mb1Byb21pc2UsIHN3O1xuICAgIGJvdW5kcyA9ICRzY29wZS5tYXAuZ2V0Qm91bmRzKCk7XG4gICAgbmUgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCk7XG4gICAgc3cgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XG4gICAgbWFwWm9vbSA9IE1hcEVkaXRvclNlcnZpY2UuY2FsY3VsYXRlWm9vbShuZXcgQ29vcmQoc3cubG5nKCksIG5lLmxhdCgpKSwgbmV3IENvb3JkKG5lLmxuZygpLCBzdy5sYXQoKSkpO1xuICAgIG1hcElkcyA9IE1hcEVkaXRvclNlcnZpY2UuZ2V0TWFwc0ZvckFyZWFBdFpvb20obmV3IENvb3JkKHN3LmxuZygpLCBuZS5sYXQoKSksIG5ldyBDb29yZChuZS5sbmcoKSwgc3cubGF0KCkpLCBtYXBab29tIC0gMSk7XG4gICAgcm91dGVJbmZvUHJvbWlzZSA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5sb2FkUm91dGVJbmZvKCk7XG4gICAgcmV0dXJuIHJvdXRlSW5mb1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcm91dGU7XG4gICAgICByb3V0ZSA9IEJpY3ljbGVSb3V0ZVNlcnZpY2UuY3JlYXRlUm91dGVGcm9tTm9kZXMoZGF0YSwgMSwgWzBdKTtcbiAgICAgIHJvdXRlUG9seWxpbmUuc2V0TWFwKG51bGwpO1xuICAgICAgcm91dGVQb2x5bGluZSA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlKHJvdXRlKTtcbiAgICAgIHJldHVybiByb3V0ZVBvbHlsaW5lLnNldE1hcCgkc2NvcGUubWFwKTtcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmxvYWRSb3V0ZUluZm8gPSBmdW5jdGlvbigpIHt9O1xuICAkc2NvcGUuaXNFZGl0ID0gdHJ1ZTtcbiAgJHNjb3BlLmluaXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm91dGVJbmZvUHJvbWlzZTtcbiAgICB3aW5kb3cucm91dGVJbmZvID0gJHNjb3BlLnJvdXRlSW5mbztcbiAgICByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKTtcbiAgICByb3V0ZUluZm9Qcm9taXNlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGNlbnRlckNvb3JkaW5hdGVzO1xuICAgICAgJHNjb3BlLnJvdXRlSW5mbyA9IGRhdGE7XG4gICAgICBCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZS5jcmVhdGVDb29yZGluYXRlKGRhdGFbMF0ubGF0LCBkYXRhWzBdLmxvbik7XG4gICAgICBjZW50ZXJDb29yZGluYXRlcyA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZUNvb3JkaW5hdGUoZGF0YVswXS5sYXQsIGRhdGFbMF0ubG9uKTtcbiAgICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250YWluZXItbWFwLWVkaXQnKS5xdWVyeVNlbGVjdG9yKCcjZ29vZ2xlTWFwJyksIE1hcEJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZU1hcFByb3BlcnRpZXMoY2VudGVyQ29vcmRpbmF0ZXMsIDEzKSk7XG4gICAgICBwb2x5bGluZXMucHVzaChCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZS5jcmVhdGVQb2x5bGluZUZyb21Sb3V0ZShkYXRhLCAkc2NvcGUubWFwKSk7XG4gICAgICByZXR1cm4gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoJHNjb3BlLm1hcCwgJ3pvb21fY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmxvYWRSb3V0ZUluZm8oKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBjb25zb2xlLmxvZyhcIm9rZVwiKTtcbiAgfTtcbiAgJHNjb3BlLnNhdmVQb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWRkTm9kZXMsIGssIHVwZGF0ZU5vZGVzLCB2O1xuICAgIHVwZGF0ZU5vZGVzID0gW107XG4gICAgYWRkTm9kZXMgPSBbXTtcbiAgICBjb3B5RWRpdGVkTWFya2VycyhtYXJrZXJzLCBlZGl0ZWRNYXJrZXJzKTtcbiAgICBmb3IgKGsgaW4gZWRpdGVkTWFya2Vycykge1xuICAgICAgdiA9IGVkaXRlZE1hcmtlcnNba107XG4gICAgICBpZiAodi5ub2RlSW5mby5faWQgPCAwKSB7XG4gICAgICAgIGFkZE5vZGVzLnB1c2godi5ub2RlSW5mbyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGVOb2Rlcy5wdXNoKHYubm9kZUluZm8pO1xuICAgICAgfVxuICAgIH1cbiAgICBCaWN5Y2xlUm91dGVEYW9TZXJ2aWNlLnNhdmVQb2ludHModXBkYXRlTm9kZXMpO1xuICAgIEJpY3ljbGVSb3V0ZURhb1NlcnZpY2UuYWRkUG9pbnRzKGFkZE5vZGVzKTtcbiAgICByZXR1cm4gJHNjb3BlLmlzVGhlcmVFZGl0ZWROb2RlID0gZmFsc2U7XG4gIH07XG4gICRzY29wZS5hZGRQb2ludCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXJrZXI7XG4gICAgbWFya2VyID0gQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UuYWRkTmV3UG9pbnRUb0NlbnRlck9mTWFwKCRzY29wZS5tYXAsICRzY29wZSk7XG4gICAgbWFya2VyLm5vZGVJbmZvLl9pZCA9IG5ld05vZGVDb3VudGVyO1xuICAgICRzY29wZS5pc1RoZXJlRWRpdGVkTm9kZSA9IHRydWU7XG4gICAgbmV3Tm9kZUNvdW50ZXItLTtcbiAgICBlZGl0ZWRNYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICByZXR1cm4gbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gIH07XG4gICRzY29wZS5pbmZvQm94ZXMgPSBbXTtcbiAgJHNjb3BlLnZvdGUgPSB7XG4gICAgdmFsdWU6IDEsXG4gICAgaXNSZXNldDogdHJ1ZVxuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd2b3RlLmlzUmVzZXQnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICByZXR1cm4gY29uc29sZS5sb2coXCJyZXNldCB3YXRjaDogXCIgKyBuZXdWYWx1ZSk7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLiR3YXRjaCgndm90ZS52YWx1ZScsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgIHZhciBub2RlSWQsIHVzZXI7XG4gICAgY29uc29sZS5sb2coXCJyZXNldDogXCIgKyAkc2NvcGUudm90ZS5pc1Jlc2V0KTtcbiAgICBuZXdWYWx1ZSA9IHBhcnNlSW50KG5ld1ZhbHVlKTtcbiAgICBvbGRWYWx1ZSA9IHBhcnNlSW50KG9sZFZhbHVlKTtcbiAgICBpZiAoISRzY29wZS52b3RlLmlzUmVzZXQgJiYgbmV3VmFsdWUgIT09IG9sZFZhbHVlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInNlbmQ6IFwiICsgb2xkVmFsdWUgKyBcIixcIiArIG5ld1ZhbHVlICsgXCIsIFwiICsgJHNjb3BlLnZvdGUuaXNSZXNldCk7XG4gICAgICB1c2VyID0gTG9naW5TZXJ2aWNlLmdldFVzZXJOYW1lKCk7XG4gICAgICBub2RlSWQgPSAkc2NvcGUuYWN0Tm9kZS5faWQ7XG4gICAgICBWb3RlRGFvU2VydmljZS5zZW5kVXNlclZvdGVGb3JOb2RlKHVzZXIsIG5vZGVJZCwgbmV3VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gJHNjb3BlLnZvdGUuaXNSZXNldCA9IGZhbHNlO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwRWRpdEN0cmw7XG4iLCJ2YXIgY29udHJvbGxlcnNNb2R1bGUsIHNlcnZpY2VzTW9kdWxlO1xuXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIik7XG5cbmNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJjb250cm9sbGVyc1wiKTtcblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnTWFwRWRpdG9yU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvTWFwRWRpdG9yU2VydmljZScpKTtcblxuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignTWFwRWRpdEN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL01hcEVkaXRDdHJsJykpO1xuIiwidmFyIE1hcEVkaXRvclNlcnZpY2U7XG5cbk1hcEVkaXRvclNlcnZpY2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZhY3RvcnlPYmo7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgY3JlYXRlQXNzb2NBcnJheUZyb21DaGFuZ2VkTWFya2VyczogZnVuY3Rpb24obWFya2Vycykge1xuICAgICAgdmFyIGFzc29jLCBtYXJrZXIsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIGFzc29jID0gW107XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBtYXJrZXJzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG1hcmtlciA9IG1hcmtlcnNbX2ldO1xuICAgICAgICBpZiAobWFya2VyLm5vZGVJbmZvLmNoYW5nZWQpIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKGFzc29jW21hcmtlci5ub2RlSW5mby5faWRdID0gbWFya2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBFZGl0b3JTZXJ2aWNlO1xuIiwidmFyIE1hcEN0cmw7XG5cbk1hcEN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkdGltZW91dCwgTWFwU2VydmljZSwgRGF0YVByb3ZpZGVyU2VydmljZSwgTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLCBDb29yZCkge1xuICB2YXIgY2FuTG9hZE1hcEFnYWluLCByb3V0ZVBvbHlsaW5lO1xuICByb3V0ZVBvbHlsaW5lID0gdm9pZCAwO1xuICBjYW5Mb2FkTWFwQWdhaW4gPSB0cnVlO1xuICAkc2NvcGUucm91dGVJbmZvID0gdm9pZCAwO1xuICAkc2NvcGUubWFwID0gdm9pZCAwO1xuICAkc2NvcGUubG9hZFJvdXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvdW5kcywgbWFwSWRzLCBtYXBab29tLCBuZSwgcm91dGVJbmZvUHJvbWlzZSwgc3c7XG4gICAgYm91bmRzID0gJHNjb3BlLm1hcC5nZXRCb3VuZHMoKTtcbiAgICBuZSA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKTtcbiAgICBzdyA9IGJvdW5kcy5nZXRTb3V0aFdlc3QoKTtcbiAgICBtYXBab29tID0gTWFwU2VydmljZS5jYWxjdWxhdGVab29tKG5ldyBDb29yZChzdy5sbmcoKSwgbmUubGF0KCkpLCBuZXcgQ29vcmQobmUubG5nKCksIHN3LmxhdCgpKSk7XG4gICAgbWFwSWRzID0gTWFwU2VydmljZS5nZXRNYXBzRm9yQXJlYUF0Wm9vbShuZXcgQ29vcmQoc3cubG5nKCksIG5lLmxhdCgpKSwgbmV3IENvb3JkKG5lLmxuZygpLCBzdy5sYXQoKSksIG1hcFpvb20gLSAxKTtcbiAgICByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKTtcbiAgICByZXR1cm4gcm91dGVJbmZvUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciByb3V0ZTtcbiAgICAgIHJvdXRlID0gTWFwU2VydmljZS5jcmVhdGVSb3V0ZUZyb21Ob2RlQXJyYXkoZGF0YSwgMSwgWzBdKTtcbiAgICAgIHJvdXRlUG9seWxpbmUuc2V0TWFwKG51bGwpO1xuICAgICAgcm91dGVQb2x5bGluZSA9IE1hcFNlcnZpY2UuY3JlYXRlUG9seWxpbmVGcm9tUm91dGUocm91dGUpO1xuICAgICAgcmV0dXJuIHJvdXRlUG9seWxpbmUuc2V0TWFwKCRzY29wZS5tYXApO1xuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuaW5pdE1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByb3V0ZUluZm9Qcm9taXNlO1xuICAgIHJvdXRlSW5mb1Byb21pc2UgPSBMb2NhbERhdGFQcm92aWRlclNlcnZpY2UubG9hZFJvdXRlSW5mbygpO1xuICAgIHJldHVybiByb3V0ZUluZm9Qcm9taXNlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGNlbnRlckNvb3JkaW5hdGVzLCByb3V0ZTtcbiAgICAgICRzY29wZS5yb3V0ZUluZm8gPSBkYXRhO1xuICAgICAgY2VudGVyQ29vcmRpbmF0ZXMgPSBNYXBTZXJ2aWNlLmNyZWF0ZUNvb3JkaW5hdGUoZGF0YVswXS5sYXQsIGRhdGFbMF0ubG9uKTtcbiAgICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2aWV3LW1hcCcpLnF1ZXJ5U2VsZWN0b3IoJyNnb29nbGVNYXAnKSwgTWFwU2VydmljZS5jcmVhdGVNYXBQcm9wZXJ0aWVzKGNlbnRlckNvb3JkaW5hdGVzLCAzKSk7XG4gICAgICAkc2NvcGUubWFwLmdldEJvdW5kcygpO1xuICAgICAgcm91dGUgPSBNYXBTZXJ2aWNlLmNyZWF0ZVJvdXRlRnJvbU5vZGVBcnJheShkYXRhLCAxLCBbMF0pO1xuICAgICAgcm91dGVQb2x5bGluZSA9IE1hcFNlcnZpY2UuY3JlYXRlUG9seWxpbmVGcm9tUm91dGUocm91dGUpO1xuICAgICAgcm91dGVQb2x5bGluZS5zZXRNYXAoJHNjb3BlLm1hcCk7XG4gICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcigkc2NvcGUubWFwLCAnem9vbV9jaGFuZ2VkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoJHNjb3BlLm1hcCwgXCJib3VuZHNfY2hhbmdlZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrO1xuICAgICAgICBpZiAoY2FuTG9hZE1hcEFnYWluKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRSb3V0ZSgpO1xuICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FuTG9hZE1hcEFnYWluID0gdHJ1ZTtcbiAgICAgICAgICB9O1xuICAgICAgICAgICR0aW1lb3V0KGNhbGxiYWNrLCA1MDAwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuTG9hZE1hcEFnYWluID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS5pbmZvQm94ZXMgPSBbXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RybDtcbiIsInZhciBjb250cm9sbGVyc01vZHVsZSwgc2VydmljZXNNb2R1bGU7XG5cbnNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJzZXJ2aWNlc1wiKTtcblxuY29udHJvbGxlcnNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImNvbnRyb2xsZXJzXCIpO1xuXG5jb250cm9sbGVyc01vZHVsZS5jb250cm9sbGVyKCdNYXBDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9NYXBDdHJsJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UnKSk7XG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ0luZm9XaW5kb3dTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9JbmZvV2luZG93U2VydmljZScpKTtcblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnTWFwQnVpbGRlclNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL01hcEJ1aWxkZXJTZXJ2aWNlJykpO1xuIiwidmFyIEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlO1xuXG5CaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZSA9IGZ1bmN0aW9uKEluZm9XaW5kb3dTZXJ2aWNlKSB7XG4gIHZhciBhZGRDbGlja0V2ZW50VG9NYXJrZXIsIGFkZERyYWdlbmRFdmVudFRvTWFya2VyLCBmYWN0b3J5T2JqO1xuICBhZGRDbGlja0V2ZW50VG9NYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIsIHNjb3BlLCBub2RlLCBjb250ZW50LCBnb29nbGVNYXApIHtcbiAgICByZXR1cm4gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhbGxWb3Rlc1Byb21pc2UsIG5vZGVJZCwgdXNlclZvdGVQcm9taXNlO1xuICAgICAgbm9kZUlkID0gcGFyc2VJbnQobm9kZS5faWQpO1xuICAgICAgdXNlclZvdGVQcm9taXNlID0gZmFjdG9yeU9iai5nZXRVc2VyVm90ZVRvUG9pbnQoTG9naW5TZXJ2aWNlLmdldFVzZXJOYW1lKCksIG5vZGVJZCk7XG4gICAgICBhbGxWb3Rlc1Byb21pc2UgPSBmYWN0b3J5T2JqLmdldEFsbFZvdGVzVG9Ob2RlKG5vZGVJZCk7XG4gICAgICBzY29wZS5hY3ROb2RlID0gbm9kZTtcbiAgICAgIGFsbFZvdGVzUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2NvcGUuYWN0Tm9kZS52b3RlX3BvcyA9IGRhdGEucG9zO1xuICAgICAgICByZXR1cm4gc2NvcGUuYWN0Tm9kZS52b3RlX25lZyA9IGRhdGEubmVnO1xuICAgICAgfSk7XG4gICAgICB1c2VyVm90ZVByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBzY29wZS52b3RlLnZhbHVlID0gZGF0YS52b3RlO1xuICAgICAgfSk7XG4gICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgIEluZm9XaW5kb3dTZXJ2aWNlLmdldEluZm9XaW5kb3coKS5zZXRDb250ZW50KGNvbnRlbnQpO1xuICAgICAgcmV0dXJuIEluZm9XaW5kb3dTZXJ2aWNlLmdldEluZm9XaW5kb3coKS5vcGVuKGdvb2dsZU1hcCwgbWFya2VyKTtcbiAgICB9KTtcbiAgfTtcbiAgYWRkRHJhZ2VuZEV2ZW50VG9NYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIsIHNjb3BlKSB7XG4gICAgcmV0dXJuIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgbWFya2VyLm5vZGVJbmZvLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgbWFya2VyLm5vZGVJbmZvLmxhdCA9IGV2ZW50LmxhdExuZy5rO1xuICAgICAgbWFya2VyLm5vZGVJbmZvLmxvbiA9IGV2ZW50LmxhdExuZy5CO1xuICAgICAgcmV0dXJuIHNjb3BlLmlzVGhlcmVFZGl0ZWROb2RlID0gdHJ1ZTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIGZhY3RvcnlPYmogPSB7XG4gICAgY3JlYXRlUG9seWxpbmVGcm9tUm91dGU6IGZ1bmN0aW9uKHJvdXRlLCBnb29nbGVNYXApIHtcbiAgICAgIHZhciBjb29yZGluYXRlcywgbm9kZSwgcm91dGVQb2x5bGluZSwgX2ksIF9sZW47XG4gICAgICBjb29yZGluYXRlcyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSByb3V0ZS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBub2RlID0gcm91dGVbX2ldO1xuICAgICAgICBjb29yZGluYXRlcy5wdXNoKG5ldyBnb29nbGUubWFwcy5MYXRMbmcobm9kZS5sYXQsIG5vZGUubG9uKSk7XG4gICAgICB9XG4gICAgICByb3V0ZVBvbHlsaW5lID0gbmV3IGdvb2dsZS5tYXBzLlBvbHlsaW5lKHtcbiAgICAgICAgcGF0aDogY29vcmRpbmF0ZXMsXG4gICAgICAgIGdlb2Rlc2ljOiB0cnVlLFxuICAgICAgICBzdHJva2VDb2xvcjogJyNGRjAwMDAnLFxuICAgICAgICBzdHJva2VPcGFjaXR5OiAxLjAsXG4gICAgICAgIHN0cm9rZVdlaWdodDogMixcbiAgICAgICAgbWFwOiBnb29nbGVNYXBcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJvdXRlUG9seWxpbmU7XG4gICAgfSxcbiAgICBjcmVhdGVNYXJrZXJzRnJvbVJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgZ29vZ2xlTWFwLCBzY29wZSkge1xuICAgICAgdmFyIGNvbXBpbGVkLCBpbmRleCwgbWFya2VyLCBtYXJrZXJPcHRpb25zLCBtYXJrZXJzLCBub2RlLCBfaSwgX2xlbjtcbiAgICAgIG1hcmtlcnMgPSBbXTtcbiAgICAgIGNvbXBpbGVkID0gJGNvbXBpbGUoaW5mb1dpbmRvd0NvbnRlbnQpKHNjb3BlKTtcbiAgICAgIHNjb3BlLm1hcmtlcnMgPSBtYXJrZXJzO1xuICAgICAgZm9yIChpbmRleCA9IF9pID0gMCwgX2xlbiA9IHJvdXRlLmxlbmd0aDsgX2kgPCBfbGVuOyBpbmRleCA9ICsrX2kpIHtcbiAgICAgICAgbm9kZSA9IHJvdXRlW2luZGV4XTtcbiAgICAgICAgbWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICBtYXA6IGdvb2dsZU1hcCxcbiAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCxcbiAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhub2RlLmxhdCwgbm9kZS5sb24pXG4gICAgICAgIH07XG4gICAgICAgIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG4gICAgICAgIG1hcmtlci5ub2RlSW5mbyA9IG5vZGU7XG4gICAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICBhZGRDbGlja0V2ZW50VG9NYXJrZXIobWFya2VyLCBzY29wZSwgbm9kZSwgY29tcGlsZWRbMF0sIGdvb2dsZU1hcCk7XG4gICAgICAgIGFkZERyYWdlbmRFdmVudFRvTWFya2VyKG1hcmtlciwgc2NvcGUpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cobWFya2Vycyk7XG4gICAgICByZXR1cm4gbWFya2VycztcbiAgICB9LFxuICAgIGFkZE5ld1BvaW50VG9DZW50ZXJPZk1hcDogZnVuY3Rpb24oZ29vZ2xlTWFwLCBzY29wZSkge1xuICAgICAgdmFyIGNvbXBpbGVkLCBtYXJrZXIsIG1hcmtlck9wdGlvbnM7XG4gICAgICBjb21waWxlZCA9ICRjb21waWxlKGluZm9XaW5kb3dDb250ZW50KShzY29wZSk7XG4gICAgICBtYXJrZXJPcHRpb25zID0ge1xuICAgICAgICBtYXA6IGdvb2dsZU1hcCxcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QLFxuICAgICAgICBwb3NpdGlvbjogZ29vZ2xlTWFwLmdldENlbnRlcigpXG4gICAgICB9O1xuICAgICAgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihtYXJrZXJPcHRpb25zKTtcbiAgICAgIG1hcmtlci5ub2RlSW5mbyA9IHtcbiAgICAgICAgdXNlcjogTG9naW5TZXJ2aWNlLmdldFVzZXJOYW1lKCksXG4gICAgICAgIHZvdGVfcG9zOiAwLFxuICAgICAgICB2b3RlX25lZzogMCxcbiAgICAgICAgY2hhbmdlZDogdHJ1ZSxcbiAgICAgICAgbGF0OiBnb29nbGVNYXAuZ2V0Q2VudGVyKCkuayxcbiAgICAgICAgbG9uOiBnb29nbGVNYXAuZ2V0Q2VudGVyKCkuQixcbiAgICAgICAgX2lkOiAtMVxuICAgICAgfTtcbiAgICAgIGFkZENsaWNrRXZlbnRUb01hcmtlcihtYXJrZXIsIHNjb3BlLCBtYXJrZXIubm9kZUluZm8sIGNvbXBpbGVkWzBdLCBnb29nbGVNYXApO1xuICAgICAgYWRkRHJhZ2VuZEV2ZW50VG9NYXJrZXIobWFya2VyLCBzY29wZSk7XG4gICAgICByZXR1cm4gbWFya2VyO1xuICAgIH0sXG4gICAgY3JlYXRlQ29vcmRpbmF0ZTogZnVuY3Rpb24obGF0LCBsb24pIHtcbiAgICAgIHJldHVybiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG9uKTtcbiAgICB9LFxuICAgIGFkZENsaWNrRXZlbnRUb01hcmtlcjogZnVuY3Rpb24obWFya2VyLCBzY29wZSwgbm9kZSwgY29udGVudCwgZ29vZ2xlTWFwKSB7XG4gICAgICByZXR1cm4gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFsbFZvdGVzUHJvbWlzZSwgbm9kZUlkLCB1c2VyVm90ZVByb21pc2U7XG4gICAgICAgIG5vZGVJZCA9IHBhcnNlSW50KG5vZGUuX2lkKTtcbiAgICAgICAgdXNlclZvdGVQcm9taXNlID0gZmFjdG9yeU9iai5nZXRVc2VyVm90ZVRvUG9pbnQoTG9naW5TZXJ2aWNlLmdldFVzZXJOYW1lKCksIG5vZGVJZCk7XG4gICAgICAgIGFsbFZvdGVzUHJvbWlzZSA9IGZhY3RvcnlPYmouZ2V0QWxsVm90ZXNUb05vZGUobm9kZUlkKTtcbiAgICAgICAgc2NvcGUuYWN0Tm9kZSA9IG5vZGU7XG4gICAgICAgIGFsbFZvdGVzUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzY29wZS5hY3ROb2RlLnZvdGVfcG9zID0gZGF0YS5wb3M7XG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmFjdE5vZGUudm90ZV9uZWcgPSBkYXRhLm5lZztcbiAgICAgICAgfSk7XG4gICAgICAgIHVzZXJWb3RlUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gc2NvcGUudm90ZS52YWx1ZSA9IGRhdGEudm90ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICBJbmZvV2luZG93U2VydmljZS5nZXRJbmZvV2luZG93KCkuc2V0Q29udGVudChjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIEluZm9XaW5kb3dTZXJ2aWNlLmdldEluZm9XaW5kb3coKS5vcGVuKGdvb2dsZU1hcCwgbWFya2VyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2U7XG4iLCJ2YXIgSW5mb1dpbmRvd1NlcnZpY2UsIGZhY3RvcnlPYmo7XG5cbkluZm9XaW5kb3dTZXJ2aWNlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbmZvV2luZG93Q29udGVudCwgaW5mb3dpbmRvdztcbiAgaW5mb1dpbmRvd0NvbnRlbnQgPSAnPGRpdj5cXG4gIDxkaXYgY2xhc3M9XCJsaXN0XCI+XFxuICAgICAgPGRpdiBjbGFzcz1cIml0ZW0gaXRlbS1kaXZpZGVyXCI+XFxuICAgICAgICBCYXNpYyBpbmZvXFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cIml0ZW1cIj4gXFxuICAgICAgICBVc2VyOiB7e2FjdE5vZGUudXNlcn19PGJyLz5cXG4gICAgICAgIElkOiB7e2FjdE5vZGUubGF0fX1cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaXRlbSBpdGVtLWRpdmlkZXJcIj5cXG4gICAgICAgIEhvdyBhY2N1cmF0ZSB0aGlzIHBvaW50IGlzP1xcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XCJpdGVtIHJhbmdlIHJhbmdlLWVuZXJnaXplZFwiPiBcXG4gICAgICAgIDxkaXY+IFxcbiAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIG5hbWU9XCJ2b2x1bWVcIiBtaW49XCIwXCIgbWF4PVwiMlwiIHZhbHVlPVwiMVwiIG5nLW1vZGVsPVwidm90ZS52YWx1ZVwiPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8ZGl2PlxcbiAgICAgICAgICA8aSBjbGFzcz1cImljb24gaW9uLWhhcHB5XCI+Jm5ic3A7e3thY3ROb2RlLnZvdGVfcG9zfX08L2k+XFxuICAgICAgICAgIDxpIGNsYXNzPVwiaWNvbiBpb24tc2FkXCI+Jm5ic3A7e3thY3ROb2RlLnZvdGVfbmVnfX08L2k+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2Plxcbic7XG4gIGluZm93aW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xuICByZXR1cm4gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoaW5mb3dpbmRvdywgJ2Nsb3NlY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gMTtcbiAgfSk7XG59O1xuXG5mYWN0b3J5T2JqID0ge1xuICBnZXRJbmZvV2luZG93OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaW5mb3dpbmRvdztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvV2luZG93U2VydmljZTtcbiIsInZhciBNYXBCdWlsZGVyU2VydmljZTtcblxuTWFwQnVpbGRlclNlcnZpY2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZhY3RvcnlPYmo7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgY3JlYXRlTWFwUHJvcGVydGllczogZnVuY3Rpb24oY2VudGVyUG9zaXRpb24sIHpvb20sIG1hcFR5cGVJZCkge1xuICAgICAgdmFyIG1hcFByb3A7XG4gICAgICBtYXBQcm9wID0ge1xuICAgICAgICBjZW50ZXI6IGNlbnRlclBvc2l0aW9uLFxuICAgICAgICB6b29tOiB6b29tLFxuICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5URVJSQUlOXG4gICAgICB9O1xuICAgICAgaWYgKG1hcFR5cGVJZCAhPSBudWxsKSB7XG4gICAgICAgIG1hcFByb3AubWFwVHlwZUlkID0gbWFwVHlwZUlkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hcFByb3A7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQnVpbGRlclNlcnZpY2U7XG4iLCJ2YXIgbW9kdWxlO1xuXG5tb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInNlcnZpY2VzXCIpO1xuXG5tb2R1bGUuZmFjdG9yeSgnQmljeWNsZVJvdXRlU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvQmljeWNsZVJvdXRlU2VydmljZScpKTtcblxubW9kdWxlLmZhY3RvcnkoJ01hcFBhcnRpdGlvblNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL01hcFBhcnRpdGlvblNlcnZpY2UnKSk7XG4iLCJ2YXIgQmljeWNsZVJvdXRlU2VydmljZSxcbiAgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbkJpY3ljbGVSb3V0ZVNlcnZpY2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNyZWF0ZVJvdXRlRnJvbVN0YXJ0Tm9kZSwgZmFjdG9yeU9iajtcbiAgKHtcbiAgICBnZXRTdGFydE5vZGVPZk1hcElkOiBmdW5jdGlvbihub2RlcywgbWFwSWQpIHtcbiAgICAgIHZhciBub2RlLCBfaSwgX2xlbjtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gbm9kZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbm9kZSA9IG5vZGVzW19pXTtcbiAgICAgICAgaWYgKF9faW5kZXhPZi5jYWxsKG5vZGUuc3RhcnROb2RlSW5NYXAsIG1hcElkKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG4gIGNyZWF0ZVJvdXRlRnJvbVN0YXJ0Tm9kZSA9IGZ1bmN0aW9uKHN0YXJ0Tm9kZSkge1xuICAgIHZhciBhY3ROb2RlLCByb3V0ZTtcbiAgICByb3V0ZSA9IFtdO1xuICAgIGFjdE5vZGUgPSBzdGFydE5vZGU7XG4gICAgd2hpbGUgKGFjdE5vZGUgIT09IHZvaWQgMCkge1xuICAgICAgcm91dGUucHVzaChhY3ROb2RlKTtcbiAgICAgIGlmIChhY3ROb2RlLndlaWdodCA8IHpvb20pIHtcbiAgICAgICAgYWN0Tm9kZSA9IG5vZGVBc3NvY01hcFthY3ROb2RlLnNpYmxpbmdzWzBdXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdE5vZGUgPSBub2RlQXNzb2NNYXBbYWN0Tm9kZS5zaWJsaW5nc1tNYXBDb25zdGFudHMubWF4X3pvb20gLSB6b29tXV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByb3V0ZTtcbiAgfTtcbiAgZmFjdG9yeU9iaiA9IHtcbiAgICBjcmVhdGVSb3V0ZUZyb21Ob2RlczogZnVuY3Rpb24ocm91dGVOb2Rlcywgem9vbSwgbWFwSWRzKSB7XG4gICAgICB2YXIgZmluYWxSb3V0ZSwgbWFwSWQsIG5vZGUsIHJvdXRlLCByb3V0ZU5vZGVzTWFwLCBzdGFydE5vZGUsIHN0YXJ0Tm9kZXMsIF9pLCBfaiwgX2ssIF9sZW4sIF9sZW4xLCBfbGVuMjtcbiAgICAgIGlmICh6b29tID4gTWFwQ29uc3RhbnRzLm1heF96b29tKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInpvb20gaXMgYmlnZ2VyIHRoYW4gdGhlIG1heGltdW0gKHVzZSBNYXBDb25zdGFudHMubWF4X3pvb20pXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHpvb20gPCAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInpvb20gaXMgc21hbGxlciB0aGFuIHRoZSBtaW5pbXVtICh1c2UgTWFwQ29uc3RhbnRzLm1pbl96b29tKVwiKTtcbiAgICAgIH1cbiAgICAgIHJvdXRlTm9kZXNNYXAgPSB7fTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gcm91dGVOb2Rlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBub2RlID0gcm91dGVOb2Rlc1tfaV07XG4gICAgICAgIHJvdXRlTm9kZXNNYXBbbm9kZS5faWRdID0gbm9kZTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0Tm9kZXMgPSBbXTtcbiAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IG1hcElkcy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgbWFwSWQgPSBtYXBJZHNbX2pdO1xuICAgICAgICBzdGFydE5vZGUgPSB0aGlzLmdldFN0YXJ0Tm9kZU9mTWFwSWQocm91dGVOb2RlcywgbWFwSWQpO1xuICAgICAgICBpZiAoc3RhcnROb2RlKSB7XG4gICAgICAgICAgc3RhcnROb2Rlcy5wdXNoKHN0YXJ0Tm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZpbmFsUm91dGUgPSBbXTtcbiAgICAgIGZvciAoX2sgPSAwLCBfbGVuMiA9IHN0YXJ0Tm9kZXMubGVuZ3RoOyBfayA8IF9sZW4yOyBfaysrKSB7XG4gICAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Tm9kZXNbX2tdO1xuICAgICAgICByb3V0ZSA9IGNyZWF0ZVJvdXRlRnJvbVN0YXJ0Tm9kZShzdGFydE5vZGUpO1xuICAgICAgICBpZiAocm91dGUubGVuZ3RoID4gZmluYWxSb3V0ZS5sZW5ndGgpIHtcbiAgICAgICAgICBmaW5hbFJvdXRlID0gcm91dGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmaW5hbFJvdXRlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGZhY3RvcnlPYmo7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpY3ljbGVSb3V0ZVNlcnZpY2U7XG4iLCJ2YXIgTWFwUGFydGl0aW9uU2VydmljZTtcblxuTWFwUGFydGl0aW9uU2VydmljZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmFjdG9yeU9iaiwgbWFwWm9vbURpYW1ldGVyU3F1YXJlcztcbiAgbWFwWm9vbURpYW1ldGVyU3F1YXJlcyA9IFs1ODI1LCAxNDU2LjI1LCAzNjQuMDYyNSwgOTEuMDE2LCAyMi43NTQsIDUuNjkxLCAxLjQyMiwgMC4zNTU3LCAwLjA4OTJdO1xuICAoe1xuICAgIGNhbGN1bGF0ZU1hcElkRm9yTm9kZUF0Wm9vbTogZnVuY3Rpb24oY29vcmQsIHpvb20pIHtcbiAgICAgIHZhciBhZGp1c3RlZENvb3JkLCBjb2x1bW4sIGRpc3RGcm9tTGF0U3RhcnQsIGRpc3RGcm9tTG9uU3RhcnQsIGluZGV4LCBsYXRGdWxsTGVuLCBsYXRMZW5BdFpvb20sIGxvbkZ1bGxMZW4sIGxvbkxlbkF0Wm9vbSwgbWFwSWRPZmZzZXQsIHJvdywgcm93c0NvbHVtbnNBdFpvb20sIF9pO1xuICAgICAgYWRqdXN0ZWRDb29yZCA9IGFkanVzdENvb3JkSWZPdXRPZkJvdW5kcyhjb29yZCk7XG4gICAgICByb3dzQ29sdW1uc0F0Wm9vbSA9IE1hdGgucG93KDIsIHpvb20pO1xuICAgICAgbGF0RnVsbExlbiA9IE1hdGguYWJzKE1hcENvbnN0YW50cy5sYXRTdGFydCAtIE1hcENvbnN0YW50cy5sYXRFbmQpO1xuICAgICAgbG9uRnVsbExlbiA9IE1hdGguYWJzKE1hcENvbnN0YW50cy5sb25TdGFydCAtIE1hcENvbnN0YW50cy5sb25FbmQpO1xuICAgICAgZGlzdEZyb21MYXRTdGFydCA9IE1hdGguYWJzKE1hcENvbnN0YW50cy5sYXRTdGFydCAtIGFkanVzdGVkQ29vcmQubGF0KTtcbiAgICAgIGRpc3RGcm9tTG9uU3RhcnQgPSBNYXRoLmFicyhNYXBDb25zdGFudHMubG9uU3RhcnQgLSBhZGp1c3RlZENvb3JkLmxvbik7XG4gICAgICBsYXRMZW5BdFpvb20gPSBsYXRGdWxsTGVuIC8gcm93c0NvbHVtbnNBdFpvb207XG4gICAgICBsb25MZW5BdFpvb20gPSBsb25GdWxsTGVuIC8gcm93c0NvbHVtbnNBdFpvb207XG4gICAgICByb3cgPSBNYXRoLmZsb29yKGRpc3RGcm9tTGF0U3RhcnQgLyBsYXRMZW5BdFpvb20pICsgMTtcbiAgICAgIGNvbHVtbiA9IE1hdGguZmxvb3IoZGlzdEZyb21Mb25TdGFydCAvIGxvbkxlbkF0Wm9vbSkgKyAxO1xuICAgICAgbWFwSWRPZmZzZXQgPSAwO1xuICAgICAgZm9yIChpbmRleCA9IF9pID0gMDsgMCA8PSB6b29tID8gX2kgPCB6b29tIDogX2kgPiB6b29tOyBpbmRleCA9IDAgPD0gem9vbSA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIG1hcElkT2Zmc2V0ICs9IE1hdGgucG93KDQsIGluZGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXBJZE9mZnNldCArIChyb3cgLSAxKSAqIHJvd3NDb2x1bW5zQXRab29tICsgY29sdW1uIC0gMTtcbiAgICB9LFxuICAgIGFkanVzdENvb3JkSWZPdXRPZkJvdW5kczogZnVuY3Rpb24oY29vcmQpIHtcbiAgICAgIHZhciBhZGp1c3RlZENvb3JkO1xuICAgICAgYWRqdXN0ZWRDb29yZCA9IHtcbiAgICAgICAgbGF0OiBjb29yZC5sYXQsXG4gICAgICAgIGxvbjogY29vcmQubG9uXG4gICAgICB9O1xuICAgICAgaWYgKGNvb3JkLmxvbiA+PSBNYXBDb25zdGFudHMubG9uRW5kKSB7XG4gICAgICAgIGNvb3JkLmxvbiA9IE1hcENvbnN0YW50cy5sb25FbmQgLSAwLjAwMDAxO1xuICAgICAgfSBlbHNlIGlmIChjb29yZC5sb24gPCBNYXBDb25zdGFudHMubG9uU3RhcnQpIHtcbiAgICAgICAgY29vcmQubG9uID0gTWFwQ29uc3RhbnRzLmxvblN0YXJ0O1xuICAgICAgfVxuICAgICAgaWYgKGNvb3JkLmxhdCA8PSBNYXBDb25zdGFudHMubGF0RW5kKSB7XG4gICAgICAgIGNvb3JkLmxhdCA9IE1hcENvbnN0YW50cy5sYXRFbmQgKyAwLjAwMDAxO1xuICAgICAgfSBlbHNlIGlmIChjb29yZC5sYXQgPiBNYXBDb25zdGFudHMubGF0U3RhcnQpIHtcbiAgICAgICAgY29vcmQubGF0ID0gTWFwQ29uc3RhbnRzLmxhdFN0YXJ0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFkanVzdGVkQ29vcmQ7XG4gICAgfVxuICB9KTtcbiAgZmFjdG9yeU9iaiA9IHtcbiAgICBnZXRNYXBzRm9yQXJlYUF0Wm9vbTogZnVuY3Rpb24odG9wTGVmdENvb3JkLCBib3R0b21SaWdodENvb3JkLCB6b29tKSB7XG4gICAgICB2YXIgYmxJZCwgYm90dG9tTGVmdENvb3JkLCBicklkLCBpZHMsIGssIHNldCwgdGxJZCwgdG9wUmlnaHRDb29yZCwgdHJJZCwgdjtcbiAgICAgIGJvdHRvbUxlZnRDb29yZCA9IG5ldyBDb29yZCh0b3BMZWZ0Q29vcmQubG9uLCBib3R0b21SaWdodENvb3JkLmxhdCk7XG4gICAgICB0b3BSaWdodENvb3JkID0gbmV3IENvb3JkKGJvdHRvbVJpZ2h0Q29vcmQubG9uLCB0b3BMZWZ0Q29vcmQubGF0KTtcbiAgICAgIHRsSWQgPSB0aGlzLmNhbGN1bGF0ZU1hcElkRm9yTm9kZUF0Wm9vbSh0b3BMZWZ0Q29vcmQsIHpvb20pO1xuICAgICAgdHJJZCA9IHRoaXMuY2FsY3VsYXRlTWFwSWRGb3JOb2RlQXRab29tKHRvcFJpZ2h0Q29vcmQsIHpvb20pO1xuICAgICAgYmxJZCA9IHRoaXMuY2FsY3VsYXRlTWFwSWRGb3JOb2RlQXRab29tKGJvdHRvbUxlZnRDb29yZCwgem9vbSk7XG4gICAgICBicklkID0gdGhpcy5jYWxjdWxhdGVNYXBJZEZvck5vZGVBdFpvb20oYm90dG9tUmlnaHRDb29yZCwgem9vbSk7XG4gICAgICBzZXQgPSB7fTtcbiAgICAgIHNldFt0bElkXSA9IDE7XG4gICAgICBzZXRbdHJJZF0gPSAxO1xuICAgICAgc2V0W2JsSWRdID0gMTtcbiAgICAgIHNldFticklkXSA9IDE7XG4gICAgICBpZHMgPSBbXTtcbiAgICAgIGZvciAoayBpbiBzZXQpIHtcbiAgICAgICAgdiA9IHNldFtrXTtcbiAgICAgICAgaWRzLnB1c2gocGFyc2VJbnQoaywgMTApKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZHM7XG4gICAgfSxcbiAgICBjYWxjdWxhdGVab29tRm9yQXJlYTogZnVuY3Rpb24odG9wTGVmdENvb3JkLCBib3R0b21SaWdodENvb3JkKSB7XG4gICAgICB2YXIgYWN0RGlzdGFuY2VTcXVhcmUsIGRpc3QsIGluZGV4LCBsYXQxLCBsYXQyLCBsb24xLCBsb24yLCBfaSwgX2xlbjtcbiAgICAgIGxvbjEgPSBwYXJzZUZsb2F0KHRvcExlZnRDb29yZC5sb24pO1xuICAgICAgbG9uMiA9IHBhcnNlRmxvYXQoYm90dG9tUmlnaHRDb29yZC5sb24pO1xuICAgICAgbGF0MSA9IHBhcnNlRmxvYXQodG9wTGVmdENvb3JkLmxhdCk7XG4gICAgICBsYXQyID0gcGFyc2VGbG9hdChib3R0b21SaWdodENvb3JkLmxhdCk7XG4gICAgICBhY3REaXN0YW5jZVNxdWFyZSA9IE1hdGgucG93KGxvbjEgLSBsb24yLCAyKSArIE1hdGgucG93KGxhdDEgLSBsYXQyLCAyKTtcbiAgICAgIGZvciAoaW5kZXggPSBfaSA9IDAsIF9sZW4gPSBtYXBab29tRGlhbWV0ZXJTcXVhcmVzLmxlbmd0aDsgX2kgPCBfbGVuOyBpbmRleCA9ICsrX2kpIHtcbiAgICAgICAgZGlzdCA9IG1hcFpvb21EaWFtZXRlclNxdWFyZXNbaW5kZXhdO1xuICAgICAgICBpZiAoZGlzdCA8IGFjdERpc3RhbmNlU3F1YXJlKSB7XG4gICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1hcFpvb21EaWFtZXRlclNxdWFyZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBQYXJ0aXRpb25TZXJ2aWNlO1xuIiwidmFyIENvb3JkO1xuXG5Db29yZCA9IGZ1bmN0aW9uKCkge1xuICBDb29yZCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBDb29yZChsb24sIGxhdCkge1xuICAgICAgdGhpcy5sYXQgPSBsYXQ7XG4gICAgICB0aGlzLmxvbiA9IGxvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29vcmQ7XG5cbiAgfSkoKTtcbiAgcmV0dXJuIENvb3JkO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb29yZDtcbiIsInZhciBBcHBDdHJsO1xuXG5BcHBDdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHRpbWVvdXQsIExvZ2luU2VydmljZSkge1xuICByZXR1cm4gJHNjb3BlLnNlY3VyaXR5ID0ge1xuICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5pc0xvZ2dlZEluKCk7XG4gICAgfSxcbiAgICBzaWduVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nKCk7XG4gICAgfSxcbiAgICBsb2dpbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gTG9naW5TZXJ2aWNlLm9wZW5Mb2dpbkRpYWxvZygpO1xuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBMb2dpblNlcnZpY2UubG9nb3V0KCk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDdHJsO1xuIiwidmFyIGZsYXNoO1xuXG5mbGFzaCA9IGZ1bmN0aW9uKCR0aW1lb3V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogXCI8YnV0dG9uPjwvYnV0dG9uPlwiLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGNvbnRlbnQ6IFwiPVwiLFxuICAgICAgdGltZW91dDogXCJAXCJcbiAgICB9LFxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBlbGVtZW50LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgaWYgKCFhdHRycy50aW1lb3V0KSB7XG4gICAgICAgIGF0dHJzLnRpbWVvdXQgPSAzMDAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICByZXR1cm4gc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzY29wZS5jb250ZW50O1xuICAgICAgICB9LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHZhciBoaWRlRWxlbWVudDtcbiAgICAgICAgICBpZiAodmFsdWUgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlbWVudC50ZXh0KHZhbHVlKTtcbiAgICAgICAgICBlbGVtZW50LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgICAgICBzY29wZS5jb250ZW50ID0gXCJcIjtcbiAgICAgICAgICBoaWRlRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2NvcGUuY29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5jb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gJHRpbWVvdXQoaGlkZUVsZW1lbnQsIHBhcnNlSW50KHNjb3BlLnRpbWVvdXQsIDEwKSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZsYXNoO1xuIiwidmFyIG1hdGNoO1xuXG5tYXRjaCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiB7XG4gICAgICBtYXRjaDogJz0nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMsIGN0cmwpIHtcbiAgICAgIHJldHVybiBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtb2RlbFZhbHVlO1xuICAgICAgICBtb2RlbFZhbHVlID0gY3RybC4kbW9kZWxWYWx1ZSB8fCBjdHJsLiQkaW52YWxpZE1vZGVsVmFsdWU7XG4gICAgICAgIHJldHVybiAoY3RybC4kcHJpc3RpbmUgJiYgYW5ndWxhci5pc1VuZGVmaW5lZChtb2RlbFZhbHVlKSkgfHwgc2NvcGUubWF0Y2ggPT09IG1vZGVsVmFsdWU7XG4gICAgICB9LCBmdW5jdGlvbihjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGN0cmwuJHNldFZhbGlkaXR5KCdtYXRjaCcsIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1hdGNoO1xuIiwidmFyIGNsYXNzZXNNb2R1bGUsIGNvbnRyb2xsZXJzTW9kdWxlLCBkaXJlY3RpdmVzTW9kdWxlLCBzZXJ2aWNlc01vZHVsZTtcblxuY29udHJvbGxlcnNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInNlcnZpY2VzXCIpO1xuXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiY29udHJvbGxlcnNcIik7XG5cbmRpcmVjdGl2ZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImRpcmVjdGl2ZXNcIik7XG5cbmNsYXNzZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImNsYXNzZXNcIik7XG5cbmNvbnRyb2xsZXJzTW9kdWxlLmNvbnRyb2xsZXIoJ0FwcEN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL0FwcEN0cmwnKSk7XG5cbnNlcnZpY2VzTW9kdWxlLmNvbnN0YW50KCdNYXBDb25zdGFudHMnLCByZXF1aXJlKCcuL3NlcnZpY2VzL01hcENvbnN0YW50cycpKTtcblxuY2xhc3Nlc01vZHVsZS5mYWN0b3J5KCdDb29yZCcsIHJlcXVpcmUoJy4vY2xhc3Nlcy9Db29yZCcpKTtcblxuZGlyZWN0aXZlc01vZHVsZS5kaXJlY3RpdmUoJ2ZsYXNoJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2ZsYXNoJykpO1xuXG5kaXJlY3RpdmVzTW9kdWxlLmRpcmVjdGl2ZSgnbWF0Y2gnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvbWF0Y2gnKSk7XG4iLCJ2YXIgTWFwQ29uc3RhbnRzO1xuXG5NYXBDb25zdGFudHMgPSB7XG4gIG1heF96b29tOiA5LFxuICBnb29nbGVfbWFwX2ludGVybmFsX21hcF96b29tX2RpZmZlcmVuY2U6IDMsXG4gIGxhdFN0YXJ0OiA3MCxcbiAgbG9uU3RhcnQ6IC0xMCxcbiAgbGF0RW5kOiAzMCxcbiAgbG9uRW5kOiA1NSxcbiAgZGJQcmVmaXg6IFwib25fdGhlX3JpZGVcIixcbiAgbWF4Wm9vbTogMTUsXG4gIGluZGV4ZWREYlZlcnNpb246IDVcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uc3RhbnRzO1xuIiwidmFyIFByb2ZpbGVDdHJsO1xuXG5Qcm9maWxlQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgRGF0YVByb3ZpZGVyU2VydmljZSwgTG9naW5TZXJ2aWNlLCBVc2VyU2VydmljZSkge1xuICB2YXIgcHJvbWlzZTtcbiAgcHJvbWlzZSA9IERhdGFQcm92aWRlclNlcnZpY2UuZ2V0VXNlckluZm8oTG9naW5TZXJ2aWNlLmdldFNpZ25lZEluVXNlcigpKTtcbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAkc2NvcGUudXNlciA9IGRhdGE7XG4gICAgcmV0dXJuICRzY29wZS5zYXZlZFVzZXIgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnVzZXIpO1xuICB9KTtcbiAgd2luZG93LnNjb3BlID0gJHNjb3BlO1xuICAkc2NvcGUudXNlciA9IHt9O1xuICAkc2NvcGUuc2F2ZWRVc2VyID0ge307XG4gICRzY29wZS5uZXdQYXNzd29yZCA9IHZvaWQgMDtcbiAgJHNjb3BlLnBhc3N3b3JkQ2hhbmdlID0ge307XG4gICRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlID0gJHNjb3BlLnBhc3N3b3JkRmxhc2hNZXNzYWdlID0gXCJcIjtcbiAgJHNjb3BlLmdldFZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlKTtcbiAgfTtcbiAgJHNjb3BlLmdldENzc0NsYXNzZXMgPSBmdW5jdGlvbihuZ01vZGVsQ29udG9sbGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiBuZ01vZGVsQ29udG9sbGVyLiRpbnZhbGlkICYmIG5nTW9kZWxDb250b2xsZXIuJGRpcnR5XG4gICAgfTtcbiAgfTtcbiAgJHNjb3BlLnNob3dFcnJvciA9IGZ1bmN0aW9uKG5nTW9kZWxDb250cm9sbGVyLCBlcnJvcikge1xuICAgIHJldHVybiBuZ01vZGVsQ29udHJvbGxlci4kZXJyb3JbZXJyb3JdO1xuICB9O1xuICAkc2NvcGUuY2FuU2F2ZUZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgcmV0dXJuIGZvcm0uJHZhbGlkO1xuICB9O1xuICAkc2NvcGUuY2FuU2F2ZVByb2ZpbGVGb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuICAgIHJldHVybiBmb3JtLiR2YWxpZCAmJiAoJHNjb3BlLnVzZXIuZW1haWwgIT09ICRzY29wZS5zYXZlZFVzZXIuZW1haWwpO1xuICB9O1xuICAkc2NvcGUuc3VibWl0UGFzc3dvcmRDaGFuZ2VGb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuICAgIGlmIChmb3JtLiRkaXJ0eSAmJiBmb3JtLiRpbnZhbGlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHByb21pc2UgPSBMb2dpblNlcnZpY2UuY2hhbmdlUGFzc3dvcmQoJHNjb3BlLnVzZXIudXNlck5hbWUsICRzY29wZS5wYXNzd29yZENoYW5nZS5wYXNzd29yZCwgJHNjb3BlLnBhc3N3b3JkQ2hhbmdlLm5ld1Bhc3N3b3JkKTtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnBhc3N3b3JkQ2hhbmdlID0ge307XG4gICAgICBmb3JtLiRzZXRQcmlzdGluZSgpO1xuICAgICAgcmV0dXJuICRzY29wZS5wYXNzd29yZEZsYXNoTWVzc2FnZSA9IFwiY2hhbmdlcyBzYXZlZFwiO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gJHNjb3BlLnN1Ym1pdFByb2ZpbGVGb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuICAgIGlmIChmb3JtLiRkaXJ0eSAmJiBmb3JtLiRpbnZhbGlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiMTogXCIgKyAkc2NvcGUucHJvZmlsZUZsYXNoTWVzc2FnZSk7XG4gICAgcHJvbWlzZSA9IFVzZXJTZXJ2aWNlLmNoYW5nZVByb2ZpbGVEYXRhKCRzY29wZS51c2VyLnVzZXJOYW1lLCAkc2NvcGUudXNlcik7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbihVc2VyKSB7XG4gICAgICAkc2NvcGUudXNlciA9IFVzZXI7XG4gICAgICAkc2NvcGUuc2F2ZWRVc2VyID0gYW5ndWxhci5jb3B5KCRzY29wZS51c2VyKTtcbiAgICAgIGZvcm0uJHNldFByaXN0aW5lKCk7XG4gICAgICAkc2NvcGUucHJvZmlsZUZsYXNoTWVzc2FnZSA9IFwiY2hhbmdlcyBzYXZlZDogXCIgKyBEYXRlLm5vdygpO1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiMjogXCIgKyAkc2NvcGUucHJvZmlsZUZsYXNoTWVzc2FnZSk7XG4gICAgfSk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2ZpbGVDdHJsO1xuIiwidmFyIGNvbnRyb2xsZXJzTW9kdWxlLCBzZXJ2aWNlc01vZHVsZTtcblxuY29udHJvbGxlcnNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImNvbnRyb2xsZXJzXCIpO1xuXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIik7XG5cbmNvbnRyb2xsZXJzTW9kdWxlLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9Qcm9maWxlQ3RybCcpKTtcblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnVXNlclNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL1VzZXJTZXJ2aWNlJykpO1xuIiwidmFyIFVzZXJTZXJ2aWNlO1xuXG5Vc2VyU2VydmljZSA9IGZ1bmN0aW9uKCRodHRwKSB7XG4gIHZhciBmYWN0b3J5T2JqO1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGNoYW5nZVByb2ZpbGVEYXRhOiBmdW5jdGlvbih1c2VyTmFtZSwgY2hhbmdlT2JqKSB7XG4gICAgICB2YXIgaGFuZGxlUmVzdWx0O1xuICAgICAgaGFuZGxlUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LmRhdGEudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gJGh0dHAucHV0KFwidXNlcnMvXCIgKyB1c2VyTmFtZSwgY2hhbmdlT2JqKS50aGVuKGhhbmRsZVJlc3VsdCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlclNlcnZpY2U7XG4iLCJ2YXIgTG9naW5DdHJsO1xuXG5Mb2dpbkN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkdGltZW91dCwgTG9naW5TZXJ2aWNlLCAkbG9jYXRpb24pIHtcbiAgJHNjb3BlLmZvcm0gPSB2b2lkIDA7XG4gICRzY29wZS51c2VyID0ge307XG4gICRzY29wZS5zdWJtaXRGb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuICAgIHZhciBwcm9taXNlO1xuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgcHJvbWlzZSA9IExvZ2luU2VydmljZS5sb2dpbigkc2NvcGUudXNlci51c2VyTmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQpO1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgTG9naW5TZXJ2aWNlLmNsb3NlTG9naW5EaWFsb2coKTtcbiAgICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5yZXRyeUF1dGhlbnRpY2F0aW9uKCk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiYmVqZWxlbnRrZXrDqXNpIGhpYmFcIik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5nZXRDc3NDbGFzc2VzID0gZnVuY3Rpb24obmdNb2RlbENvbnRvbGxlcikge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogbmdNb2RlbENvbnRvbGxlci4kaW52YWxpZCAmJiBuZ01vZGVsQ29udG9sbGVyLiRkaXJ0eVxuICAgIH07XG4gIH07XG4gICRzY29wZS5zaG93RXJyb3IgPSBmdW5jdGlvbihuZ01vZGVsQ29udHJvbGxlciwgZXJyb3IpIHtcbiAgICByZXR1cm4gbmdNb2RlbENvbnRyb2xsZXIuJGVycm9yW2Vycm9yXTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS5jYW5jZWxGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgTG9naW5TZXJ2aWNlLmNsb3NlTG9naW5EaWFsb2coKTtcbiAgICByZXR1cm4gJGxvY2F0aW9uLnBhdGgoJy9tYXAnKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW5DdHJsO1xuIiwidmFyIFJlZ2lzdHJhdGlvbkN0cmw7XG5cblJlZ2lzdHJhdGlvbkN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkdGltZW91dCwgTG9naW5TZXJ2aWNlLCAkbG9jYXRpb24pIHtcbiAgJHNjb3BlLmZvcm0gPSB2b2lkIDA7XG4gICRzY29wZS51c2VyID0ge307XG4gICRzY29wZS5zdWJtaXRGb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuICAgIHZhciBVc2VyLCBwcm9taXNlO1xuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgVXNlciA9IHtcbiAgICAgICAgdXNlck5hbWU6ICRzY29wZS51c2VyLnVzZXJOYW1lLFxuICAgICAgICBwYXNzd29yZDogJHNjb3BlLnVzZXIucGFzc3dvcmQsXG4gICAgICAgIGVtYWlsOiAkc2NvcGUudXNlci5lbWFpbFxuICAgICAgfTtcbiAgICAgIHByb21pc2UgPSBMb2dpblNlcnZpY2Uuc2lnblVwKFVzZXIpO1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgTG9naW5TZXJ2aWNlLmNsb3NlUmVnaXN0cmF0aW9uRGlhbG9nKCk7XG4gICAgICAgIHJldHVybiBMb2dpblNlcnZpY2UucmV0cnlBdXRoZW50aWNhdGlvbigpO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcInJlZ2lzenRyw6FjacOzcyBoaWJhXCIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUuZ2V0Q3NzQ2xhc3NlcyA9IGZ1bmN0aW9uKG5nTW9kZWxDb250b2xsZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3I6IG5nTW9kZWxDb250b2xsZXIuJGludmFsaWQgJiYgbmdNb2RlbENvbnRvbGxlci4kZGlydHlcbiAgICB9O1xuICB9O1xuICAkc2NvcGUuc2hvd0Vycm9yID0gZnVuY3Rpb24obmdNb2RlbENvbnRyb2xsZXIsIGVycm9yKSB7XG4gICAgcmV0dXJuIG5nTW9kZWxDb250cm9sbGVyLiRlcnJvcltlcnJvcl07XG4gIH07XG4gIHJldHVybiAkc2NvcGUuY2FuY2VsRm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgIExvZ2luU2VydmljZS5jbG9zZVJlZ2lzdHJhdGlvbkRpYWxvZygpO1xuICAgIHJldHVybiAkbG9jYXRpb24ucGF0aCgnL21hcCcpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWdpc3RyYXRpb25DdHJsO1xuIiwidmFyIGNvbnRyb2xsZXJzTW9kdWxlLCBzZXJ2aWNlc01vZHVsZTtcblxuc2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInNlcnZpY2VzXCIpO1xuXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiY29udHJvbGxlcnNcIik7XG5cbmNvbnRyb2xsZXJzTW9kdWxlLmNvbnRyb2xsZXIoJ1JlZ2lzdHJhdGlvbkN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1JlZ2lzdHJhdGlvbkN0cmwnKSk7XG5cbmNvbnRyb2xsZXJzTW9kdWxlLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvTG9naW5DdHJsJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdMb2dpblNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL0xvZ2luU2VydmljZScpKTtcblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnU2VjdXJpdHlSZXRyeVF1ZXVlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9TZWN1cml0eVJldHJ5UXVldWUnKSk7XG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ1NlY3VyaXR5SW50ZXJjZXB0b3InLCByZXF1aXJlKCcuL3NlcnZpY2VzL1NlY3VyaXR5SW50ZXJjZXB0b3InKSk7XG4iLCJ2YXIgTG9naW5TZXJ2aWNlO1xuXG5Mb2dpblNlcnZpY2UgPSBmdW5jdGlvbigkaHR0cCwgJHEsICRsb2NhdGlvbiwgU2VjdXJpdHlSZXRyeVF1ZXVlLCAkaW9uaWNQb3B1cCwgJHJvb3RTY29wZSwgJHRpbWVvdXQsICR3aW5kb3cpIHtcbiAgdmFyICRzY29wZSwgZmFjdG9yeU9iaiwgcmVkaXJlY3Q7XG4gICRzY29wZSA9ICRyb290U2NvcGUuJG5ldygpO1xuICBTZWN1cml0eVJldHJ5UXVldWUub25JdGVtQWRkZWRDYWxsYmFja3MucHVzaChmdW5jdGlvbihyZXRyeUl0ZW0pIHtcbiAgICBpZiAoU2VjdXJpdHlSZXRyeVF1ZXVlLmhhc01vcmUoKSkge1xuICAgICAgY29uc29sZS5sb2coXCJyZXRyeSBsZWZ1dFwiKTtcbiAgICAgIHJldHVybiBmYWN0b3J5T2JqLnNob3dMb2dpbkRpYWxvZygpO1xuICAgIH1cbiAgfSk7XG4gICRzY29wZS5sb2dpbkRpYWxvZyA9IHZvaWQgMDtcbiAgJHNjb3BlLnJlZ2lzdHJhdGlvbkRpYWxvZyA9IHZvaWQgMDtcbiAgJHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJyZWdpc3RlclwiKTtcbiAgICBpZiAoJHNjb3BlLmxvZ2luRGlhbG9nICE9PSB2b2lkIDApIHtcbiAgICAgICRzY29wZS5sb2dpbkRpYWxvZy5jbG9zZSgpO1xuICAgICAgJHNjb3BlLmxvZ2luRGlhbG9nID0gdm9pZCAwO1xuICAgICAgcmV0dXJuICR0aW1lb3V0KCRzY29wZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nLCAxKTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nICE9PSB2b2lkIDApIHtcbiAgICAgICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cuY2xvc2UoKTtcbiAgICAgICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgPSB2b2lkIDA7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoJHNjb3BlLm9wZW5Mb2dpbkRpYWxvZywgMSk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUub3BlblJlZ2lzdHJhdGlvbkRpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5kYXRhID0ge307XG4gICAgaWYgKCRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIG9wZW4gYSBkaWFsb2cgdGhhdCBpcyBhbHJlYWR5IG9wZW4hJyk7XG4gICAgfVxuICAgIHJldHVybiAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0ZW1wbGF0ZVVybDogXCIvdGVtcGxhdGVzL3JlZ2lzdHJhdGlvbi5odG1sXCIsXG4gICAgICB0aXRsZTogJ1BsZWFzZSBzaWduIHVwJyxcbiAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLm9wZW5Mb2dpbkRpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5kYXRhID0ge307XG4gICAgaWYgKCRzY29wZS5sb2dpbkRpYWxvZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gb3BlbiBhIGRpYWxvZyB0aGF0IGlzIGFscmVhZHkgb3BlbiEnKTtcbiAgICB9XG4gICAgJHNjb3BlLmxvZ2luRGlhbG9nID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0ZW1wbGF0ZVVybDogXCIvdGVtcGxhdGVzL2xvZ2luLmh0bWxcIixcbiAgICAgIHRpdGxlOiAnUGxlYXNlIGxvZyBpbicsXG4gICAgICBzY29wZTogJHNjb3BlXG4gICAgfSk7XG4gICAgJHNjb3BlLnJldHJ5QXV0aGVudGljYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBTZWN1cml0eVJldHJ5UXVldWUucmV0cnlBbGwoKTtcbiAgICB9O1xuICAgIHJldHVybiAkc2NvcGUuY2FuY2VsQXV0aGVudGljYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIFNlY3VyaXR5UmV0cnlRdWV1ZS5jYW5jZWxBbGwoKTtcbiAgICAgIHJldHVybiByZWRpcmVjdCgpO1xuICAgIH07XG4gIH07XG4gIHJlZGlyZWN0ID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdXJsID0gdXJsIHx8ICcvJztcbiAgICByZXR1cm4gJGxvY2F0aW9uLnBhdGgodXJsKTtcbiAgfTtcbiAgZmFjdG9yeU9iaiA9IHtcbiAgICBvcGVuUmVnaXN0cmF0aW9uRGlhbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkc2NvcGUub3BlblJlZ2lzdHJhdGlvbkRpYWxvZygpO1xuICAgIH0sXG4gICAgb3BlbkxvZ2luRGlhbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkc2NvcGUub3BlbkxvZ2luRGlhbG9nKCk7XG4gICAgfSxcbiAgICBjbG9zZUxvZ2luRGlhbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5sb2dpbkRpYWxvZy5jbG9zZSgpO1xuICAgICAgcmV0dXJuICRzY29wZS5sb2dpbkRpYWxvZyA9IHZvaWQgMDtcbiAgICB9LFxuICAgIGNsb3NlUmVnaXN0cmF0aW9uRGlhbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cuY2xvc2UoKTtcbiAgICAgIHJldHVybiAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nID0gdm9pZCAwO1xuICAgIH0sXG4gICAgcmV0cnlBdXRoZW50aWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gU2VjdXJpdHlSZXRyeVF1ZXVlLnJldHJ5QWxsKCk7XG4gICAgfSxcbiAgICBsb2dpbjogZnVuY3Rpb24odXNlck5hbWUsIHBhc3N3b3JkKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIGhhbmRsZVJlc3VsdDtcbiAgICAgIGhhbmRsZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJ1c2VyTmFtZVwiLCBkYXRhLnVzZXJOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2xvZ2luJywge1xuICAgICAgICB1c2VyTmFtZTogdXNlck5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfSkudGhlbihoYW5kbGVSZXN1bHQpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICB9LFxuICAgIHNpZ25VcDogZnVuY3Rpb24oVXNlcikge1xuICAgICAgdmFyIGRlZmVycmVkLCBoYW5kbGVSZXN1bHQ7XG4gICAgICBoYW5kbGVSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQuZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwidXNlck5hbWVcIiwgZGF0YS51c2VyTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCdzaWduVXAnLCBVc2VyKS50aGVuKGhhbmRsZVJlc3VsdCk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyTmFtZVwiKTtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9tYXBcIjtcbiAgICB9LFxuICAgIHNob3dMb2dpbkRpYWxvZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLm9wZW5Mb2dpbkRpYWxvZygpO1xuICAgIH0sXG4gICAgYWRkVXNlcjogZnVuY3Rpb24oVXNlcikge1xuICAgICAgdmFyIGhhbmRsZVJlc3VsdDtcbiAgICAgIGhhbmRsZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ3VzZXJzL25ldycsIFVzZXIpLnRoZW4oaGFuZGxlUmVzdWx0KTtcbiAgICB9LFxuICAgIHJlbW92ZVVzZXI6IGZ1bmN0aW9uKFVzZXIpIHtcbiAgICAgIHZhciBoYW5kbGVSZXN1bHQ7XG4gICAgICBoYW5kbGVSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQuZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiAkaHR0cFtcImRlbGV0ZVwiXShcInVzZXJzXCIsIHtcbiAgICAgICAgaWQ6IFVzZXIuaWRcbiAgICAgIH0pLnRoZW4oaGFuZGxlUmVzdWx0KTtcbiAgICB9LFxuICAgIGdldFNpZ25lZEluVXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXIsIHByb21pc2UsIHVzZXJOYW1lO1xuICAgICAgdXNlck5hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlck5hbWVcIik7XG4gICAgICBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgICBpZiAodXNlck5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJOYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9IFNlY3VyaXR5UmV0cnlRdWV1ZS5wdXNoUmV0cnlGbigndW5hdXRob3JpemVkLXNlcnZlcicsIGZhY3RvcnlPYmouZ2V0U2lnbmVkSW5Vc2VyKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRVc2VyTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcInVzZXJOYW1lXCIpO1xuICAgIH0sXG4gICAgaXNMb2dnZWRJbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcInVzZXJOYW1lXCIpICE9IG51bGw7XG4gICAgfSxcbiAgICBjaGFuZ2VQYXNzd29yZDogZnVuY3Rpb24odXNlck5hbWUsIG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICAgICAgdmFyIGhhbmRsZVJlc3VsdCwgcmVxdWVzdERhdGE7XG4gICAgICBoYW5kbGVSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQuZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJlcXVlc3REYXRhID0ge1xuICAgICAgICB1c2VyTmFtZTogdXNlck5hbWUsXG4gICAgICAgIG9sZFBhc3N3b3JkOiBvbGRQYXNzd29yZCxcbiAgICAgICAgbmV3UGFzc3dvcmQ6IG5ld1Bhc3N3b3JkXG4gICAgICB9O1xuICAgICAgcmV0dXJuICRodHRwLnB1dChcImNoYW5nZVBhc3N3b3JkXCIsIHJlcXVlc3REYXRhKS50aGVuKGhhbmRsZVJlc3VsdCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW5TZXJ2aWNlO1xuIiwidmFyIFNlY3VyaXR5SW50ZXJjZXB0b3I7XG5cblNlY3VyaXR5SW50ZXJjZXB0b3IgPSBmdW5jdGlvbigkaW5qZWN0b3IsIFNlY3VyaXR5UmV0cnlRdWV1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24ob3JpZ2luYWxSZXNwb25zZSkge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsUmVzcG9uc2U7XG4gICAgfSwgZnVuY3Rpb24ob3JpZ2luYWxSZXNwb25zZSkge1xuICAgICAgY29uc29sZS5sb2coXCJsb2dpbiBlcnJvclwiKTtcbiAgICAgIGNvbnNvbGUubG9nKG9yaWdpbmFsUmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgIGlmIChvcmlnaW5hbFJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIHByb21pc2UgPSBTZWN1cml0eVJldHJ5UXVldWUucHVzaFJldHJ5Rm4oJ3VuYXV0aG9yaXplZC1zZXJ2ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnJGh0dHAnKShvcmlnaW5hbFJlc3BvbnNlLmNvbmZpZyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfSk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlY3VyaXR5SW50ZXJjZXB0b3I7XG4iLCJ2YXIgU2VjdXJpdHlSZXRyeVF1ZXVlO1xuXG5TZWN1cml0eVJldHJ5UXVldWUgPSBmdW5jdGlvbigkcSwgJGxvZykge1xuICB2YXIgcmV0cnlRdWV1ZSwgc2VydmljZTtcbiAgcmV0cnlRdWV1ZSA9IFtdO1xuICBzZXJ2aWNlID0ge1xuICAgIG9uSXRlbUFkZGVkQ2FsbGJhY2tzOiBbXSxcbiAgICBoYXNNb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXRyeVF1ZXVlLmxlbmd0aCA+IDA7XG4gICAgfSxcbiAgICBwdXNoOiBmdW5jdGlvbihyZXRyeUl0ZW0pIHtcbiAgICAgIHJldHJ5UXVldWUucHVzaChyZXRyeUl0ZW0pO1xuICAgICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaChzZXJ2aWNlLm9uSXRlbUFkZGVkQ2FsbGJhY2tzLCBmdW5jdGlvbihjYikge1xuICAgICAgICB2YXIgZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gY2IocmV0cnlJdGVtKTtcbiAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgZSA9IF9lcnJvcjtcbiAgICAgICAgICByZXR1cm4gJGxvZy5lcnJvcignc2VjdXJpdHlSZXRyeVF1ZXVlLnB1c2gocmV0cnlJdGVtKTogY2FsbGJhY2sgdGhyZXcgYW4gZXJyb3InICsgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcHVzaFJldHJ5Rm46IGZ1bmN0aW9uKHJlYXNvbiwgcmV0cnlGbikge1xuICAgICAgdmFyIGRlZmVycmVkLCByZXRyeUl0ZW07XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXRyeUZuID0gcmVhc29uO1xuICAgICAgICByZWFzb24gPSB2b2lkIDA7XG4gICAgICB9XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXRyeUl0ZW0gPSB7XG4gICAgICAgIHJlYXNvbjogcmVhc29uLFxuICAgICAgICByZXRyeTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICRxLndoZW4ocmV0cnlGbigpKS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QodmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNlcnZpY2UucHVzaChyZXRyeUl0ZW0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICByZXRyeVJlYXNvbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2VydmljZS5oYXNNb3JlKCkgJiYgcmV0cnlRdWV1ZVswXS5yZWFzb247XG4gICAgfSxcbiAgICBjYW5jZWxBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIHdoaWxlIChzZXJ2aWNlLmhhc01vcmUoKSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHJldHJ5UXVldWUuc2hpZnQoKS5jYW5jZWwoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSxcbiAgICByZXRyeUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgd2hpbGUgKHNlcnZpY2UuaGFzTW9yZSgpKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2gocmV0cnlRdWV1ZS5zaGlmdCgpLnJldHJ5KCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHNlcnZpY2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlY3VyaXR5UmV0cnlRdWV1ZTtcbiIsInZhciBEYXRhUHJvdmlkZXJTZXJ2aWNlO1xuXG5EYXRhUHJvdmlkZXJTZXJ2aWNlID0gZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gIHZhciBmYWN0b3J5T2JqO1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGxvYWRQbGFjZUluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2luZm8nKTtcbiAgICB9LFxuICAgIGxvYWRSb3V0ZUluZm86IGZ1bmN0aW9uKHpvb20sIG1hcHMpIHtcbiAgICAgIHZhciBtYXBzU3RyLCByZXQ7XG4gICAgICBtYXBzU3RyID0gbWFwcy5qb2luKCk7XG4gICAgICByZXR1cm4gcmV0ID0gJGh0dHAuZ2V0KFwicm91dGUvZXVyb3ZlbG9fNi9cIiArIHpvb20gKyBcIi9cIiArIG1hcHNTdHIpO1xuICAgIH0sXG4gICAgbG9hZE1hcEFyZWE6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbWFwLzAnKTtcbiAgICB9LFxuICAgIHNhdmVQbGFjZUluZm86IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvaW5mbycsIGRhdGEpO1xuICAgIH0sXG4gICAgZ2V0VXNlckluZm86IGZ1bmN0aW9uKHVzZXJOYW1lKSB7XG4gICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkaHR0cC5nZXQoXCIvdXNlcnMvXCIgKyB1c2VyTmFtZSkudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGlmIChyZXNwLmRhdGEudGhlbiAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3AuZGF0YS50aGVuKGZ1bmN0aW9uKHJlc3AyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXJcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwMik7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShyZXNwMik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVByb3ZpZGVyU2VydmljZTtcbiIsInZhciBMb2NhbERhdGFQcm92aWRlclNlcnZpY2UsXG4gIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5Mb2NhbERhdGFQcm92aWRlclNlcnZpY2UgPSBmdW5jdGlvbigkaHR0cCwgJHEsIE1hcENvbnN0YW50cykge1xuICB2YXIgZGIsIGZhY3RvcnlPYmosIGlkYlN1cHBvcnRlZCwgb3BlbkNvbm5lY3Rpb24sIHNob3VsZFBvcHVsYXRlRGI7XG4gIGlkYlN1cHBvcnRlZCA9IGZhbHNlO1xuICBpZiAoX19pbmRleE9mLmNhbGwod2luZG93LCBcImluZGV4ZWREQlwiKSA+PSAwKSB7XG4gICAgaWRiU3VwcG9ydGVkID0gdHJ1ZTtcbiAgfVxuICBkYiA9IHZvaWQgMDtcbiAgb3BlbkNvbm5lY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29ublJlcXVlc3Q7XG4gICAgY29ublJlcXVlc3QgPSBpbmRleGVkREIub3BlbihNYXBDb25zdGFudHMuZGJQcmVmaXgsIE1hcENvbnN0YW50cy5pbmRleGVkRGJWZXJzaW9uKTtcbiAgICBjb25uUmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdGhpc0RCO1xuICAgICAgY29uc29sZS5sb2coXCJ1cGdyYWRlbmVlZGVlZFwiKTtcbiAgICAgIHRoaXNEQiA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgIGlmICghdGhpc0RCLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoXCJldXJvdmVsb182XCIpKSB7XG4gICAgICAgIHRoaXNEQi5jcmVhdGVPYmplY3RTdG9yZShcImV1cm92ZWxvXzZcIiwge1xuICAgICAgICAgIGF1dG9JbmNyZW1lbnQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXNEQi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKFwidXNlcnNcIikpIHtcbiAgICAgICAgdGhpc0RCLmNyZWF0ZU9iamVjdFN0b3JlKFwidXNlcnNcIiwge1xuICAgICAgICAgIGF1dG9JbmNyZW1lbnQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXNEQi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKFwidm90ZXNcIikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNEQi5jcmVhdGVPYmplY3RTdG9yZShcInZvdGVzXCIsIHtcbiAgICAgICAgICBhdXRvSW5jcmVtZW50OiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgY29ublJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3JcIik7XG4gICAgICByZXR1cm4gY29uc29sZS5kaXIoZSk7XG4gICAgfTtcbiAgICByZXR1cm4gY29ublJlcXVlc3Q7XG4gIH07XG4gIHNob3VsZFBvcHVsYXRlRGIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQsIG9wZW5SZXF1ZXN0LCBxdWVyeURiSWZUaGVyZUFyZUFueURhdGE7XG4gICAgcXVlcnlEYklmVGhlcmVBcmVBbnlEYXRhID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICB2YXIgY3Vyc29yLCByb3V0ZSwgc3RvcmUsIHRyYW5zYWN0aW9uO1xuICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJldXJvdmVsb182XCJdLCBcInJlYWRvbmx5XCIpO1xuICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcImV1cm92ZWxvXzZcIik7XG4gICAgICBjdXJzb3IgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICByb3V0ZSA9IFtdO1xuICAgICAgcmV0dXJuIGN1cnNvci5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciByZXM7XG4gICAgICAgIHJlcyA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwic2hvdWxkJ250XCIpO1xuICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzaG91bGRcIik7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGlmIChkYikge1xuICAgICAgcXVlcnlEYklmVGhlcmVBcmVBbnlEYXRhKGRlZmVycmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpO1xuICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHF1ZXJ5RGJJZlRoZXJlQXJlQW55RGF0YShkZWZlcnJlZCk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgZmFjdG9yeU9iaiA9IHtcbiAgICBsb2FkUm91dGVJbmZvOiBmdW5jdGlvbih6b29tLCBtYXBzKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIGxvYWRSb3V0ZUluZm9Gcm9tSW5kZXhlZERiLCBzaG91bGRQb3B1bGF0ZVByb21pc2UsIHRoYXQ7XG4gICAgICBsb2FkUm91dGVJbmZvRnJvbUluZGV4ZWREYiA9IGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgY3Vyc29yLCByb3V0ZSwgc3RvcmUsIHRyYW5zYWN0aW9uO1xuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFtcImV1cm92ZWxvXzZcIl0sIFwicmVhZG9ubHlcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJldXJvdmVsb182XCIpO1xuICAgICAgICBjdXJzb3IgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgIHJvdXRlID0gW107XG4gICAgICAgIGN1cnNvci5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIG5vZGUsIHJlcztcbiAgICAgICAgICByZXMgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgbm9kZSA9IHJlcy52YWx1ZTtcbiAgICAgICAgICAgIG5vZGUuX2lkID0gcmVzLmtleTtcbiAgICAgICAgICAgIHJvdXRlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzW1wiY29udGludWVcIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZShyb3V0ZSk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgc2hvdWxkUG9wdWxhdGVQcm9taXNlID0gc2hvdWxkUG9wdWxhdGVEYigpO1xuICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICBzaG91bGRQb3B1bGF0ZVByb21pc2UudGhlbihmdW5jdGlvbihzaG91bGQpIHtcbiAgICAgICAgdmFyIHByb21pc2U7XG4gICAgICAgIGlmIChzaG91bGQpIHtcbiAgICAgICAgICBwcm9taXNlID0gdGhhdC5jbGVhckFuZFBvcHVsYXRlRGJGb3JUZXN0aW5nKCk7XG4gICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2FkUm91dGVJbmZvRnJvbUluZGV4ZWREYihkZWZlcnJlZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGxvYWRSb3V0ZUluZm9Gcm9tSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGNsZWFyQW5kUG9wdWxhdGVEYkZvclRlc3Rpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsZWFyQW5kcG9wdWxhdGVEYkZyb21BcnJheSwgY2xlYXJBbmRwb3B1bGF0ZURiRnJvbVNlcnZlciwgZGVmZXJyZWQsIG9wZW5SZXF1ZXN0O1xuICAgICAgY2xlYXJBbmRwb3B1bGF0ZURiRnJvbVNlcnZlciA9IGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgZGJQcm9taXNlO1xuICAgICAgICBkYlByb21pc2UgPSAkaHR0cC5nZXQoXCJkdW1teURhdGFiYXNlXCIpO1xuICAgICAgICBkYlByb21pc2Uuc3VjY2VzcyhmdW5jdGlvbihub2Rlcykge1xuICAgICAgICAgIHZhciBub2RlLCBzdG9yZSwgdHJhbnNhY3Rpb24sIF9pLCBfbGVuO1xuICAgICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1wiZXVyb3ZlbG9fNlwiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcImV1cm92ZWxvXzZcIik7XG4gICAgICAgICAgc3RvcmUuY2xlYXIoKTtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG5vZGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBub2RlID0gbm9kZXNbX2ldO1xuICAgICAgICAgICAgc3RvcmUuYWRkKG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYlByb21pc2UuZXJyb3IoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcImZhaWx1cmVcIik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGNsZWFyQW5kcG9wdWxhdGVEYkZyb21BcnJheSA9IGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgbm9kZSwgc3RvcmUsIHRyYW5zYWN0aW9uLCBfaSwgX2xlbjtcbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJldXJvdmVsb182XCJdLCBcInJlYWR3cml0ZVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcImV1cm92ZWxvXzZcIik7XG4gICAgICAgIHN0b3JlLmNsZWFyKCk7XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gc21hbGxEYXRhYmFzZUZvclRlc3RpbmcubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBub2RlID0gc21hbGxEYXRhYmFzZUZvclRlc3RpbmdbX2ldO1xuICAgICAgICAgIG5vZGUudm90ZV9wb3MgPSAwO1xuICAgICAgICAgIG5vZGUudm90ZV9uZWcgPSAwO1xuICAgICAgICAgIG5vZGUudXNlciA9IFwiZ3NhbnRhXCI7XG4gICAgICAgICAgc3RvcmUuYWRkKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWYucmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIGlmIChkYikge1xuICAgICAgICBjbGVhckFuZHBvcHVsYXRlRGJGcm9tQXJyYXkoZGVmZXJyZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpO1xuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgcmV0dXJuIGNsZWFyQW5kcG9wdWxhdGVEYkZyb21BcnJheShkZWZlcnJlZCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHVwZGF0ZU5vZGU6IGZ1bmN0aW9uKGlkLCBwcm9wcykge1xuICAgICAgdmFyIHJlcXVlc3QsIHN0b3JlLCB0cmFuc2FjdGlvbjtcbiAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1wiZXVyb3ZlbG9fNlwiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwiZXVyb3ZlbG9fNlwiKTtcbiAgICAgIHJlcXVlc3QgPSBzdG9yZS5wdXQocHJvcHMsIGlkKTtcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCJzdWNjZXNzIHNhdmluZyBub2RlXCIpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcImVycm9yIHNhdmluZyBub2RlXCIpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGFkZE5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHZhciByZXF1ZXN0LCBzdG9yZSwgdHJhbnNhY3Rpb247XG4gICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFtcImV1cm92ZWxvXzZcIl0sIFwicmVhZHdyaXRlXCIpO1xuICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcImV1cm92ZWxvXzZcIik7XG4gICAgICByZXF1ZXN0ID0gc3RvcmUuYWRkKG5vZGUpO1xuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcInN1Y2Nlc3MgYWRkaW5nIG5vZGVcIik7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiZXJyb3IgYWRkaW5nIG5vZGVcIik7XG4gICAgICB9O1xuICAgIH0sXG4gICAgZ2V0VXNlcjogZnVuY3Rpb24odXNlck5hbWUsIHBhc3N3b3JkKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIGxvYWRVc2VySW5mb0Zyb21JbmRleGVkRGIsIG9wZW5SZXF1ZXN0O1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgbG9hZFVzZXJJbmZvRnJvbUluZGV4ZWREYiA9IGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgY3Vyc29yLCBzdG9yZSwgdHJhbnNhY3Rpb24sIHVzZXI7XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1widXNlcnNcIl0sIFwicmVhZG9ubHlcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJ1c2Vyc1wiKTtcbiAgICAgICAgY3Vyc29yID0gc3RvcmUub3BlbkN1cnNvcigpO1xuICAgICAgICB1c2VyID0gdm9pZCAwO1xuICAgICAgICBjdXJzb3Iub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHZhciBhY3RVc2VyO1xuICAgICAgICAgIGFjdFVzZXIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgaWYgKGFjdFVzZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKChhY3RVc2VyLnZhbHVlICE9IG51bGwpICYmIGFjdFVzZXIudmFsdWUudXNlck5hbWUgPT09IHVzZXJOYW1lKSB7XG4gICAgICAgICAgICAgIHVzZXIgPSBhY3RVc2VyLnZhbHVlO1xuICAgICAgICAgICAgICB1c2VyLmlkID0gYWN0VXNlci5rZXk7XG4gICAgICAgICAgICAgIHJldHVybiB1c2VyLnBhc3N3b3JkID0gXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBhY3RVc2VyW1wiY29udGludWVcIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUodXNlcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkZWYucmVqZWN0KFwibG9naW4gZXJyb3JcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIGlmIChkYikge1xuICAgICAgICBsb2FkVXNlckluZm9Gcm9tSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib3BlblJlcXVlc3RcIik7XG4gICAgICAgIG9wZW5SZXF1ZXN0ID0gb3BlbkNvbm5lY3Rpb24oKTtcbiAgICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHJldHVybiBsb2FkVXNlckluZm9Gcm9tSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgYWRkVXNlcjogZnVuY3Rpb24oVXNlcikge1xuICAgICAgdmFyIGFkZFVzZXJUb0luZGV4ZWREYiwgZGVmZXJyZWQsIG9wZW5SZXF1ZXN0O1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgYWRkVXNlclRvSW5kZXhlZERiID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZXF1ZXN0LCBzdG9yZSwgdHJhbnNhY3Rpb247XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1widXNlcnNcIl0sIFwicmVhZHdyaXRlXCIpO1xuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwidXNlcnNcIik7XG4gICAgICAgIHJlcXVlc3QgPSBzdG9yZS5hZGQoVXNlcik7XG4gICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZShVc2VyKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gZGVmLnJlamVjdChcInByb2JsZW0gd2l0aCBzaWduaW5nIHVwXCIpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIGlmIChkYikge1xuICAgICAgICBhZGRVc2VyVG9JbmRleGVkRGIoZGVmZXJyZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvcGVuUmVxdWVzdFwiKTtcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpO1xuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgcmV0dXJuIGFkZFVzZXJUb0luZGV4ZWREYihkZWZlcnJlZCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKHVzZXJOYW1lLCB1cGRhdGVPYmopIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcHJvbWlzZTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHByb21pc2UgPSB0aGlzLmdldFVzZXIodXNlck5hbWUsIHZvaWQgMCk7XG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaywgcmVxdWVzdCwgc3RvcmUsIHRyYW5zYWN0aW9uLCB2O1xuICAgICAgICBmb3IgKGsgaW4gZGF0YSkge1xuICAgICAgICAgIHYgPSBkYXRhW2tdO1xuICAgICAgICAgIGlmICh1cGRhdGVPYmpba10gIT0gbnVsbCkge1xuICAgICAgICAgICAgZGF0YVtrXSA9IHVwZGF0ZU9ialtrXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJ1c2Vyc1wiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJ1c2Vyc1wiKTtcbiAgICAgICAgcmVxdWVzdCA9IHN0b3JlLnB1dChkYXRhLCBkYXRhLmlkKTtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHJlbW92ZVVzZXI6IGZ1bmN0aW9uKFVzZXIpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgb3BlblJlcXVlc3QsIHJlbW92ZWRVc2VyRnJvbUluZGV4ZWREYjtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlbW92ZWRVc2VyRnJvbUluZGV4ZWREYiA9IGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgcmVxdWVzdCwgc3RvcmUsIHRyYW5zYWN0aW9uO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZVVzZXJcIik7XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1widXNlcnNcIl0sIFwicmVhZHdyaXRlXCIpO1xuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwidXNlcnNcIik7XG4gICAgICAgIHJlcXVlc3QgPSBzdG9yZVtcImRlbGV0ZVwiXShVc2VyLmlkKTtcbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKFVzZXIpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVqZWN0KFwicHJvYmxlbSB3aXRoIGRlbGV0aW5nIHVzZXJcIik7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgaWYgKGRiKSB7XG4gICAgICAgIHJlbW92ZWRVc2VyRnJvbUluZGV4ZWREYihkZWZlcnJlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9wZW5SZXF1ZXN0XCIpO1xuICAgICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKCk7XG4gICAgICAgIG9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICByZXR1cm4gcmVtb3ZlZFVzZXJGcm9tSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgZ2V0VXNlclZvdGVGb3JOb2RlOiBmdW5jdGlvbih1c2VyTmFtZSwgbm9kZUlkKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIGxvYWRVc2VyVm90ZUZvck5vZGUsIG9wZW5SZXF1ZXN0O1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgbG9hZFVzZXJWb3RlRm9yTm9kZSA9IGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgY3Vyc29yLCBzdG9yZSwgdHJhbnNhY3Rpb24sIHZvdGU7XG4gICAgICAgIG5vZGVJZCA9IHBhcnNlSW50KG5vZGVJZCk7XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1widm90ZXNcIl0sIFwicmVhZG9ubHlcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJ2b3Rlc1wiKTtcbiAgICAgICAgY3Vyc29yID0gc3RvcmUub3BlbkN1cnNvcigpO1xuICAgICAgICB2b3RlID0gdm9pZCAwO1xuICAgICAgICBjdXJzb3Iub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHZhciBhY3RWb3RlO1xuICAgICAgICAgIGFjdFZvdGUgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgaWYgKGFjdFZvdGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGFjdFZvdGUudmFsdWUudXNlciA9PT0gdXNlck5hbWUgJiYgYWN0Vm90ZS52YWx1ZS5ub2RlID09PSBub2RlSWQpIHtcbiAgICAgICAgICAgICAgdm90ZSA9IGFjdFZvdGUudmFsdWU7XG4gICAgICAgICAgICAgIHJldHVybiB2b3RlLmlkID0gYWN0Vm90ZS5rZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gYWN0Vm90ZVtcImNvbnRpbnVlXCJdKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUodm90ZSk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgaWYgKGRiKSB7XG4gICAgICAgIGxvYWRVc2VyVm90ZUZvck5vZGUoZGVmZXJyZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpO1xuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgcmV0dXJuIGxvYWRVc2VyVm90ZUZvck5vZGUoZGVmZXJyZWQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICBzZXRVc2VyVm90ZUZvck5vZGU6IGZ1bmN0aW9uKHVzZXJOYW1lLCBub2RlSWQsIHZvdGUpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcHJvbWlzZSwgc2V0VXNlclZvdGVGb3JOb2RlVG9JbmRleERiO1xuICAgICAgc2V0VXNlclZvdGVGb3JOb2RlVG9JbmRleERiID0gZnVuY3Rpb24oZGVmLCBkYXRhLCBpc1VwZGF0ZSkge1xuICAgICAgICB2YXIgcmVxdWVzdCwgc3RvcmUsIHRyYW5zYWN0aW9uO1xuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFtcInZvdGVzXCJdLCBcInJlYWR3cml0ZVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcInZvdGVzXCIpO1xuICAgICAgICBpZiAoaXNVcGRhdGUpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gc3RvcmUucHV0KGRhdGEsIGRhdGEuaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcXVlc3QgPSBzdG9yZS5hZGQoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVqZWN0KFwicHJvYmxlbSB3aXRoIGRlbGV0aW5nIHVzZXJcIik7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgcHJvbWlzZSA9IGZhY3RvcnlPYmouZ2V0VXNlclZvdGVGb3JOb2RlKHVzZXJOYW1lLCBub2RlSWQpO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgICAgICAgIGRhdGEudm90ZSA9IHZvdGU7XG4gICAgICAgICAgcmV0dXJuIHNldFVzZXJWb3RlRm9yTm9kZVRvSW5kZXhEYihkZWZlcnJlZCwgZGF0YSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgIHVzZXI6IHVzZXJOYW1lLFxuICAgICAgICAgICAgbm9kZTogbm9kZUlkLFxuICAgICAgICAgICAgdm90ZTogdm90ZVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIHNldFVzZXJWb3RlRm9yTm9kZVRvSW5kZXhEYihkZWZlcnJlZCwgZGF0YSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgZ2V0Vm90ZXNGb3JOb2RlOiBmdW5jdGlvbihub2RlSWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgbG9hZFVzZXJWb3RlRm9yTm9kZSwgb3BlblJlcXVlc3Q7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBsb2FkVXNlclZvdGVGb3JOb2RlID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciBjdXJzb3IsIHN0b3JlLCB0cmFuc2FjdGlvbiwgdm90ZXM7XG4gICAgICAgIG5vZGVJZCA9IHBhcnNlSW50KG5vZGVJZCk7XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1widm90ZXNcIl0sIFwicmVhZG9ubHlcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJ2b3Rlc1wiKTtcbiAgICAgICAgY3Vyc29yID0gc3RvcmUub3BlbkN1cnNvcigpO1xuICAgICAgICB2b3RlcyA9IHtcbiAgICAgICAgICBub2RlSWQ6IG5vZGVJZCxcbiAgICAgICAgICBwb3M6IDAsXG4gICAgICAgICAgbmVnOiAwXG4gICAgICAgIH07XG4gICAgICAgIGN1cnNvci5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIGFjdFZvdGU7XG4gICAgICAgICAgYWN0Vm90ZSA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICBpZiAoYWN0Vm90ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoYWN0Vm90ZS52YWx1ZS5ub2RlID09PSBub2RlSWQpIHtcbiAgICAgICAgICAgICAgaWYgKGFjdFZvdGUudmFsdWUudm90ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZvdGVzLm5lZyArPSAxO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdFZvdGUudmFsdWUudm90ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIHZvdGVzLnBvcyArPSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWN0Vm90ZVtcImNvbnRpbnVlXCJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUodm90ZXMpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIGlmIChkYikge1xuICAgICAgICBsb2FkVXNlclZvdGVGb3JOb2RlKGRlZmVycmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wZW5SZXF1ZXN0ID0gb3BlbkNvbm5lY3Rpb24oKTtcbiAgICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHJldHVybiBsb2FkVXNlclZvdGVGb3JOb2RlKGRlZmVycmVkKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGZhY3RvcnlPYmo7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS40LjBcbihmdW5jdGlvbigpIHtcbiAgdmFyIG1vZHVsZTtcblxuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInNlcnZpY2VzXCIpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdGb3JtSGVscGVyJywgcmVxdWlyZSgnLi9zZWN1cml0eS9Gb3JtSGVscGVyJykpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdEYXRhUHJvdmlkZXJTZXJ2aWNlJywgcmVxdWlyZSgnLi9EYXRhUHJvdmlkZXJTZXJ2aWNlJykpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdMb2NhbERhdGFQcm92aWRlclNlcnZpY2UnLCByZXF1aXJlKCcuL0xvY2FsRGF0YVByb3ZpZGVyU2VydmljZScpKTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBGb3JtSGVscGVyO1xuXG5Gb3JtSGVscGVyID0gZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gIHZhciBmYWN0b3J5T2JqO1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGxvYWRQbGFjZUluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2luZm8nKTtcbiAgICB9LFxuICAgIGxvYWRSb3V0ZUluZm86IGZ1bmN0aW9uKHpvb20sIG1hcHMpIHtcbiAgICAgIHZhciBtYXBzU3RyLCByZXQ7XG4gICAgICBtYXBzU3RyID0gbWFwcy5qb2luKCk7XG4gICAgICByZXR1cm4gcmV0ID0gJGh0dHAuZ2V0KFwicm91dGUvZXVyb3ZlbG9fNi9cIiArIHpvb20gKyBcIi9cIiArIG1hcHNTdHIpO1xuICAgIH0sXG4gICAgbG9hZE1hcEFyZWE6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbWFwLzAnKTtcbiAgICB9LFxuICAgIHNhdmVQbGFjZUluZm86IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvaW5mbycsIGRhdGEpO1xuICAgIH0sXG4gICAgZ2V0VXNlckluZm86IGZ1bmN0aW9uKHVzZXJOYW1lKSB7XG4gICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkaHR0cC5nZXQoXCIvdXNlcnMvXCIgKyB1c2VyTmFtZSkudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGlmIChyZXNwLmRhdGEudGhlbiAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3AuZGF0YS50aGVuKGZ1bmN0aW9uKHJlc3AyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVzZXJcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwMik7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShyZXNwMik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybUhlbHBlcjtcbiJdfQ==
