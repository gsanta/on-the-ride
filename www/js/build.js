(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// var classesModule, controllersModule, directivesModule, servicesModule;

// servicesModule = angular.module("services", []);

// classesModule = angular.module("classes", []);

// directivesModule = angular.module("directives", []);

// controllersModule = angular.module("controllers", ["services", "directives"]);

// require('./services');

// require('./dao');

// require('./editor');

// require('./map_builder');

// require('./map_calculation');

// require('./misc');

// require('./profile');

// require('./security');

// servicesModule.config(function($httpProvider) {
//   return $httpProvider.responseInterceptors.push('SecurityInterceptor');
// });

// angular.module('starter', ['ionic', 'controllers', 'services', 'classes', 'directives', 'ui.gravatar']).run(function($ionicPlatform, $rootScope, $location, LoginService) {
//   return $ionicPlatform.ready(function() {
//     if ((window.cordova != null) && (window.cordova.plugins.Keyboard != null)) {
//       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//     }
//     if (window.StatusBar != null) {
//       return StatusBar.styleDefault; 
//     }
//   });
// }).config(function($stateProvider, $urlRouterProvider) {
//   $stateProvider.state('map', {
//     url: "/map",
//     templateUrl: 'templates/mapEdit.html',
//     controller: 'MapEditCtrl'
//   }).state('profile', {
//     url: "/profile",
//     templateUrl: 'templates/profile.html',
//     controller: 'ProfileCtrl',
//     resolve: {
//       auth: function($q, $injector, LoginService) {
//         return LoginService.getSignedInUser();
//       }
//     }
//   }).state('loginTemp', {
//     url: "/loginTemp",
//     templateUrl: 'templates/login.html',
//     controller: 'LoginCtrl'
//   });
//   return $urlRouterProvider.otherwise('/map');
// });

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
  
  $urlRouterProvider.when('', '/');

  $stateProvider 
  .state("root", {
    url: "/",
    templateUrl: 'templates/root.html',
    controller: 'AppCtrl'
  })
  .state('root.map', {
    url: "^/map",
    templateUrl: 'templates/mapEdit.html',
    controller: 'MapEditCtrl'
  })
  .state('main.profile', {
    url: "^/profile",
    templateUrl: 'templates/profile.html',
    controller: 'ProfileCtrl',
    resolve: {
      auth: function($q, $injector, LoginService) {
        return LoginService.getSignedInUser();
      }
    }
  })
  // .state('loginTemp', { 
  //   url: "/loginTemp",
  //   templateUrl: 'templates/login.html',
  //   controller: 'LoginCtrl'
  // });

  $urlRouterProvider.otherwise('/map');

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

  $scope.init = function() {
    var routeInfoPromise;
    
    routeInfoPromise = LocalDataProviderService.loadRouteInfo();

    routeInfoPromise.then(function(data) {
      var centerCoordinate;
      
      $scope.routeInfo = data;
      centerCoordinate = BicycleRouteBuilderService.createCoordinate(data[0].lat, data[0].lon);
      
      $scope.map = new google.maps.Map(document.querySelector('#container-map-edit').querySelector('#googleMap'), MapBuilderService.createMapProperties(centerCoordinates, 13));
      
      polylines.push(BicycleRouteBuilderService.createPolylineFromRoute(data, $scope.map));
      
      google.maps.event.addListener($scope.map, 'zoom_changed', function() {
        $scope.loadRouteInfo();
      });
    });
  }

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
    BicycleRouteDaoService.updateNodes(updateNodes);
    BicycleRouteDaoService.addNodes(addNodes);
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
  indexedDbVersion: 5,
  iDBRouteStoreName: "route0"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvYXBwLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvZGFvL2luZGV4LmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvZGFvL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZURhb1NlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9kYW8vc2VydmljZXMvVm90ZURhb1NlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9lZGl0b3IvY29udHJvbGxlcnMvTWFwRWRpdEN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9lZGl0b3IvaW5kZXguanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9lZGl0b3Ivc2VydmljZXMvTWFwRWRpdG9yU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9idWlsZGVyL2NvbnRyb2xsZXJzL01hcEN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9tYXBfYnVpbGRlci9pbmRleC5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9idWlsZGVyL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvbWFwX2J1aWxkZXIvc2VydmljZXMvSW5mb1dpbmRvd1NlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9tYXBfYnVpbGRlci9zZXJ2aWNlcy9NYXBCdWlsZGVyU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9jYWxjdWxhdGlvbi9pbmRleC5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL21hcF9jYWxjdWxhdGlvbi9zZXJ2aWNlcy9CaWN5Y2xlUm91dGVTZXJ2aWNlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvbWFwX2NhbGN1bGF0aW9uL3NlcnZpY2VzL01hcFBhcnRpdGlvblNlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2NsYXNzZXMvQ29vcmQuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2NvbnRyb2xsZXJzL0FwcEN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2RpcmVjdGl2ZXMvZmxhc2guanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2RpcmVjdGl2ZXMvbWF0Y2guanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9taXNjL2luZGV4LmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvbWlzYy9zZXJ2aWNlcy9NYXBDb25zdGFudHMuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9wcm9maWxlL2NvbnRyb2xsZXJzL1Byb2ZpbGVDdHJsLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvcHJvZmlsZS9pbmRleC5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL3Byb2ZpbGUvc2VydmljZXMvVXNlclNlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9jb250cm9sbGVycy9Mb2dpbkN0cmwuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9jb250cm9sbGVycy9SZWdpc3RyYXRpb25DdHJsLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VjdXJpdHkvaW5kZXguanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9zZXJ2aWNlcy9Mb2dpblNlcnZpY2UuanMiLCIvaG9tZS9nc2FudGEvZGV2L29uLXRoZS1yaWRlL3d3dy9qcy9zZWN1cml0eS9zZXJ2aWNlcy9TZWN1cml0eUludGVyY2VwdG9yLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VjdXJpdHkvc2VydmljZXMvU2VjdXJpdHlSZXRyeVF1ZXVlLmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VydmljZXMvRGF0YVByb3ZpZGVyU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL3NlcnZpY2VzL0xvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5qcyIsIi9ob21lL2dzYW50YS9kZXYvb24tdGhlLXJpZGUvd3d3L2pzL3NlcnZpY2VzL2luZGV4LmpzIiwiL2hvbWUvZ3NhbnRhL2Rldi9vbi10aGUtcmlkZS93d3cvanMvc2VydmljZXMvc2VjdXJpdHkvRm9ybUhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyB2YXIgY2xhc3Nlc01vZHVsZSwgY29udHJvbGxlcnNNb2R1bGUsIGRpcmVjdGl2ZXNNb2R1bGUsIHNlcnZpY2VzTW9kdWxlO1xuXG4vLyBzZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIiwgW10pO1xuXG4vLyBjbGFzc2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJjbGFzc2VzXCIsIFtdKTtcblxuLy8gZGlyZWN0aXZlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiZGlyZWN0aXZlc1wiLCBbXSk7XG5cbi8vIGNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJjb250cm9sbGVyc1wiLCBbXCJzZXJ2aWNlc1wiLCBcImRpcmVjdGl2ZXNcIl0pO1xuXG4vLyByZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5cbi8vIHJlcXVpcmUoJy4vZGFvJyk7XG5cbi8vIHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbi8vIHJlcXVpcmUoJy4vbWFwX2J1aWxkZXInKTtcblxuLy8gcmVxdWlyZSgnLi9tYXBfY2FsY3VsYXRpb24nKTtcblxuLy8gcmVxdWlyZSgnLi9taXNjJyk7XG5cbi8vIHJlcXVpcmUoJy4vcHJvZmlsZScpO1xuXG4vLyByZXF1aXJlKCcuL3NlY3VyaXR5Jyk7XG5cbi8vIHNlcnZpY2VzTW9kdWxlLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4vLyAgIHJldHVybiAkaHR0cFByb3ZpZGVyLnJlc3BvbnNlSW50ZXJjZXB0b3JzLnB1c2goJ1NlY3VyaXR5SW50ZXJjZXB0b3InKTtcbi8vIH0pO1xuXG4vLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlcicsIFsnaW9uaWMnLCAnY29udHJvbGxlcnMnLCAnc2VydmljZXMnLCAnY2xhc3NlcycsICdkaXJlY3RpdmVzJywgJ3VpLmdyYXZhdGFyJ10pLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBMb2dpblNlcnZpY2UpIHtcbi8vICAgcmV0dXJuICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuLy8gICAgIGlmICgod2luZG93LmNvcmRvdmEgIT0gbnVsbCkgJiYgKHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQgIT0gbnVsbCkpIHtcbi8vICAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG4vLyAgICAgfVxuLy8gICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyICE9IG51bGwpIHtcbi8vICAgICAgIHJldHVybiBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0OyBcbi8vICAgICB9XG4vLyAgIH0pO1xuLy8gfSkuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbi8vICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21hcCcsIHtcbi8vICAgICB1cmw6IFwiL21hcFwiLFxuLy8gICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hcEVkaXQuaHRtbCcsXG4vLyAgICAgY29udHJvbGxlcjogJ01hcEVkaXRDdHJsJ1xuLy8gICB9KS5zdGF0ZSgncHJvZmlsZScsIHtcbi8vICAgICB1cmw6IFwiL3Byb2ZpbGVcIixcbi8vICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wcm9maWxlLmh0bWwnLFxuLy8gICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCcsXG4vLyAgICAgcmVzb2x2ZToge1xuLy8gICAgICAgYXV0aDogZnVuY3Rpb24oJHEsICRpbmplY3RvciwgTG9naW5TZXJ2aWNlKSB7XG4vLyAgICAgICAgIHJldHVybiBMb2dpblNlcnZpY2UuZ2V0U2lnbmVkSW5Vc2VyKCk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9KS5zdGF0ZSgnbG9naW5UZW1wJywge1xuLy8gICAgIHVybDogXCIvbG9naW5UZW1wXCIsXG4vLyAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4vLyAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbi8vICAgfSk7XG4vLyAgIHJldHVybiAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbWFwJyk7XG4vLyB9KTtcblxudmFyIGNsYXNzZXNNb2R1bGUsIGNvbnRyb2xsZXJzTW9kdWxlLCBkaXJlY3RpdmVzTW9kdWxlLCBzZXJ2aWNlc01vZHVsZTtcblxuc2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInNlcnZpY2VzXCIsIFtdKTtcblxuY2xhc3Nlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiY2xhc3Nlc1wiLCBbXSk7XG5cbmRpcmVjdGl2ZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImRpcmVjdGl2ZXNcIiwgW10pO1xuXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiY29udHJvbGxlcnNcIiwgW1wic2VydmljZXNcIiwgXCJkaXJlY3RpdmVzXCJdKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcycpO1xuXG5yZXF1aXJlKCcuL2RhbycpO1xuXG5yZXF1aXJlKCcuL2VkaXRvcicpO1xuXG5yZXF1aXJlKCcuL21hcF9idWlsZGVyJyk7XG5cbnJlcXVpcmUoJy4vbWFwX2NhbGN1bGF0aW9uJyk7XG5cbnJlcXVpcmUoJy4vbWlzYycpO1xuXG5yZXF1aXJlKCcuL3Byb2ZpbGUnKTtcblxucmVxdWlyZSgnLi9zZWN1cml0eScpO1xuXG5zZXJ2aWNlc01vZHVsZS5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICByZXR1cm4gJGh0dHBQcm92aWRlci5yZXNwb25zZUludGVyY2VwdG9ycy5wdXNoKCdTZWN1cml0eUludGVyY2VwdG9yJyk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXInLCBbJ2lvbmljJywgJ2NvbnRyb2xsZXJzJywgJ3NlcnZpY2VzJywgJ2NsYXNzZXMnLCAnZGlyZWN0aXZlcycsICd1aS5ncmF2YXRhciddKS5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0sICRyb290U2NvcGUsICRsb2NhdGlvbiwgTG9naW5TZXJ2aWNlKSB7XG4gIHJldHVybiAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoKHdpbmRvdy5jb3Jkb3ZhICE9IG51bGwpICYmICh3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkICE9IG51bGwpKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgIH1cbiAgICBpZiAod2luZG93LlN0YXR1c0JhciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQmFyLnN0eWxlRGVmYXVsdDsgXG4gICAgfVxuICB9KTtcbn0pLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gIFxuICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignJywgJy8nKTtcblxuICAkc3RhdGVQcm92aWRlciBcbiAgLnN0YXRlKFwicm9vdFwiLCB7XG4gICAgdXJsOiBcIi9cIixcbiAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9yb290Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBcHBDdHJsJ1xuICB9KVxuICAuc3RhdGUoJ3Jvb3QubWFwJywge1xuICAgIHVybDogXCJeL21hcFwiLFxuICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hcEVkaXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ01hcEVkaXRDdHJsJ1xuICB9KVxuICAuc3RhdGUoJ21haW4ucHJvZmlsZScsIHtcbiAgICB1cmw6IFwiXi9wcm9maWxlXCIsXG4gICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcHJvZmlsZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwnLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGF1dGg6IGZ1bmN0aW9uKCRxLCAkaW5qZWN0b3IsIExvZ2luU2VydmljZSkge1xuICAgICAgICByZXR1cm4gTG9naW5TZXJ2aWNlLmdldFNpZ25lZEluVXNlcigpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgLy8gLnN0YXRlKCdsb2dpblRlbXAnLCB7IFxuICAvLyAgIHVybDogXCIvbG9naW5UZW1wXCIsXG4gIC8vICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gIC8vICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgLy8gfSk7XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL21hcCcpO1xuXG59KTtcbiIsInZhciBtb2R1bGU7XG5cbm1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIik7XG5cbm1vZHVsZS5mYWN0b3J5KCdCaWN5Y2xlUm91dGVEYW9TZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9CaWN5Y2xlUm91dGVEYW9TZXJ2aWNlJykpO1xuXG5tb2R1bGUuZmFjdG9yeSgnVm90ZURhb1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL1ZvdGVEYW9TZXJ2aWNlJykpO1xuIiwidmFyIEJpY3ljbGVSb3V0ZURhb1NlcnZpY2U7XG5cbkJpY3ljbGVSb3V0ZURhb1NlcnZpY2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZhY3RvcnlPYmo7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgc2F2ZVBvaW50czogZnVuY3Rpb24obm9kZXMpIHtcbiAgICAgIHZhciBub2RlLCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBub2Rlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBub2RlID0gbm9kZXNbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS51cGRhdGVOb2RlKG5vZGUuX2lkLCB7XG4gICAgICAgICAgbGF0OiBub2RlLmxhdCxcbiAgICAgICAgICBsb246IG5vZGUubG9uXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9LFxuICAgIGFkZFBvaW50czogZnVuY3Rpb24obm9kZXMpIHtcbiAgICAgIHZhciBub2RlLCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBub2Rlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBub2RlID0gbm9kZXNbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5hZGROb2RlKHtcbiAgICAgICAgICB1c2VyOiBub2RlLnVzZXIsXG4gICAgICAgICAgbGF0OiBub2RlLmxhdCxcbiAgICAgICAgICBsb246IG5vZGUubG9uXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaWN5Y2xlUm91dGVEYW9TZXJ2aWNlO1xuIiwidmFyIFZvdGVEYW9TZXJ2aWNlO1xuXG5Wb3RlRGFvU2VydmljZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmFjdG9yeU9iajtcbiAgZmFjdG9yeU9iaiA9IHtcbiAgICBnZXRVc2VyVm90ZVRvUG9pbnQ6IGZ1bmN0aW9uKHVzZXJOYW1lLCBub2RlSWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgaHR0cFByb21pc2U7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBodHRwUHJvbWlzZSA9ICRodHRwLmdldChcIi92b3RlL1wiICsgdXNlck5hbWUgKyBcIi9cIiArIG5vZGVJZCk7XG4gICAgICBodHRwUHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgaWYgKHJlc3AuZGF0YS50aGVuICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcC5kYXRhLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKGRhdGEgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHVzZXI6IHVzZXJOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVJZCxcbiAgICAgICAgICAgICAgICB2b3RlOiAxXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGdldEFsbFZvdGVzVG9Ob2RlOiBmdW5jdGlvbihub2RlSWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgaHR0cFByb21pc2U7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBodHRwUHJvbWlzZSA9ICRodHRwLmdldChcIi92b3RlL1wiICsgbm9kZUlkKTtcbiAgICAgIGh0dHBQcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBpZiAocmVzcC5kYXRhLnRoZW4gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiByZXNwLmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbm9kZUlkOiBub2RlSWQsXG4gICAgICAgICAgICAgICAgcG9zOiAwLFxuICAgICAgICAgICAgICAgIG5lZzogMFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICBzZW5kVXNlclZvdGVGb3JOb2RlOiBmdW5jdGlvbih1c2VyTmFtZSwgbm9kZUlkLCB2b3RlKSB7XG4gICAgICByZXR1cm4gJGh0dHAucG9zdChcIi92b3RlL25ld1wiLCB7XG4gICAgICAgIHVzZXI6IHVzZXJOYW1lLFxuICAgICAgICBub2RlSWQ6IG5vZGVJZCxcbiAgICAgICAgdm90ZTogdm90ZVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVm90ZURhb1NlcnZpY2U7XG4iLCJ2YXIgTWFwRWRpdEN0cmw7XG5cbk1hcEVkaXRDdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHRpbWVvdXQsIE1hcEVkaXRvclNlcnZpY2UsIEJpY3ljbGVSb3V0ZVNlcnZpY2UsIEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLCBEYXRhUHJvdmlkZXJTZXJ2aWNlLCBCaWN5Y2xlUm91dGVEYW9TZXJ2aWNlLCBNYXBCdWlsZGVyU2VydmljZSwgVm90ZURhb1NlcnZpY2UsIExvY2FsRGF0YVByb3ZpZGVyU2VydmljZSwgQ29vcmQsIExvZ2luU2VydmljZSwgTWFwQ29uc3RhbnRzKSB7XG4gIHZhciBjYW5Mb2FkTWFwQWdhaW4sIGNsZWFyQXJyYXksIGNvcHlFZGl0ZWRNYXJrZXJzLCBlZGl0ZWRNYXJrZXJzLCBtYXJrZXJzLCBuZXdOb2RlQ291bnRlciwgcG9seWxpbmVzLCByb3V0ZVBvbHlsaW5lO1xuICByb3V0ZVBvbHlsaW5lID0gdm9pZCAwO1xuICBjYW5Mb2FkTWFwQWdhaW4gPSB0cnVlO1xuICBuZXdOb2RlQ291bnRlciA9IC0xO1xuICBlZGl0ZWRNYXJrZXJzID0gW107XG4gIG1hcmtlcnMgPSBbXTtcbiAgcG9seWxpbmVzID0gW107XG5cbiAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm91dGVJbmZvUHJvbWlzZTtcbiAgICBcbiAgICByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKTtcblxuICAgIHJvdXRlSW5mb1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgY2VudGVyQ29vcmRpbmF0ZTtcbiAgICAgIFxuICAgICAgJHNjb3BlLnJvdXRlSW5mbyA9IGRhdGE7XG4gICAgICBjZW50ZXJDb29yZGluYXRlID0gQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UuY3JlYXRlQ29vcmRpbmF0ZShkYXRhWzBdLmxhdCwgZGF0YVswXS5sb24pO1xuICAgICAgXG4gICAgICAkc2NvcGUubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGFpbmVyLW1hcC1lZGl0JykucXVlcnlTZWxlY3RvcignI2dvb2dsZU1hcCcpLCBNYXBCdWlsZGVyU2VydmljZS5jcmVhdGVNYXBQcm9wZXJ0aWVzKGNlbnRlckNvb3JkaW5hdGVzLCAxMykpO1xuICAgICAgXG4gICAgICBwb2x5bGluZXMucHVzaChCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZS5jcmVhdGVQb2x5bGluZUZyb21Sb3V0ZShkYXRhLCAkc2NvcGUubWFwKSk7XG4gICAgICBcbiAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKCRzY29wZS5tYXAsICd6b29tX2NoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmxvYWRSb3V0ZUluZm8oKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJBcnJheSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIG9iaiwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBhcnJheS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgb2JqID0gYXJyYXlbX2ldO1xuICAgICAgX3Jlc3VsdHMucHVzaChvYmouc2V0TWFwKG51bGwpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9O1xuICBjb3B5RWRpdGVkTWFya2VycyA9IGZ1bmN0aW9uKGZyb21BcnJheSwgdG9Bc3NvY0FycmF5KSB7XG4gICAgdmFyIG9iaiwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBmcm9tQXJyYXkubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIG9iaiA9IGZyb21BcnJheVtfaV07XG4gICAgICBpZiAob2JqLm5vZGVJbmZvLmNoYW5nZWQpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh0b0Fzc29jQXJyYXlbb2JqLm5vZGVJbmZvLl9pZF0gPSBvYmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG4gICRzY29wZS5yb3V0ZUluZm8gPSB2b2lkIDA7XG4gICRzY29wZS5tYXAgPSB2b2lkIDA7XG4gICRzY29wZS5pc1RoZXJlRWRpdGVkTm9kZSA9IGZhbHNlO1xuICAkc2NvcGUuaW5mb1dpbmRvdyA9IHtcbiAgICBpc0Rpc3BsYXllZDogZmFsc2VcbiAgfTtcbiAgJHNjb3BlLmxvYWRSb3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZHMsIG1hcElkcywgbWFwWm9vbSwgbmUsIHJvdXRlSW5mb1Byb21pc2UsIHN3O1xuICAgIGJvdW5kcyA9ICRzY29wZS5tYXAuZ2V0Qm91bmRzKCk7XG4gICAgbmUgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCk7XG4gICAgc3cgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XG4gICAgbWFwWm9vbSA9IE1hcEVkaXRvclNlcnZpY2UuY2FsY3VsYXRlWm9vbShuZXcgQ29vcmQoc3cubG5nKCksIG5lLmxhdCgpKSwgbmV3IENvb3JkKG5lLmxuZygpLCBzdy5sYXQoKSkpO1xuICAgIG1hcElkcyA9IE1hcEVkaXRvclNlcnZpY2UuZ2V0TWFwc0ZvckFyZWFBdFpvb20obmV3IENvb3JkKHN3LmxuZygpLCBuZS5sYXQoKSksIG5ldyBDb29yZChuZS5sbmcoKSwgc3cubGF0KCkpLCBtYXBab29tIC0gMSk7XG4gICAgcm91dGVJbmZvUHJvbWlzZSA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5sb2FkUm91dGVJbmZvKCk7XG4gICAgcmV0dXJuIHJvdXRlSW5mb1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcm91dGU7XG4gICAgICByb3V0ZSA9IEJpY3ljbGVSb3V0ZVNlcnZpY2UuY3JlYXRlUm91dGVGcm9tTm9kZXMoZGF0YSwgMSwgWzBdKTtcbiAgICAgIHJvdXRlUG9seWxpbmUuc2V0TWFwKG51bGwpO1xuICAgICAgcm91dGVQb2x5bGluZSA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlKHJvdXRlKTtcbiAgICAgIHJldHVybiByb3V0ZVBvbHlsaW5lLnNldE1hcCgkc2NvcGUubWFwKTtcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmxvYWRSb3V0ZUluZm8gPSBmdW5jdGlvbigpIHt9O1xuICAkc2NvcGUuaXNFZGl0ID0gdHJ1ZTtcblxuICAkc2NvcGUuaW5pdE1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByb3V0ZUluZm9Qcm9taXNlO1xuICAgIHdpbmRvdy5yb3V0ZUluZm8gPSAkc2NvcGUucm91dGVJbmZvO1xuICAgIHJvdXRlSW5mb1Byb21pc2UgPSBMb2NhbERhdGFQcm92aWRlclNlcnZpY2UubG9hZFJvdXRlSW5mbygpO1xuICAgIHJvdXRlSW5mb1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgY2VudGVyQ29vcmRpbmF0ZXM7XG4gICAgICAkc2NvcGUucm91dGVJbmZvID0gZGF0YTtcbiAgICAgIEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZUNvb3JkaW5hdGUoZGF0YVswXS5sYXQsIGRhdGFbMF0ubG9uKTtcbiAgICAgIGNlbnRlckNvb3JkaW5hdGVzID0gQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UuY3JlYXRlQ29vcmRpbmF0ZShkYXRhWzBdLmxhdCwgZGF0YVswXS5sb24pO1xuICAgICAgJHNjb3BlLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRhaW5lci1tYXAtZWRpdCcpLnF1ZXJ5U2VsZWN0b3IoJyNnb29nbGVNYXAnKSwgTWFwQnVpbGRlclNlcnZpY2UuY3JlYXRlTWFwUHJvcGVydGllcyhjZW50ZXJDb29yZGluYXRlcywgMTMpKTtcbiAgICAgIHBvbHlsaW5lcy5wdXNoKEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlKGRhdGEsICRzY29wZS5tYXApKTtcbiAgICAgIHJldHVybiBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcigkc2NvcGUubWFwLCAnem9vbV9jaGFuZ2VkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUubG9hZFJvdXRlSW5mbygpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKFwib2tlXCIpO1xuICB9O1xuXG4gICRzY29wZS5zYXZlUG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFkZE5vZGVzLCBrLCB1cGRhdGVOb2RlcywgdjtcbiAgICB1cGRhdGVOb2RlcyA9IFtdO1xuICAgIGFkZE5vZGVzID0gW107XG4gICAgY29weUVkaXRlZE1hcmtlcnMobWFya2VycywgZWRpdGVkTWFya2Vycyk7XG4gICAgZm9yIChrIGluIGVkaXRlZE1hcmtlcnMpIHtcbiAgICAgIHYgPSBlZGl0ZWRNYXJrZXJzW2tdO1xuICAgICAgaWYgKHYubm9kZUluZm8uX2lkIDwgMCkge1xuICAgICAgICBhZGROb2Rlcy5wdXNoKHYubm9kZUluZm8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlTm9kZXMucHVzaCh2Lm5vZGVJbmZvKTtcbiAgICAgIH1cbiAgICB9XG4gICAgQmljeWNsZVJvdXRlRGFvU2VydmljZS51cGRhdGVOb2Rlcyh1cGRhdGVOb2Rlcyk7XG4gICAgQmljeWNsZVJvdXRlRGFvU2VydmljZS5hZGROb2RlcyhhZGROb2Rlcyk7XG4gICAgcmV0dXJuICRzY29wZS5pc1RoZXJlRWRpdGVkTm9kZSA9IGZhbHNlO1xuICB9O1xuICAkc2NvcGUuYWRkUG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFya2VyO1xuICAgIG1hcmtlciA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlLmFkZE5ld1BvaW50VG9DZW50ZXJPZk1hcCgkc2NvcGUubWFwLCAkc2NvcGUpO1xuICAgIG1hcmtlci5ub2RlSW5mby5faWQgPSBuZXdOb2RlQ291bnRlcjtcbiAgICAkc2NvcGUuaXNUaGVyZUVkaXRlZE5vZGUgPSB0cnVlO1xuICAgIG5ld05vZGVDb3VudGVyLS07XG4gICAgZWRpdGVkTWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgcmV0dXJuIG1hcmtlcnMucHVzaChtYXJrZXIpO1xuICB9O1xuICAkc2NvcGUuaW5mb0JveGVzID0gW107XG4gICRzY29wZS52b3RlID0ge1xuICAgIHZhbHVlOiAxLFxuICAgIGlzUmVzZXQ6IHRydWVcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndm90ZS5pc1Jlc2V0JywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKFwicmVzZXQgd2F0Y2g6IFwiICsgbmV3VmFsdWUpO1xuICB9KTtcbiAgcmV0dXJuICRzY29wZS4kd2F0Y2goJ3ZvdGUudmFsdWUnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICB2YXIgbm9kZUlkLCB1c2VyO1xuICAgIGNvbnNvbGUubG9nKFwicmVzZXQ6IFwiICsgJHNjb3BlLnZvdGUuaXNSZXNldCk7XG4gICAgbmV3VmFsdWUgPSBwYXJzZUludChuZXdWYWx1ZSk7XG4gICAgb2xkVmFsdWUgPSBwYXJzZUludChvbGRWYWx1ZSk7XG4gICAgaWYgKCEkc2NvcGUudm90ZS5pc1Jlc2V0ICYmIG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgY29uc29sZS5sb2coXCJzZW5kOiBcIiArIG9sZFZhbHVlICsgXCIsXCIgKyBuZXdWYWx1ZSArIFwiLCBcIiArICRzY29wZS52b3RlLmlzUmVzZXQpO1xuICAgICAgdXNlciA9IExvZ2luU2VydmljZS5nZXRVc2VyTmFtZSgpO1xuICAgICAgbm9kZUlkID0gJHNjb3BlLmFjdE5vZGUuX2lkO1xuICAgICAgVm90ZURhb1NlcnZpY2Uuc2VuZFVzZXJWb3RlRm9yTm9kZSh1c2VyLCBub2RlSWQsIG5ld1ZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuICRzY29wZS52b3RlLmlzUmVzZXQgPSBmYWxzZTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEVkaXRDdHJsO1xuIiwidmFyIGNvbnRyb2xsZXJzTW9kdWxlLCBzZXJ2aWNlc01vZHVsZTtcblxuc2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcInNlcnZpY2VzXCIpO1xuXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiY29udHJvbGxlcnNcIik7XG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ01hcEVkaXRvclNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL01hcEVkaXRvclNlcnZpY2UnKSk7XG5cbmNvbnRyb2xsZXJzTW9kdWxlLmNvbnRyb2xsZXIoJ01hcEVkaXRDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9NYXBFZGl0Q3RybCcpKTtcbiIsInZhciBNYXBFZGl0b3JTZXJ2aWNlO1xuXG5NYXBFZGl0b3JTZXJ2aWNlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmYWN0b3J5T2JqO1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGNyZWF0ZUFzc29jQXJyYXlGcm9tQ2hhbmdlZE1hcmtlcnM6IGZ1bmN0aW9uKG1hcmtlcnMpIHtcbiAgICAgIHZhciBhc3NvYywgbWFya2VyLCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgICBhc3NvYyA9IFtdO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gbWFya2Vycy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBtYXJrZXIgPSBtYXJrZXJzW19pXTtcbiAgICAgICAgaWYgKG1hcmtlci5ub2RlSW5mby5jaGFuZ2VkKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChhc3NvY1ttYXJrZXIubm9kZUluZm8uX2lkXSA9IG1hcmtlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwRWRpdG9yU2VydmljZTtcbiIsInZhciBNYXBDdHJsO1xuXG5NYXBDdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHRpbWVvdXQsIE1hcFNlcnZpY2UsIERhdGFQcm92aWRlclNlcnZpY2UsIExvY2FsRGF0YVByb3ZpZGVyU2VydmljZSwgQ29vcmQpIHtcbiAgdmFyIGNhbkxvYWRNYXBBZ2Fpbiwgcm91dGVQb2x5bGluZTtcbiAgcm91dGVQb2x5bGluZSA9IHZvaWQgMDtcbiAgY2FuTG9hZE1hcEFnYWluID0gdHJ1ZTtcbiAgJHNjb3BlLnJvdXRlSW5mbyA9IHZvaWQgMDtcbiAgJHNjb3BlLm1hcCA9IHZvaWQgMDtcbiAgJHNjb3BlLmxvYWRSb3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZHMsIG1hcElkcywgbWFwWm9vbSwgbmUsIHJvdXRlSW5mb1Byb21pc2UsIHN3O1xuICAgIGJvdW5kcyA9ICRzY29wZS5tYXAuZ2V0Qm91bmRzKCk7XG4gICAgbmUgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCk7XG4gICAgc3cgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XG4gICAgbWFwWm9vbSA9IE1hcFNlcnZpY2UuY2FsY3VsYXRlWm9vbShuZXcgQ29vcmQoc3cubG5nKCksIG5lLmxhdCgpKSwgbmV3IENvb3JkKG5lLmxuZygpLCBzdy5sYXQoKSkpO1xuICAgIG1hcElkcyA9IE1hcFNlcnZpY2UuZ2V0TWFwc0ZvckFyZWFBdFpvb20obmV3IENvb3JkKHN3LmxuZygpLCBuZS5sYXQoKSksIG5ldyBDb29yZChuZS5sbmcoKSwgc3cubGF0KCkpLCBtYXBab29tIC0gMSk7XG4gICAgcm91dGVJbmZvUHJvbWlzZSA9IExvY2FsRGF0YVByb3ZpZGVyU2VydmljZS5sb2FkUm91dGVJbmZvKCk7XG4gICAgcmV0dXJuIHJvdXRlSW5mb1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcm91dGU7XG4gICAgICByb3V0ZSA9IE1hcFNlcnZpY2UuY3JlYXRlUm91dGVGcm9tTm9kZUFycmF5KGRhdGEsIDEsIFswXSk7XG4gICAgICByb3V0ZVBvbHlsaW5lLnNldE1hcChudWxsKTtcbiAgICAgIHJvdXRlUG9seWxpbmUgPSBNYXBTZXJ2aWNlLmNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlKHJvdXRlKTtcbiAgICAgIHJldHVybiByb3V0ZVBvbHlsaW5lLnNldE1hcCgkc2NvcGUubWFwKTtcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmluaXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm91dGVJbmZvUHJvbWlzZTtcbiAgICByb3V0ZUluZm9Qcm9taXNlID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlLmxvYWRSb3V0ZUluZm8oKTtcbiAgICByZXR1cm4gcm91dGVJbmZvUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBjZW50ZXJDb29yZGluYXRlcywgcm91dGU7XG4gICAgICAkc2NvcGUucm91dGVJbmZvID0gZGF0YTtcbiAgICAgIGNlbnRlckNvb3JkaW5hdGVzID0gTWFwU2VydmljZS5jcmVhdGVDb29yZGluYXRlKGRhdGFbMF0ubGF0LCBkYXRhWzBdLmxvbik7XG4gICAgICAkc2NvcGUubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdmlldy1tYXAnKS5xdWVyeVNlbGVjdG9yKCcjZ29vZ2xlTWFwJyksIE1hcFNlcnZpY2UuY3JlYXRlTWFwUHJvcGVydGllcyhjZW50ZXJDb29yZGluYXRlcywgMykpO1xuICAgICAgJHNjb3BlLm1hcC5nZXRCb3VuZHMoKTtcbiAgICAgIHJvdXRlID0gTWFwU2VydmljZS5jcmVhdGVSb3V0ZUZyb21Ob2RlQXJyYXkoZGF0YSwgMSwgWzBdKTtcbiAgICAgIHJvdXRlUG9seWxpbmUgPSBNYXBTZXJ2aWNlLmNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlKHJvdXRlKTtcbiAgICAgIHJvdXRlUG9seWxpbmUuc2V0TWFwKCRzY29wZS5tYXApO1xuICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoJHNjb3BlLm1hcCwgJ3pvb21fY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKCRzY29wZS5tYXAsIFwiYm91bmRzX2NoYW5nZWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYWxsYmFjaztcbiAgICAgICAgaWYgKGNhbkxvYWRNYXBBZ2Fpbikge1xuICAgICAgICAgICRzY29wZS5sb2FkUm91dGUoKTtcbiAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbkxvYWRNYXBBZ2FpbiA9IHRydWU7XG4gICAgICAgICAgfTtcbiAgICAgICAgICAkdGltZW91dChjYWxsYmFjaywgNTAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbkxvYWRNYXBBZ2FpbiA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiAkc2NvcGUuaW5mb0JveGVzID0gW107XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEN0cmw7XG4iLCJ2YXIgY29udHJvbGxlcnNNb2R1bGUsIHNlcnZpY2VzTW9kdWxlO1xuXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIik7XG5cbmNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJjb250cm9sbGVyc1wiKTtcblxuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignTWFwQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvTWFwQ3RybCcpKTtcblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdJbmZvV2luZG93U2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvSW5mb1dpbmRvd1NlcnZpY2UnKSk7XG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ01hcEJ1aWxkZXJTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9NYXBCdWlsZGVyU2VydmljZScpKTtcbiIsInZhciBCaWN5Y2xlUm91dGVCdWlsZGVyU2VydmljZTtcblxuQmljeWNsZVJvdXRlQnVpbGRlclNlcnZpY2UgPSBmdW5jdGlvbihJbmZvV2luZG93U2VydmljZSkge1xuICB2YXIgYWRkQ2xpY2tFdmVudFRvTWFya2VyLCBhZGREcmFnZW5kRXZlbnRUb01hcmtlciwgZmFjdG9yeU9iajtcbiAgYWRkQ2xpY2tFdmVudFRvTWFya2VyID0gZnVuY3Rpb24obWFya2VyLCBzY29wZSwgbm9kZSwgY29udGVudCwgZ29vZ2xlTWFwKSB7XG4gICAgcmV0dXJuIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWxsVm90ZXNQcm9taXNlLCBub2RlSWQsIHVzZXJWb3RlUHJvbWlzZTtcbiAgICAgIG5vZGVJZCA9IHBhcnNlSW50KG5vZGUuX2lkKTtcbiAgICAgIHVzZXJWb3RlUHJvbWlzZSA9IGZhY3RvcnlPYmouZ2V0VXNlclZvdGVUb1BvaW50KExvZ2luU2VydmljZS5nZXRVc2VyTmFtZSgpLCBub2RlSWQpO1xuICAgICAgYWxsVm90ZXNQcm9taXNlID0gZmFjdG9yeU9iai5nZXRBbGxWb3Rlc1RvTm9kZShub2RlSWQpO1xuICAgICAgc2NvcGUuYWN0Tm9kZSA9IG5vZGU7XG4gICAgICBhbGxWb3Rlc1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNjb3BlLmFjdE5vZGUudm90ZV9wb3MgPSBkYXRhLnBvcztcbiAgICAgICAgcmV0dXJuIHNjb3BlLmFjdE5vZGUudm90ZV9uZWcgPSBkYXRhLm5lZztcbiAgICAgIH0pO1xuICAgICAgdXNlclZvdGVQcm9taXNlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gc2NvcGUudm90ZS52YWx1ZSA9IGRhdGEudm90ZTtcbiAgICAgIH0pO1xuICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICBJbmZvV2luZG93U2VydmljZS5nZXRJbmZvV2luZG93KCkuc2V0Q29udGVudChjb250ZW50KTtcbiAgICAgIHJldHVybiBJbmZvV2luZG93U2VydmljZS5nZXRJbmZvV2luZG93KCkub3Blbihnb29nbGVNYXAsIG1hcmtlcik7XG4gICAgfSk7XG4gIH07XG4gIGFkZERyYWdlbmRFdmVudFRvTWFya2VyID0gZnVuY3Rpb24obWFya2VyLCBzY29wZSkge1xuICAgIHJldHVybiBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIG1hcmtlci5ub2RlSW5mby5jaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIG1hcmtlci5ub2RlSW5mby5sYXQgPSBldmVudC5sYXRMbmcuaztcbiAgICAgIG1hcmtlci5ub2RlSW5mby5sb24gPSBldmVudC5sYXRMbmcuQjtcbiAgICAgIHJldHVybiBzY29wZS5pc1RoZXJlRWRpdGVkTm9kZSA9IHRydWU7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqID0ge1xuICAgIGNyZWF0ZVBvbHlsaW5lRnJvbVJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgZ29vZ2xlTWFwKSB7XG4gICAgICB2YXIgY29vcmRpbmF0ZXMsIG5vZGUsIHJvdXRlUG9seWxpbmUsIF9pLCBfbGVuO1xuICAgICAgY29vcmRpbmF0ZXMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gcm91dGUubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbm9kZSA9IHJvdXRlW19pXTtcbiAgICAgICAgY29vcmRpbmF0ZXMucHVzaChuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKG5vZGUubGF0LCBub2RlLmxvbikpO1xuICAgICAgfVxuICAgICAgcm91dGVQb2x5bGluZSA9IG5ldyBnb29nbGUubWFwcy5Qb2x5bGluZSh7XG4gICAgICAgIHBhdGg6IGNvb3JkaW5hdGVzLFxuICAgICAgICBnZW9kZXNpYzogdHJ1ZSxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICcjRkYwMDAwJyxcbiAgICAgICAgc3Ryb2tlT3BhY2l0eTogMS4wLFxuICAgICAgICBzdHJva2VXZWlnaHQ6IDIsXG4gICAgICAgIG1hcDogZ29vZ2xlTWFwXG4gICAgICB9KTtcbiAgICAgIHJldHVybiByb3V0ZVBvbHlsaW5lO1xuICAgIH0sXG4gICAgY3JlYXRlTWFya2Vyc0Zyb21Sb3V0ZTogZnVuY3Rpb24ocm91dGUsIGdvb2dsZU1hcCwgc2NvcGUpIHtcbiAgICAgIHZhciBjb21waWxlZCwgaW5kZXgsIG1hcmtlciwgbWFya2VyT3B0aW9ucywgbWFya2Vycywgbm9kZSwgX2ksIF9sZW47XG4gICAgICBtYXJrZXJzID0gW107XG4gICAgICBjb21waWxlZCA9ICRjb21waWxlKGluZm9XaW5kb3dDb250ZW50KShzY29wZSk7XG4gICAgICBzY29wZS5tYXJrZXJzID0gbWFya2VycztcbiAgICAgIGZvciAoaW5kZXggPSBfaSA9IDAsIF9sZW4gPSByb3V0ZS5sZW5ndGg7IF9pIDwgX2xlbjsgaW5kZXggPSArK19pKSB7XG4gICAgICAgIG5vZGUgPSByb3V0ZVtpbmRleF07XG4gICAgICAgIG1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgbWFwOiBnb29nbGVNYXAsXG4gICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1AsXG4gICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobm9kZS5sYXQsIG5vZGUubG9uKVxuICAgICAgICB9O1xuICAgICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKG1hcmtlck9wdGlvbnMpO1xuICAgICAgICBtYXJrZXIubm9kZUluZm8gPSBub2RlO1xuICAgICAgICBtYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICAgICAgYWRkQ2xpY2tFdmVudFRvTWFya2VyKG1hcmtlciwgc2NvcGUsIG5vZGUsIGNvbXBpbGVkWzBdLCBnb29nbGVNYXApO1xuICAgICAgICBhZGREcmFnZW5kRXZlbnRUb01hcmtlcihtYXJrZXIsIHNjb3BlKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKG1hcmtlcnMpO1xuICAgICAgcmV0dXJuIG1hcmtlcnM7XG4gICAgfSxcbiAgICBhZGROZXdQb2ludFRvQ2VudGVyT2ZNYXA6IGZ1bmN0aW9uKGdvb2dsZU1hcCwgc2NvcGUpIHtcbiAgICAgIHZhciBjb21waWxlZCwgbWFya2VyLCBtYXJrZXJPcHRpb25zO1xuICAgICAgY29tcGlsZWQgPSAkY29tcGlsZShpbmZvV2luZG93Q29udGVudCkoc2NvcGUpO1xuICAgICAgbWFya2VyT3B0aW9ucyA9IHtcbiAgICAgICAgbWFwOiBnb29nbGVNYXAsXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCxcbiAgICAgICAgcG9zaXRpb246IGdvb2dsZU1hcC5nZXRDZW50ZXIoKVxuICAgICAgfTtcbiAgICAgIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG4gICAgICBtYXJrZXIubm9kZUluZm8gPSB7XG4gICAgICAgIHVzZXI6IExvZ2luU2VydmljZS5nZXRVc2VyTmFtZSgpLFxuICAgICAgICB2b3RlX3BvczogMCxcbiAgICAgICAgdm90ZV9uZWc6IDAsXG4gICAgICAgIGNoYW5nZWQ6IHRydWUsXG4gICAgICAgIGxhdDogZ29vZ2xlTWFwLmdldENlbnRlcigpLmssXG4gICAgICAgIGxvbjogZ29vZ2xlTWFwLmdldENlbnRlcigpLkIsXG4gICAgICAgIF9pZDogLTFcbiAgICAgIH07XG4gICAgICBhZGRDbGlja0V2ZW50VG9NYXJrZXIobWFya2VyLCBzY29wZSwgbWFya2VyLm5vZGVJbmZvLCBjb21waWxlZFswXSwgZ29vZ2xlTWFwKTtcbiAgICAgIGFkZERyYWdlbmRFdmVudFRvTWFya2VyKG1hcmtlciwgc2NvcGUpO1xuICAgICAgcmV0dXJuIG1hcmtlcjtcbiAgICB9LFxuICAgIGNyZWF0ZUNvb3JkaW5hdGU6IGZ1bmN0aW9uKGxhdCwgbG9uKSB7XG4gICAgICByZXR1cm4gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxvbik7XG4gICAgfSxcbiAgICBhZGRDbGlja0V2ZW50VG9NYXJrZXI6IGZ1bmN0aW9uKG1hcmtlciwgc2NvcGUsIG5vZGUsIGNvbnRlbnQsIGdvb2dsZU1hcCkge1xuICAgICAgcmV0dXJuIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhbGxWb3Rlc1Byb21pc2UsIG5vZGVJZCwgdXNlclZvdGVQcm9taXNlO1xuICAgICAgICBub2RlSWQgPSBwYXJzZUludChub2RlLl9pZCk7XG4gICAgICAgIHVzZXJWb3RlUHJvbWlzZSA9IGZhY3RvcnlPYmouZ2V0VXNlclZvdGVUb1BvaW50KExvZ2luU2VydmljZS5nZXRVc2VyTmFtZSgpLCBub2RlSWQpO1xuICAgICAgICBhbGxWb3Rlc1Byb21pc2UgPSBmYWN0b3J5T2JqLmdldEFsbFZvdGVzVG9Ob2RlKG5vZGVJZCk7XG4gICAgICAgIHNjb3BlLmFjdE5vZGUgPSBub2RlO1xuICAgICAgICBhbGxWb3Rlc1Byb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgc2NvcGUuYWN0Tm9kZS52b3RlX3BvcyA9IGRhdGEucG9zO1xuICAgICAgICAgIHJldHVybiBzY29wZS5hY3ROb2RlLnZvdGVfbmVnID0gZGF0YS5uZWc7XG4gICAgICAgIH0pO1xuICAgICAgICB1c2VyVm90ZVByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIHNjb3BlLnZvdGUudmFsdWUgPSBkYXRhLnZvdGU7XG4gICAgICAgIH0pO1xuICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgSW5mb1dpbmRvd1NlcnZpY2UuZ2V0SW5mb1dpbmRvdygpLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgICAgIHJldHVybiBJbmZvV2luZG93U2VydmljZS5nZXRJbmZvV2luZG93KCkub3Blbihnb29nbGVNYXAsIG1hcmtlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpY3ljbGVSb3V0ZUJ1aWxkZXJTZXJ2aWNlO1xuIiwidmFyIEluZm9XaW5kb3dTZXJ2aWNlLCBmYWN0b3J5T2JqO1xuXG5JbmZvV2luZG93U2VydmljZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5mb1dpbmRvd0NvbnRlbnQsIGluZm93aW5kb3c7XG4gIGluZm9XaW5kb3dDb250ZW50ID0gJzxkaXY+XFxuICA8ZGl2IGNsYXNzPVwibGlzdFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJpdGVtIGl0ZW0tZGl2aWRlclwiPlxcbiAgICAgICAgQmFzaWMgaW5mb1xcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+IFxcbiAgICAgICAgVXNlcjoge3thY3ROb2RlLnVzZXJ9fTxici8+XFxuICAgICAgICBJZDoge3thY3ROb2RlLmxhdH19XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cIml0ZW0gaXRlbS1kaXZpZGVyXCI+XFxuICAgICAgICBIb3cgYWNjdXJhdGUgdGhpcyBwb2ludCBpcz9cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaXRlbSByYW5nZSByYW5nZS1lbmVyZ2l6ZWRcIj4gXFxuICAgICAgICA8ZGl2PiBcXG4gICAgICAgIDxpbnB1dCB0eXBlPVwicmFuZ2VcIiBuYW1lPVwidm9sdW1lXCIgbWluPVwiMFwiIG1heD1cIjJcIiB2YWx1ZT1cIjFcIiBuZy1tb2RlbD1cInZvdGUudmFsdWVcIj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPGRpdj5cXG4gICAgICAgICAgPGkgY2xhc3M9XCJpY29uIGlvbi1oYXBweVwiPiZuYnNwO3t7YWN0Tm9kZS52b3RlX3Bvc319PC9pPlxcbiAgICAgICAgICA8aSBjbGFzcz1cImljb24gaW9uLXNhZFwiPiZuYnNwO3t7YWN0Tm9kZS52b3RlX25lZ319PC9pPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG4nO1xuICBpbmZvd2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coKTtcbiAgcmV0dXJuIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKGluZm93aW5kb3csICdjbG9zZWNsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0pO1xufTtcblxuZmFjdG9yeU9iaiA9IHtcbiAgZ2V0SW5mb1dpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGluZm93aW5kb3c7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW5mb1dpbmRvd1NlcnZpY2U7XG4iLCJ2YXIgTWFwQnVpbGRlclNlcnZpY2U7XG5cbk1hcEJ1aWxkZXJTZXJ2aWNlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmYWN0b3J5T2JqO1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGNyZWF0ZU1hcFByb3BlcnRpZXM6IGZ1bmN0aW9uKGNlbnRlclBvc2l0aW9uLCB6b29tLCBtYXBUeXBlSWQpIHtcbiAgICAgIHZhciBtYXBQcm9wO1xuICAgICAgbWFwUHJvcCA9IHtcbiAgICAgICAgY2VudGVyOiBjZW50ZXJQb3NpdGlvbixcbiAgICAgICAgem9vbTogem9vbSxcbiAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuVEVSUkFJTlxuICAgICAgfTtcbiAgICAgIGlmIChtYXBUeXBlSWQgIT0gbnVsbCkge1xuICAgICAgICBtYXBQcm9wLm1hcFR5cGVJZCA9IG1hcFR5cGVJZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXBQcm9wO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGZhY3RvcnlPYmo7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEJ1aWxkZXJTZXJ2aWNlO1xuIiwidmFyIG1vZHVsZTtcblxubW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJzZXJ2aWNlc1wiKTtcblxubW9kdWxlLmZhY3RvcnkoJ0JpY3ljbGVSb3V0ZVNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL0JpY3ljbGVSb3V0ZVNlcnZpY2UnKSk7XG5cbm1vZHVsZS5mYWN0b3J5KCdNYXBQYXJ0aXRpb25TZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9NYXBQYXJ0aXRpb25TZXJ2aWNlJykpO1xuIiwidmFyIEJpY3ljbGVSb3V0ZVNlcnZpY2UsXG4gIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5CaWN5Y2xlUm91dGVTZXJ2aWNlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjcmVhdGVSb3V0ZUZyb21TdGFydE5vZGUsIGZhY3RvcnlPYmo7XG4gICh7XG4gICAgZ2V0U3RhcnROb2RlT2ZNYXBJZDogZnVuY3Rpb24obm9kZXMsIG1hcElkKSB7XG4gICAgICB2YXIgbm9kZSwgX2ksIF9sZW47XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG5vZGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tfaV07XG4gICAgICAgIGlmIChfX2luZGV4T2YuY2FsbChub2RlLnN0YXJ0Tm9kZUluTWFwLCBtYXBJZCkgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuICBjcmVhdGVSb3V0ZUZyb21TdGFydE5vZGUgPSBmdW5jdGlvbihzdGFydE5vZGUpIHtcbiAgICB2YXIgYWN0Tm9kZSwgcm91dGU7XG4gICAgcm91dGUgPSBbXTtcbiAgICBhY3ROb2RlID0gc3RhcnROb2RlO1xuICAgIHdoaWxlIChhY3ROb2RlICE9PSB2b2lkIDApIHtcbiAgICAgIHJvdXRlLnB1c2goYWN0Tm9kZSk7XG4gICAgICBpZiAoYWN0Tm9kZS53ZWlnaHQgPCB6b29tKSB7XG4gICAgICAgIGFjdE5vZGUgPSBub2RlQXNzb2NNYXBbYWN0Tm9kZS5zaWJsaW5nc1swXV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3ROb2RlID0gbm9kZUFzc29jTWFwW2FjdE5vZGUuc2libGluZ3NbTWFwQ29uc3RhbnRzLm1heF96b29tIC0gem9vbV1dO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcm91dGU7XG4gIH07XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgY3JlYXRlUm91dGVGcm9tTm9kZXM6IGZ1bmN0aW9uKHJvdXRlTm9kZXMsIHpvb20sIG1hcElkcykge1xuICAgICAgdmFyIGZpbmFsUm91dGUsIG1hcElkLCBub2RlLCByb3V0ZSwgcm91dGVOb2Rlc01hcCwgc3RhcnROb2RlLCBzdGFydE5vZGVzLCBfaSwgX2osIF9rLCBfbGVuLCBfbGVuMSwgX2xlbjI7XG4gICAgICBpZiAoem9vbSA+IE1hcENvbnN0YW50cy5tYXhfem9vbSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ6b29tIGlzIGJpZ2dlciB0aGFuIHRoZSBtYXhpbXVtICh1c2UgTWFwQ29uc3RhbnRzLm1heF96b29tKVwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh6b29tIDwgMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ6b29tIGlzIHNtYWxsZXIgdGhhbiB0aGUgbWluaW11bSAodXNlIE1hcENvbnN0YW50cy5taW5fem9vbSlcIik7XG4gICAgICB9XG4gICAgICByb3V0ZU5vZGVzTWFwID0ge307XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHJvdXRlTm9kZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbm9kZSA9IHJvdXRlTm9kZXNbX2ldO1xuICAgICAgICByb3V0ZU5vZGVzTWFwW25vZGUuX2lkXSA9IG5vZGU7XG4gICAgICB9XG4gICAgICBzdGFydE5vZGVzID0gW107XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBtYXBJZHMubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgIG1hcElkID0gbWFwSWRzW19qXTtcbiAgICAgICAgc3RhcnROb2RlID0gdGhpcy5nZXRTdGFydE5vZGVPZk1hcElkKHJvdXRlTm9kZXMsIG1hcElkKTtcbiAgICAgICAgaWYgKHN0YXJ0Tm9kZSkge1xuICAgICAgICAgIHN0YXJ0Tm9kZXMucHVzaChzdGFydE5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmaW5hbFJvdXRlID0gW107XG4gICAgICBmb3IgKF9rID0gMCwgX2xlbjIgPSBzdGFydE5vZGVzLmxlbmd0aDsgX2sgPCBfbGVuMjsgX2srKykge1xuICAgICAgICBzdGFydE5vZGUgPSBzdGFydE5vZGVzW19rXTtcbiAgICAgICAgcm91dGUgPSBjcmVhdGVSb3V0ZUZyb21TdGFydE5vZGUoc3RhcnROb2RlKTtcbiAgICAgICAgaWYgKHJvdXRlLmxlbmd0aCA+IGZpbmFsUm91dGUubGVuZ3RoKSB7XG4gICAgICAgICAgZmluYWxSb3V0ZSA9IHJvdXRlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmluYWxSb3V0ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaWN5Y2xlUm91dGVTZXJ2aWNlO1xuIiwidmFyIE1hcFBhcnRpdGlvblNlcnZpY2U7XG5cbk1hcFBhcnRpdGlvblNlcnZpY2UgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZhY3RvcnlPYmosIG1hcFpvb21EaWFtZXRlclNxdWFyZXM7XG4gIG1hcFpvb21EaWFtZXRlclNxdWFyZXMgPSBbNTgyNSwgMTQ1Ni4yNSwgMzY0LjA2MjUsIDkxLjAxNiwgMjIuNzU0LCA1LjY5MSwgMS40MjIsIDAuMzU1NywgMC4wODkyXTtcbiAgKHtcbiAgICBjYWxjdWxhdGVNYXBJZEZvck5vZGVBdFpvb206IGZ1bmN0aW9uKGNvb3JkLCB6b29tKSB7XG4gICAgICB2YXIgYWRqdXN0ZWRDb29yZCwgY29sdW1uLCBkaXN0RnJvbUxhdFN0YXJ0LCBkaXN0RnJvbUxvblN0YXJ0LCBpbmRleCwgbGF0RnVsbExlbiwgbGF0TGVuQXRab29tLCBsb25GdWxsTGVuLCBsb25MZW5BdFpvb20sIG1hcElkT2Zmc2V0LCByb3csIHJvd3NDb2x1bW5zQXRab29tLCBfaTtcbiAgICAgIGFkanVzdGVkQ29vcmQgPSBhZGp1c3RDb29yZElmT3V0T2ZCb3VuZHMoY29vcmQpO1xuICAgICAgcm93c0NvbHVtbnNBdFpvb20gPSBNYXRoLnBvdygyLCB6b29tKTtcbiAgICAgIGxhdEZ1bGxMZW4gPSBNYXRoLmFicyhNYXBDb25zdGFudHMubGF0U3RhcnQgLSBNYXBDb25zdGFudHMubGF0RW5kKTtcbiAgICAgIGxvbkZ1bGxMZW4gPSBNYXRoLmFicyhNYXBDb25zdGFudHMubG9uU3RhcnQgLSBNYXBDb25zdGFudHMubG9uRW5kKTtcbiAgICAgIGRpc3RGcm9tTGF0U3RhcnQgPSBNYXRoLmFicyhNYXBDb25zdGFudHMubGF0U3RhcnQgLSBhZGp1c3RlZENvb3JkLmxhdCk7XG4gICAgICBkaXN0RnJvbUxvblN0YXJ0ID0gTWF0aC5hYnMoTWFwQ29uc3RhbnRzLmxvblN0YXJ0IC0gYWRqdXN0ZWRDb29yZC5sb24pO1xuICAgICAgbGF0TGVuQXRab29tID0gbGF0RnVsbExlbiAvIHJvd3NDb2x1bW5zQXRab29tO1xuICAgICAgbG9uTGVuQXRab29tID0gbG9uRnVsbExlbiAvIHJvd3NDb2x1bW5zQXRab29tO1xuICAgICAgcm93ID0gTWF0aC5mbG9vcihkaXN0RnJvbUxhdFN0YXJ0IC8gbGF0TGVuQXRab29tKSArIDE7XG4gICAgICBjb2x1bW4gPSBNYXRoLmZsb29yKGRpc3RGcm9tTG9uU3RhcnQgLyBsb25MZW5BdFpvb20pICsgMTtcbiAgICAgIG1hcElkT2Zmc2V0ID0gMDtcbiAgICAgIGZvciAoaW5kZXggPSBfaSA9IDA7IDAgPD0gem9vbSA/IF9pIDwgem9vbSA6IF9pID4gem9vbTsgaW5kZXggPSAwIDw9IHpvb20gPyArK19pIDogLS1faSkge1xuICAgICAgICBtYXBJZE9mZnNldCArPSBNYXRoLnBvdyg0LCBpbmRleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFwSWRPZmZzZXQgKyAocm93IC0gMSkgKiByb3dzQ29sdW1uc0F0Wm9vbSArIGNvbHVtbiAtIDE7XG4gICAgfSxcbiAgICBhZGp1c3RDb29yZElmT3V0T2ZCb3VuZHM6IGZ1bmN0aW9uKGNvb3JkKSB7XG4gICAgICB2YXIgYWRqdXN0ZWRDb29yZDtcbiAgICAgIGFkanVzdGVkQ29vcmQgPSB7XG4gICAgICAgIGxhdDogY29vcmQubGF0LFxuICAgICAgICBsb246IGNvb3JkLmxvblxuICAgICAgfTtcbiAgICAgIGlmIChjb29yZC5sb24gPj0gTWFwQ29uc3RhbnRzLmxvbkVuZCkge1xuICAgICAgICBjb29yZC5sb24gPSBNYXBDb25zdGFudHMubG9uRW5kIC0gMC4wMDAwMTtcbiAgICAgIH0gZWxzZSBpZiAoY29vcmQubG9uIDwgTWFwQ29uc3RhbnRzLmxvblN0YXJ0KSB7XG4gICAgICAgIGNvb3JkLmxvbiA9IE1hcENvbnN0YW50cy5sb25TdGFydDtcbiAgICAgIH1cbiAgICAgIGlmIChjb29yZC5sYXQgPD0gTWFwQ29uc3RhbnRzLmxhdEVuZCkge1xuICAgICAgICBjb29yZC5sYXQgPSBNYXBDb25zdGFudHMubGF0RW5kICsgMC4wMDAwMTtcbiAgICAgIH0gZWxzZSBpZiAoY29vcmQubGF0ID4gTWFwQ29uc3RhbnRzLmxhdFN0YXJ0KSB7XG4gICAgICAgIGNvb3JkLmxhdCA9IE1hcENvbnN0YW50cy5sYXRTdGFydDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhZGp1c3RlZENvb3JkO1xuICAgIH1cbiAgfSk7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgZ2V0TWFwc0ZvckFyZWFBdFpvb206IGZ1bmN0aW9uKHRvcExlZnRDb29yZCwgYm90dG9tUmlnaHRDb29yZCwgem9vbSkge1xuICAgICAgdmFyIGJsSWQsIGJvdHRvbUxlZnRDb29yZCwgYnJJZCwgaWRzLCBrLCBzZXQsIHRsSWQsIHRvcFJpZ2h0Q29vcmQsIHRySWQsIHY7XG4gICAgICBib3R0b21MZWZ0Q29vcmQgPSBuZXcgQ29vcmQodG9wTGVmdENvb3JkLmxvbiwgYm90dG9tUmlnaHRDb29yZC5sYXQpO1xuICAgICAgdG9wUmlnaHRDb29yZCA9IG5ldyBDb29yZChib3R0b21SaWdodENvb3JkLmxvbiwgdG9wTGVmdENvb3JkLmxhdCk7XG4gICAgICB0bElkID0gdGhpcy5jYWxjdWxhdGVNYXBJZEZvck5vZGVBdFpvb20odG9wTGVmdENvb3JkLCB6b29tKTtcbiAgICAgIHRySWQgPSB0aGlzLmNhbGN1bGF0ZU1hcElkRm9yTm9kZUF0Wm9vbSh0b3BSaWdodENvb3JkLCB6b29tKTtcbiAgICAgIGJsSWQgPSB0aGlzLmNhbGN1bGF0ZU1hcElkRm9yTm9kZUF0Wm9vbShib3R0b21MZWZ0Q29vcmQsIHpvb20pO1xuICAgICAgYnJJZCA9IHRoaXMuY2FsY3VsYXRlTWFwSWRGb3JOb2RlQXRab29tKGJvdHRvbVJpZ2h0Q29vcmQsIHpvb20pO1xuICAgICAgc2V0ID0ge307XG4gICAgICBzZXRbdGxJZF0gPSAxO1xuICAgICAgc2V0W3RySWRdID0gMTtcbiAgICAgIHNldFtibElkXSA9IDE7XG4gICAgICBzZXRbYnJJZF0gPSAxO1xuICAgICAgaWRzID0gW107XG4gICAgICBmb3IgKGsgaW4gc2V0KSB7XG4gICAgICAgIHYgPSBzZXRba107XG4gICAgICAgIGlkcy5wdXNoKHBhcnNlSW50KGssIDEwKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaWRzO1xuICAgIH0sXG4gICAgY2FsY3VsYXRlWm9vbUZvckFyZWE6IGZ1bmN0aW9uKHRvcExlZnRDb29yZCwgYm90dG9tUmlnaHRDb29yZCkge1xuICAgICAgdmFyIGFjdERpc3RhbmNlU3F1YXJlLCBkaXN0LCBpbmRleCwgbGF0MSwgbGF0MiwgbG9uMSwgbG9uMiwgX2ksIF9sZW47XG4gICAgICBsb24xID0gcGFyc2VGbG9hdCh0b3BMZWZ0Q29vcmQubG9uKTtcbiAgICAgIGxvbjIgPSBwYXJzZUZsb2F0KGJvdHRvbVJpZ2h0Q29vcmQubG9uKTtcbiAgICAgIGxhdDEgPSBwYXJzZUZsb2F0KHRvcExlZnRDb29yZC5sYXQpO1xuICAgICAgbGF0MiA9IHBhcnNlRmxvYXQoYm90dG9tUmlnaHRDb29yZC5sYXQpO1xuICAgICAgYWN0RGlzdGFuY2VTcXVhcmUgPSBNYXRoLnBvdyhsb24xIC0gbG9uMiwgMikgKyBNYXRoLnBvdyhsYXQxIC0gbGF0MiwgMik7XG4gICAgICBmb3IgKGluZGV4ID0gX2kgPSAwLCBfbGVuID0gbWFwWm9vbURpYW1ldGVyU3F1YXJlcy5sZW5ndGg7IF9pIDwgX2xlbjsgaW5kZXggPSArK19pKSB7XG4gICAgICAgIGRpc3QgPSBtYXBab29tRGlhbWV0ZXJTcXVhcmVzW2luZGV4XTtcbiAgICAgICAgaWYgKGRpc3QgPCBhY3REaXN0YW5jZVNxdWFyZSkge1xuICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXBab29tRGlhbWV0ZXJTcXVhcmVzLmxlbmd0aCAtIDE7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwUGFydGl0aW9uU2VydmljZTtcbiIsInZhciBDb29yZDtcblxuQ29vcmQgPSBmdW5jdGlvbigpIHtcbiAgQ29vcmQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gQ29vcmQobG9uLCBsYXQpIHtcbiAgICAgIHRoaXMubGF0ID0gbGF0O1xuICAgICAgdGhpcy5sb24gPSBsb247XG4gICAgfVxuXG4gICAgcmV0dXJuIENvb3JkO1xuXG4gIH0pKCk7XG4gIHJldHVybiBDb29yZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29vcmQ7XG4iLCJ2YXIgQXBwQ3RybDtcblxuQXBwQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICR0aW1lb3V0LCBMb2dpblNlcnZpY2UpIHtcbiAgcmV0dXJuICRzY29wZS5zZWN1cml0eSA9IHtcbiAgICBpc0xvZ2dlZEluOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBMb2dpblNlcnZpY2UuaXNMb2dnZWRJbigpO1xuICAgIH0sXG4gICAgc2lnblVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBMb2dpblNlcnZpY2Uub3BlblJlZ2lzdHJhdGlvbkRpYWxvZygpO1xuICAgIH0sXG4gICAgbG9naW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5vcGVuTG9naW5EaWFsb2coKTtcbiAgICB9LFxuICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gTG9naW5TZXJ2aWNlLmxvZ291dCgpO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ3RybDtcbiIsInZhciBmbGFzaDtcblxuZmxhc2ggPSBmdW5jdGlvbigkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGU6IFwiPGJ1dHRvbj48L2J1dHRvbj5cIixcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBjb250ZW50OiBcIj1cIixcbiAgICAgIHRpbWVvdXQ6IFwiQFwiXG4gICAgfSxcbiAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgZWxlbWVudC5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgIGlmICghYXR0cnMudGltZW91dCkge1xuICAgICAgICBhdHRycy50aW1lb3V0ID0gMzAwMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgcmV0dXJuIHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuY29udGVudDtcbiAgICAgICAgfSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICB2YXIgaGlkZUVsZW1lbnQ7XG4gICAgICAgICAgaWYgKHZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsZW1lbnQudGV4dCh2YWx1ZSk7XG4gICAgICAgICAgZWxlbWVudC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgICAgc2NvcGUuY29udGVudCA9IFwiXCI7XG4gICAgICAgICAgaGlkZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNjb3BlLmNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuY29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuICR0aW1lb3V0KGhpZGVFbGVtZW50LCBwYXJzZUludChzY29wZS50aW1lb3V0LCAxMCkpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmbGFzaDtcbiIsInZhciBtYXRjaDtcblxubWF0Y2ggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBzY29wZToge1xuICAgICAgbWF0Y2g6ICc9J1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzLCBjdHJsKSB7XG4gICAgICByZXR1cm4gc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbW9kZWxWYWx1ZTtcbiAgICAgICAgbW9kZWxWYWx1ZSA9IGN0cmwuJG1vZGVsVmFsdWUgfHwgY3RybC4kJGludmFsaWRNb2RlbFZhbHVlO1xuICAgICAgICByZXR1cm4gKGN0cmwuJHByaXN0aW5lICYmIGFuZ3VsYXIuaXNVbmRlZmluZWQobW9kZWxWYWx1ZSkpIHx8IHNjb3BlLm1hdGNoID09PSBtb2RlbFZhbHVlO1xuICAgICAgfSwgZnVuY3Rpb24oY3VycmVudFZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjdHJsLiRzZXRWYWxpZGl0eSgnbWF0Y2gnLCBjdXJyZW50VmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaDtcbiIsInZhciBjbGFzc2VzTW9kdWxlLCBjb250cm9sbGVyc01vZHVsZSwgZGlyZWN0aXZlc01vZHVsZSwgc2VydmljZXNNb2R1bGU7XG5cbmNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJzZXJ2aWNlc1wiKTtcblxuc2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImNvbnRyb2xsZXJzXCIpO1xuXG5kaXJlY3RpdmVzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJkaXJlY3RpdmVzXCIpO1xuXG5jbGFzc2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJjbGFzc2VzXCIpO1xuXG5jb250cm9sbGVyc01vZHVsZS5jb250cm9sbGVyKCdBcHBDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9BcHBDdHJsJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5jb25zdGFudCgnTWFwQ29uc3RhbnRzJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9NYXBDb25zdGFudHMnKSk7XG5cbmNsYXNzZXNNb2R1bGUuZmFjdG9yeSgnQ29vcmQnLCByZXF1aXJlKCcuL2NsYXNzZXMvQ29vcmQnKSk7XG5cbmRpcmVjdGl2ZXNNb2R1bGUuZGlyZWN0aXZlKCdmbGFzaCcsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9mbGFzaCcpKTtcblxuZGlyZWN0aXZlc01vZHVsZS5kaXJlY3RpdmUoJ21hdGNoJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL21hdGNoJykpO1xuIiwidmFyIE1hcENvbnN0YW50cztcblxuTWFwQ29uc3RhbnRzID0ge1xuICBtYXhfem9vbTogOSxcbiAgZ29vZ2xlX21hcF9pbnRlcm5hbF9tYXBfem9vbV9kaWZmZXJlbmNlOiAzLFxuICBsYXRTdGFydDogNzAsXG4gIGxvblN0YXJ0OiAtMTAsXG4gIGxhdEVuZDogMzAsXG4gIGxvbkVuZDogNTUsXG4gIGRiUHJlZml4OiBcIm9uX3RoZV9yaWRlXCIsXG4gIG1heFpvb206IDE1LFxuICBpbmRleGVkRGJWZXJzaW9uOiA1LFxuICBpREJSb3V0ZVN0b3JlTmFtZTogXCJyb3V0ZTBcIlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb25zdGFudHM7XG4iLCJ2YXIgUHJvZmlsZUN0cmw7XG5cblByb2ZpbGVDdHJsID0gZnVuY3Rpb24oJHNjb3BlLCBEYXRhUHJvdmlkZXJTZXJ2aWNlLCBMb2dpblNlcnZpY2UsIFVzZXJTZXJ2aWNlKSB7XG4gIHZhciBwcm9taXNlO1xuICBwcm9taXNlID0gRGF0YVByb3ZpZGVyU2VydmljZS5nZXRVc2VySW5mbyhMb2dpblNlcnZpY2UuZ2V0U2lnbmVkSW5Vc2VyKCkpO1xuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICRzY29wZS51c2VyID0gZGF0YTtcbiAgICByZXR1cm4gJHNjb3BlLnNhdmVkVXNlciA9IGFuZ3VsYXIuY29weSgkc2NvcGUudXNlcik7XG4gIH0pO1xuICB3aW5kb3cuc2NvcGUgPSAkc2NvcGU7XG4gICRzY29wZS51c2VyID0ge307XG4gICRzY29wZS5zYXZlZFVzZXIgPSB7fTtcbiAgJHNjb3BlLm5ld1Bhc3N3b3JkID0gdm9pZCAwO1xuICAkc2NvcGUucGFzc3dvcmRDaGFuZ2UgPSB7fTtcbiAgJHNjb3BlLnByb2ZpbGVGbGFzaE1lc3NhZ2UgPSAkc2NvcGUucGFzc3dvcmRGbGFzaE1lc3NhZ2UgPSBcIlwiO1xuICAkc2NvcGUuZ2V0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29uc29sZS5sb2coJHNjb3BlLnByb2ZpbGVGbGFzaE1lc3NhZ2UpO1xuICB9O1xuICAkc2NvcGUuZ2V0Q3NzQ2xhc3NlcyA9IGZ1bmN0aW9uKG5nTW9kZWxDb250b2xsZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3I6IG5nTW9kZWxDb250b2xsZXIuJGludmFsaWQgJiYgbmdNb2RlbENvbnRvbGxlci4kZGlydHlcbiAgICB9O1xuICB9O1xuICAkc2NvcGUuc2hvd0Vycm9yID0gZnVuY3Rpb24obmdNb2RlbENvbnRyb2xsZXIsIGVycm9yKSB7XG4gICAgcmV0dXJuIG5nTW9kZWxDb250cm9sbGVyLiRlcnJvcltlcnJvcl07XG4gIH07XG4gICRzY29wZS5jYW5TYXZlRm9ybSA9IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICByZXR1cm4gZm9ybS4kdmFsaWQ7XG4gIH07XG4gICRzY29wZS5jYW5TYXZlUHJvZmlsZUZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgcmV0dXJuIGZvcm0uJHZhbGlkICYmICgkc2NvcGUudXNlci5lbWFpbCAhPT0gJHNjb3BlLnNhdmVkVXNlci5lbWFpbCk7XG4gIH07XG4gICRzY29wZS5zdWJtaXRQYXNzd29yZENoYW5nZUZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgaWYgKGZvcm0uJGRpcnR5ICYmIGZvcm0uJGludmFsaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcHJvbWlzZSA9IExvZ2luU2VydmljZS5jaGFuZ2VQYXNzd29yZCgkc2NvcGUudXNlci51c2VyTmFtZSwgJHNjb3BlLnBhc3N3b3JkQ2hhbmdlLnBhc3N3b3JkLCAkc2NvcGUucGFzc3dvcmRDaGFuZ2UubmV3UGFzc3dvcmQpO1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucGFzc3dvcmRDaGFuZ2UgPSB7fTtcbiAgICAgIGZvcm0uJHNldFByaXN0aW5lKCk7XG4gICAgICByZXR1cm4gJHNjb3BlLnBhc3N3b3JkRmxhc2hNZXNzYWdlID0gXCJjaGFuZ2VzIHNhdmVkXCI7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiAkc2NvcGUuc3VibWl0UHJvZmlsZUZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgaWYgKGZvcm0uJGRpcnR5ICYmIGZvcm0uJGludmFsaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCIxOiBcIiArICRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlKTtcbiAgICBwcm9taXNlID0gVXNlclNlcnZpY2UuY2hhbmdlUHJvZmlsZURhdGEoJHNjb3BlLnVzZXIudXNlck5hbWUsICRzY29wZS51c2VyKTtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKFVzZXIpIHtcbiAgICAgICRzY29wZS51c2VyID0gVXNlcjtcbiAgICAgICRzY29wZS5zYXZlZFVzZXIgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnVzZXIpO1xuICAgICAgZm9ybS4kc2V0UHJpc3RpbmUoKTtcbiAgICAgICRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlID0gXCJjaGFuZ2VzIHNhdmVkOiBcIiArIERhdGUubm93KCk7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCIyOiBcIiArICRzY29wZS5wcm9maWxlRmxhc2hNZXNzYWdlKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZmlsZUN0cmw7XG4iLCJ2YXIgY29udHJvbGxlcnNNb2R1bGUsIHNlcnZpY2VzTW9kdWxlO1xuXG5jb250cm9sbGVyc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiY29udHJvbGxlcnNcIik7XG5cbnNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJzZXJ2aWNlc1wiKTtcblxuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignUHJvZmlsZUN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1Byb2ZpbGVDdHJsJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdVc2VyU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvVXNlclNlcnZpY2UnKSk7XG4iLCJ2YXIgVXNlclNlcnZpY2U7XG5cblVzZXJTZXJ2aWNlID0gZnVuY3Rpb24oJGh0dHApIHtcbiAgdmFyIGZhY3RvcnlPYmo7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgY2hhbmdlUHJvZmlsZURhdGE6IGZ1bmN0aW9uKHVzZXJOYW1lLCBjaGFuZ2VPYmopIHtcbiAgICAgIHZhciBoYW5kbGVSZXN1bHQ7XG4gICAgICBoYW5kbGVSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQuZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiAkaHR0cC5wdXQoXCJ1c2Vycy9cIiArIHVzZXJOYW1lLCBjaGFuZ2VPYmopLnRoZW4oaGFuZGxlUmVzdWx0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVc2VyU2VydmljZTtcbiIsInZhciBMb2dpbkN0cmw7XG5cbkxvZ2luQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICR0aW1lb3V0LCBMb2dpblNlcnZpY2UsICRsb2NhdGlvbikge1xuICAkc2NvcGUuZm9ybSA9IHZvaWQgMDtcbiAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgJHNjb3BlLnN1Ym1pdEZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgdmFyIHByb21pc2U7XG4gICAgaWYgKGZvcm0uJHZhbGlkKSB7XG4gICAgICBwcm9taXNlID0gTG9naW5TZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyLnVzZXJOYW1lLCAkc2NvcGUudXNlci5wYXNzd29yZCk7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBMb2dpblNlcnZpY2UuY2xvc2VMb2dpbkRpYWxvZygpO1xuICAgICAgICByZXR1cm4gTG9naW5TZXJ2aWNlLnJldHJ5QXV0aGVudGljYXRpb24oKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCJiZWplbGVudGtlesOpc2kgaGliYVwiKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmdldENzc0NsYXNzZXMgPSBmdW5jdGlvbihuZ01vZGVsQ29udG9sbGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9yOiBuZ01vZGVsQ29udG9sbGVyLiRpbnZhbGlkICYmIG5nTW9kZWxDb250b2xsZXIuJGRpcnR5XG4gICAgfTtcbiAgfTtcbiAgJHNjb3BlLnNob3dFcnJvciA9IGZ1bmN0aW9uKG5nTW9kZWxDb250cm9sbGVyLCBlcnJvcikge1xuICAgIHJldHVybiBuZ01vZGVsQ29udHJvbGxlci4kZXJyb3JbZXJyb3JdO1xuICB9O1xuICByZXR1cm4gJHNjb3BlLmNhbmNlbEZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICBMb2dpblNlcnZpY2UuY2xvc2VMb2dpbkRpYWxvZygpO1xuICAgIHJldHVybiAkbG9jYXRpb24ucGF0aCgnL21hcCcpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbkN0cmw7XG4iLCJ2YXIgUmVnaXN0cmF0aW9uQ3RybDtcblxuUmVnaXN0cmF0aW9uQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICR0aW1lb3V0LCBMb2dpblNlcnZpY2UsICRsb2NhdGlvbikge1xuICAkc2NvcGUuZm9ybSA9IHZvaWQgMDtcbiAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgJHNjb3BlLnN1Ym1pdEZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgdmFyIFVzZXIsIHByb21pc2U7XG4gICAgaWYgKGZvcm0uJHZhbGlkKSB7XG4gICAgICBVc2VyID0ge1xuICAgICAgICB1c2VyTmFtZTogJHNjb3BlLnVzZXIudXNlck5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiAkc2NvcGUudXNlci5wYXNzd29yZCxcbiAgICAgICAgZW1haWw6ICRzY29wZS51c2VyLmVtYWlsXG4gICAgICB9O1xuICAgICAgcHJvbWlzZSA9IExvZ2luU2VydmljZS5zaWduVXAoVXNlcik7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBMb2dpblNlcnZpY2UuY2xvc2VSZWdpc3RyYXRpb25EaWFsb2coKTtcbiAgICAgICAgcmV0dXJuIExvZ2luU2VydmljZS5yZXRyeUF1dGhlbnRpY2F0aW9uKCk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwicmVnaXN6dHLDoWNpw7NzIGhpYmFcIik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5nZXRDc3NDbGFzc2VzID0gZnVuY3Rpb24obmdNb2RlbENvbnRvbGxlcikge1xuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogbmdNb2RlbENvbnRvbGxlci4kaW52YWxpZCAmJiBuZ01vZGVsQ29udG9sbGVyLiRkaXJ0eVxuICAgIH07XG4gIH07XG4gICRzY29wZS5zaG93RXJyb3IgPSBmdW5jdGlvbihuZ01vZGVsQ29udHJvbGxlciwgZXJyb3IpIHtcbiAgICByZXR1cm4gbmdNb2RlbENvbnRyb2xsZXIuJGVycm9yW2Vycm9yXTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS5jYW5jZWxGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgTG9naW5TZXJ2aWNlLmNsb3NlUmVnaXN0cmF0aW9uRGlhbG9nKCk7XG4gICAgcmV0dXJuICRsb2NhdGlvbi5wYXRoKCcvbWFwJyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZ2lzdHJhdGlvbkN0cmw7XG4iLCJ2YXIgY29udHJvbGxlcnNNb2R1bGUsIHNlcnZpY2VzTW9kdWxlO1xuXG5zZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIik7XG5cbmNvbnRyb2xsZXJzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJjb250cm9sbGVyc1wiKTtcblxuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignUmVnaXN0cmF0aW9uQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvUmVnaXN0cmF0aW9uQ3RybCcpKTtcblxuY29udHJvbGxlcnNNb2R1bGUuY29udHJvbGxlcignTG9naW5DdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9Mb2dpbkN0cmwnKSk7XG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ0xvZ2luU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvTG9naW5TZXJ2aWNlJykpO1xuXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdTZWN1cml0eVJldHJ5UXVldWUnLCByZXF1aXJlKCcuL3NlcnZpY2VzL1NlY3VyaXR5UmV0cnlRdWV1ZScpKTtcblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnU2VjdXJpdHlJbnRlcmNlcHRvcicsIHJlcXVpcmUoJy4vc2VydmljZXMvU2VjdXJpdHlJbnRlcmNlcHRvcicpKTtcbiIsInZhciBMb2dpblNlcnZpY2U7XG5cbkxvZ2luU2VydmljZSA9IGZ1bmN0aW9uKCRodHRwLCAkcSwgJGxvY2F0aW9uLCBTZWN1cml0eVJldHJ5UXVldWUsICRpb25pY1BvcHVwLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgJHdpbmRvdykge1xuICB2YXIgJHNjb3BlLCBmYWN0b3J5T2JqLCByZWRpcmVjdDtcbiAgJHNjb3BlID0gJHJvb3RTY29wZS4kbmV3KCk7XG4gIFNlY3VyaXR5UmV0cnlRdWV1ZS5vbkl0ZW1BZGRlZENhbGxiYWNrcy5wdXNoKGZ1bmN0aW9uKHJldHJ5SXRlbSkge1xuICAgIGlmIChTZWN1cml0eVJldHJ5UXVldWUuaGFzTW9yZSgpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInJldHJ5IGxlZnV0XCIpO1xuICAgICAgcmV0dXJuIGZhY3RvcnlPYmouc2hvd0xvZ2luRGlhbG9nKCk7XG4gICAgfVxuICB9KTtcbiAgJHNjb3BlLmxvZ2luRGlhbG9nID0gdm9pZCAwO1xuICAkc2NvcGUucmVnaXN0cmF0aW9uRGlhbG9nID0gdm9pZCAwO1xuICAkc2NvcGUucmVnaXN0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcInJlZ2lzdGVyXCIpO1xuICAgIGlmICgkc2NvcGUubG9naW5EaWFsb2cgIT09IHZvaWQgMCkge1xuICAgICAgJHNjb3BlLmxvZ2luRGlhbG9nLmNsb3NlKCk7XG4gICAgICAkc2NvcGUubG9naW5EaWFsb2cgPSB2b2lkIDA7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoJHNjb3BlLm9wZW5SZWdpc3RyYXRpb25EaWFsb2csIDEpO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgIT09IHZvaWQgMCkge1xuICAgICAgJHNjb3BlLnJlZ2lzdHJhdGlvbkRpYWxvZy5jbG9zZSgpO1xuICAgICAgJHNjb3BlLnJlZ2lzdHJhdGlvbkRpYWxvZyA9IHZvaWQgMDtcbiAgICAgIHJldHVybiAkdGltZW91dCgkc2NvcGUub3BlbkxvZ2luRGlhbG9nLCAxKTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmRhdGEgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnJlZ2lzdHJhdGlvbkRpYWxvZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gb3BlbiBhIGRpYWxvZyB0aGF0IGlzIGFscmVhZHkgb3BlbiEnKTtcbiAgICB9XG4gICAgcmV0dXJuICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgPSAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgIHRlbXBsYXRlVXJsOiBcIi90ZW1wbGF0ZXMvcmVnaXN0cmF0aW9uLmh0bWxcIixcbiAgICAgIHRpdGxlOiAnUGxlYXNlIHNpZ24gdXAnLFxuICAgICAgc2NvcGU6ICRzY29wZVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUub3BlbkxvZ2luRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmRhdGEgPSB7fTtcbiAgICBpZiAoJHNjb3BlLmxvZ2luRGlhbG9nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBvcGVuIGEgZGlhbG9nIHRoYXQgaXMgYWxyZWFkeSBvcGVuIScpO1xuICAgIH1cbiAgICAkc2NvcGUubG9naW5EaWFsb2cgPSAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgIHRlbXBsYXRlVXJsOiBcIi90ZW1wbGF0ZXMvbG9naW4uaHRtbFwiLFxuICAgICAgdGl0bGU6ICdQbGVhc2UgbG9nIGluJyxcbiAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICB9KTtcbiAgICAkc2NvcGUucmV0cnlBdXRoZW50aWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFNlY3VyaXR5UmV0cnlRdWV1ZS5yZXRyeUFsbCgpO1xuICAgIH07XG4gICAgcmV0dXJuICRzY29wZS5jYW5jZWxBdXRoZW50aWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgU2VjdXJpdHlSZXRyeVF1ZXVlLmNhbmNlbEFsbCgpO1xuICAgICAgcmV0dXJuIHJlZGlyZWN0KCk7XG4gICAgfTtcbiAgfTtcbiAgcmVkaXJlY3QgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB1cmwgPSB1cmwgfHwgJy8nO1xuICAgIHJldHVybiAkbG9jYXRpb24ucGF0aCh1cmwpO1xuICB9O1xuICBmYWN0b3J5T2JqID0ge1xuICAgIG9wZW5SZWdpc3RyYXRpb25EaWFsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRzY29wZS5vcGVuUmVnaXN0cmF0aW9uRGlhbG9nKCk7XG4gICAgfSxcbiAgICBvcGVuTG9naW5EaWFsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRzY29wZS5vcGVuTG9naW5EaWFsb2coKTtcbiAgICB9LFxuICAgIGNsb3NlTG9naW5EaWFsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmxvZ2luRGlhbG9nLmNsb3NlKCk7XG4gICAgICByZXR1cm4gJHNjb3BlLmxvZ2luRGlhbG9nID0gdm9pZCAwO1xuICAgIH0sXG4gICAgY2xvc2VSZWdpc3RyYXRpb25EaWFsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnJlZ2lzdHJhdGlvbkRpYWxvZy5jbG9zZSgpO1xuICAgICAgcmV0dXJuICRzY29wZS5yZWdpc3RyYXRpb25EaWFsb2cgPSB2b2lkIDA7XG4gICAgfSxcbiAgICByZXRyeUF1dGhlbnRpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBTZWN1cml0eVJldHJ5UXVldWUucmV0cnlBbGwoKTtcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbih1c2VyTmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgaGFuZGxlUmVzdWx0O1xuICAgICAgaGFuZGxlUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LmRhdGEudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcInVzZXJOYW1lXCIsIGRhdGEudXNlck5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgnbG9naW4nLCB7XG4gICAgICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9KS50aGVuKGhhbmRsZVJlc3VsdCk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIH0sXG4gICAgc2lnblVwOiBmdW5jdGlvbihVc2VyKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIGhhbmRsZVJlc3VsdDtcbiAgICAgIGhhbmRsZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJ1c2VyTmFtZVwiLCBkYXRhLnVzZXJOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ3NpZ25VcCcsIFVzZXIpLnRoZW4oaGFuZGxlUmVzdWx0KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJOYW1lXCIpO1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL21hcFwiO1xuICAgIH0sXG4gICAgc2hvd0xvZ2luRGlhbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkc2NvcGUub3BlbkxvZ2luRGlhbG9nKCk7XG4gICAgfSxcbiAgICBhZGRVc2VyOiBmdW5jdGlvbihVc2VyKSB7XG4gICAgICB2YXIgaGFuZGxlUmVzdWx0O1xuICAgICAgaGFuZGxlUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LmRhdGEudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgndXNlcnMvbmV3JywgVXNlcikudGhlbihoYW5kbGVSZXN1bHQpO1xuICAgIH0sXG4gICAgcmVtb3ZlVXNlcjogZnVuY3Rpb24oVXNlcikge1xuICAgICAgdmFyIGhhbmRsZVJlc3VsdDtcbiAgICAgIGhhbmRsZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuICRodHRwW1wiZGVsZXRlXCJdKFwidXNlcnNcIiwge1xuICAgICAgICBpZDogVXNlci5pZFxuICAgICAgfSkudGhlbihoYW5kbGVSZXN1bHQpO1xuICAgIH0sXG4gICAgZ2V0U2lnbmVkSW5Vc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlciwgcHJvbWlzZSwgdXNlck5hbWU7XG4gICAgICB1c2VyTmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJ1c2VyTmFtZVwiKTtcbiAgICAgIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICAgIGlmICh1c2VyTmFtZSkge1xuICAgICAgICByZXR1cm4gdXNlck5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gU2VjdXJpdHlSZXRyeVF1ZXVlLnB1c2hSZXRyeUZuKCd1bmF1dGhvcml6ZWQtc2VydmVyJywgZmFjdG9yeU9iai5nZXRTaWduZWRJblVzZXIpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFVzZXJOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlck5hbWVcIik7XG4gICAgfSxcbiAgICBpc0xvZ2dlZEluOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlck5hbWVcIikgIT0gbnVsbDtcbiAgICB9LFxuICAgIGNoYW5nZVBhc3N3b3JkOiBmdW5jdGlvbih1c2VyTmFtZSwgb2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG4gICAgICB2YXIgaGFuZGxlUmVzdWx0LCByZXF1ZXN0RGF0YTtcbiAgICAgIGhhbmRsZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdC5kYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICAgICAgb2xkUGFzc3dvcmQ6IG9sZFBhc3N3b3JkLFxuICAgICAgICBuZXdQYXNzd29yZDogbmV3UGFzc3dvcmRcbiAgICAgIH07XG4gICAgICByZXR1cm4gJGh0dHAucHV0KFwiY2hhbmdlUGFzc3dvcmRcIiwgcmVxdWVzdERhdGEpLnRoZW4oaGFuZGxlUmVzdWx0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpblNlcnZpY2U7XG4iLCJ2YXIgU2VjdXJpdHlJbnRlcmNlcHRvcjtcblxuU2VjdXJpdHlJbnRlcmNlcHRvciA9IGZ1bmN0aW9uKCRpbmplY3RvciwgU2VjdXJpdHlSZXRyeVF1ZXVlKSB7XG4gIHJldHVybiBmdW5jdGlvbihwcm9taXNlKSB7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbihvcmlnaW5hbFJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxSZXNwb25zZTtcbiAgICB9LCBmdW5jdGlvbihvcmlnaW5hbFJlc3BvbnNlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImxvZ2luIGVycm9yXCIpO1xuICAgICAgY29uc29sZS5sb2cob3JpZ2luYWxSZXNwb25zZS5zdGF0dXMpO1xuICAgICAgaWYgKG9yaWdpbmFsUmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgcHJvbWlzZSA9IFNlY3VyaXR5UmV0cnlRdWV1ZS5wdXNoUmV0cnlGbigndW5hdXRob3JpemVkLXNlcnZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCckaHR0cCcpKG9yaWdpbmFsUmVzcG9uc2UuY29uZmlnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2VjdXJpdHlJbnRlcmNlcHRvcjtcbiIsInZhciBTZWN1cml0eVJldHJ5UXVldWU7XG5cblNlY3VyaXR5UmV0cnlRdWV1ZSA9IGZ1bmN0aW9uKCRxLCAkbG9nKSB7XG4gIHZhciByZXRyeVF1ZXVlLCBzZXJ2aWNlO1xuICByZXRyeVF1ZXVlID0gW107XG4gIHNlcnZpY2UgPSB7XG4gICAgb25JdGVtQWRkZWRDYWxsYmFja3M6IFtdLFxuICAgIGhhc01vcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJldHJ5UXVldWUubGVuZ3RoID4gMDtcbiAgICB9LFxuICAgIHB1c2g6IGZ1bmN0aW9uKHJldHJ5SXRlbSkge1xuICAgICAgcmV0cnlRdWV1ZS5wdXNoKHJldHJ5SXRlbSk7XG4gICAgICByZXR1cm4gYW5ndWxhci5mb3JFYWNoKHNlcnZpY2Uub25JdGVtQWRkZWRDYWxsYmFja3MsIGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgIHZhciBlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBjYihyZXRyeUl0ZW0pO1xuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICAgIHJldHVybiAkbG9nLmVycm9yKCdzZWN1cml0eVJldHJ5UXVldWUucHVzaChyZXRyeUl0ZW0pOiBjYWxsYmFjayB0aHJldyBhbiBlcnJvcicgKyBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBwdXNoUmV0cnlGbjogZnVuY3Rpb24ocmVhc29uLCByZXRyeUZuKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJldHJ5SXRlbTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHJ5Rm4gPSByZWFzb247XG4gICAgICAgIHJlYXNvbiA9IHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJldHJ5SXRlbSA9IHtcbiAgICAgICAgcmVhc29uOiByZWFzb24sXG4gICAgICAgIHJldHJ5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJHEud2hlbihyZXRyeUZuKCkpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICB9LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2VydmljZS5wdXNoKHJldHJ5SXRlbSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHJldHJ5UmVhc29uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlLmhhc01vcmUoKSAmJiByZXRyeVF1ZXVlWzBdLnJlYXNvbjtcbiAgICB9LFxuICAgIGNhbmNlbEFsbDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgd2hpbGUgKHNlcnZpY2UuaGFzTW9yZSgpKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2gocmV0cnlRdWV1ZS5zaGlmdCgpLmNhbmNlbCgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9LFxuICAgIHJldHJ5QWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICB3aGlsZSAoc2VydmljZS5oYXNNb3JlKCkpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChyZXRyeVF1ZXVlLnNoaWZ0KCkucmV0cnkoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfVxuICB9O1xuICByZXR1cm4gc2VydmljZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2VjdXJpdHlSZXRyeVF1ZXVlO1xuIiwidmFyIERhdGFQcm92aWRlclNlcnZpY2U7XG5cbkRhdGFQcm92aWRlclNlcnZpY2UgPSBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgdmFyIGZhY3RvcnlPYmo7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgbG9hZFBsYWNlSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvaW5mbycpO1xuICAgIH0sXG4gICAgbG9hZFJvdXRlSW5mbzogZnVuY3Rpb24oem9vbSwgbWFwcykge1xuICAgICAgdmFyIG1hcHNTdHIsIHJldDtcbiAgICAgIG1hcHNTdHIgPSBtYXBzLmpvaW4oKTtcbiAgICAgIHJldHVybiByZXQgPSAkaHR0cC5nZXQoXCJyb3V0ZS9ldXJvdmVsb182L1wiICsgem9vbSArIFwiL1wiICsgbWFwc1N0cik7XG4gICAgfSxcbiAgICBsb2FkTWFwQXJlYTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9tYXAvMCcpO1xuICAgIH0sXG4gICAgc2F2ZVBsYWNlSW5mbzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9pbmZvJywgZGF0YSk7XG4gICAgfSxcbiAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24odXNlck5hbWUpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICRodHRwLmdldChcIi91c2Vycy9cIiArIHVzZXJOYW1lKS50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgaWYgKHJlc3AuZGF0YS50aGVuICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcC5kYXRhLnRoZW4oZnVuY3Rpb24ocmVzcDIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXNlclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3AyKTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHJlc3AyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhUHJvdmlkZXJTZXJ2aWNlO1xuIiwidmFyIExvY2FsRGF0YVByb3ZpZGVyU2VydmljZSxcbiAgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbkxvY2FsRGF0YVByb3ZpZGVyU2VydmljZSA9IGZ1bmN0aW9uKCRodHRwLCAkcSwgTWFwQ29uc3RhbnRzKSB7XG4gIHZhciBkYiwgZmFjdG9yeU9iaiwgaWRiU3VwcG9ydGVkLCBvcGVuQ29ubmVjdGlvbiwgc2hvdWxkUG9wdWxhdGVEYjtcbiAgaWRiU3VwcG9ydGVkID0gZmFsc2U7XG4gIGlmIChfX2luZGV4T2YuY2FsbCh3aW5kb3csIFwiaW5kZXhlZERCXCIpID49IDApIHtcbiAgICBpZGJTdXBwb3J0ZWQgPSB0cnVlO1xuICB9XG4gIGRiID0gdm9pZCAwO1xuICBvcGVuQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb25uUmVxdWVzdDtcbiAgICBjb25uUmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKE1hcENvbnN0YW50cy5kYlByZWZpeCwgTWFwQ29uc3RhbnRzLmluZGV4ZWREYlZlcnNpb24pO1xuICAgIGNvbm5SZXF1ZXN0Lm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB0aGlzREI7XG4gICAgICBjb25zb2xlLmxvZyhcInVwZ3JhZGVuZWVkZWVkXCIpO1xuICAgICAgdGhpc0RCID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgaWYgKCF0aGlzREIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhcImV1cm92ZWxvXzZcIikpIHtcbiAgICAgICAgdGhpc0RCLmNyZWF0ZU9iamVjdFN0b3JlKFwiZXVyb3ZlbG9fNlwiLCB7XG4gICAgICAgICAgYXV0b0luY3JlbWVudDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpc0RCLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoXCJ1c2Vyc1wiKSkge1xuICAgICAgICB0aGlzREIuY3JlYXRlT2JqZWN0U3RvcmUoXCJ1c2Vyc1wiLCB7XG4gICAgICAgICAgYXV0b0luY3JlbWVudDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpc0RCLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoXCJ2b3Rlc1wiKSkge1xuICAgICAgICByZXR1cm4gdGhpc0RCLmNyZWF0ZU9iamVjdFN0b3JlKFwidm90ZXNcIiwge1xuICAgICAgICAgIGF1dG9JbmNyZW1lbnQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25uUmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgY29uc29sZS5sb2coXCJFcnJvclwiKTtcbiAgICAgIHJldHVybiBjb25zb2xlLmRpcihlKTtcbiAgICB9O1xuICAgIHJldHVybiBjb25uUmVxdWVzdDtcbiAgfTtcbiAgc2hvdWxkUG9wdWxhdGVEYiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZCwgb3BlblJlcXVlc3QsIHF1ZXJ5RGJJZlRoZXJlQXJlQW55RGF0YTtcbiAgICBxdWVyeURiSWZUaGVyZUFyZUFueURhdGEgPSBmdW5jdGlvbihkZWYpIHtcbiAgICAgIHZhciBjdXJzb3IsIHJvdXRlLCBzdG9yZSwgdHJhbnNhY3Rpb247XG4gICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFtcImV1cm92ZWxvXzZcIl0sIFwicmVhZG9ubHlcIik7XG4gICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwiZXVyb3ZlbG9fNlwiKTtcbiAgICAgIGN1cnNvciA9IHN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICAgIHJvdXRlID0gW107XG4gICAgICByZXR1cm4gY3Vyc29yLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHJlcztcbiAgICAgICAgcmVzID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzaG91bGQnbnRcIik7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNob3VsZFwiKTtcbiAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgaWYgKGRiKSB7XG4gICAgICBxdWVyeURiSWZUaGVyZUFyZUFueURhdGEoZGVmZXJyZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKCk7XG4gICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICByZXR1cm4gcXVlcnlEYklmVGhlcmVBcmVBbnlEYXRhKGRlZmVycmVkKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICBmYWN0b3J5T2JqID0ge1xuICAgIGxvYWRSb3V0ZUluZm86IGZ1bmN0aW9uKHpvb20sIG1hcHMpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgbG9hZFJvdXRlSW5mb0Zyb21JbmRleGVkRGIsIHNob3VsZFBvcHVsYXRlUHJvbWlzZSwgdGhhdDtcbiAgICAgIGxvYWRSb3V0ZUluZm9Gcm9tSW5kZXhlZERiID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciBjdXJzb3IsIHJvdXRlLCBzdG9yZSwgdHJhbnNhY3Rpb247XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1wiZXVyb3ZlbG9fNlwiXSwgXCJyZWFkb25seVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcImV1cm92ZWxvXzZcIik7XG4gICAgICAgIGN1cnNvciA9IHN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICAgICAgcm91dGUgPSBbXTtcbiAgICAgICAgY3Vyc29yLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgbm9kZSwgcmVzO1xuICAgICAgICAgIHJlcyA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICBub2RlID0gcmVzLnZhbHVlO1xuICAgICAgICAgICAgbm9kZS5faWQgPSByZXMua2V5O1xuICAgICAgICAgICAgcm91dGUucHVzaChub2RlKTtcbiAgICAgICAgICAgIHJldHVybiByZXNbXCJjb250aW51ZVwiXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKHJvdXRlKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBzaG91bGRQb3B1bGF0ZVByb21pc2UgPSBzaG91bGRQb3B1bGF0ZURiKCk7XG4gICAgICB0aGF0ID0gdGhpcztcbiAgICAgIHNob3VsZFBvcHVsYXRlUHJvbWlzZS50aGVuKGZ1bmN0aW9uKHNob3VsZCkge1xuICAgICAgICB2YXIgcHJvbWlzZTtcbiAgICAgICAgaWYgKHNob3VsZCkge1xuICAgICAgICAgIHByb21pc2UgPSB0aGF0LmNsZWFyQW5kUG9wdWxhdGVEYkZvclRlc3RpbmcoKTtcbiAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvYWRSb3V0ZUluZm9Gcm9tSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbG9hZFJvdXRlSW5mb0Zyb21JbmRleGVkRGIoZGVmZXJyZWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgY2xlYXJBbmRQb3B1bGF0ZURiRm9yVGVzdGluZzogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xlYXJBbmRwb3B1bGF0ZURiRnJvbUFycmF5LCBjbGVhckFuZHBvcHVsYXRlRGJGcm9tU2VydmVyLCBkZWZlcnJlZCwgb3BlblJlcXVlc3Q7XG4gICAgICBjbGVhckFuZHBvcHVsYXRlRGJGcm9tU2VydmVyID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciBkYlByb21pc2U7XG4gICAgICAgIGRiUHJvbWlzZSA9ICRodHRwLmdldChcImR1bW15RGF0YWJhc2VcIik7XG4gICAgICAgIGRiUHJvbWlzZS5zdWNjZXNzKGZ1bmN0aW9uKG5vZGVzKSB7XG4gICAgICAgICAgdmFyIG5vZGUsIHN0b3JlLCB0cmFuc2FjdGlvbiwgX2ksIF9sZW47XG4gICAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJldXJvdmVsb182XCJdLCBcInJlYWR3cml0ZVwiKTtcbiAgICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwiZXVyb3ZlbG9fNlwiKTtcbiAgICAgICAgICBzdG9yZS5jbGVhcigpO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gbm9kZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2Rlc1tfaV07XG4gICAgICAgICAgICBzdG9yZS5hZGQobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRiUHJvbWlzZS5lcnJvcihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiZmFpbHVyZVwiKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgY2xlYXJBbmRwb3B1bGF0ZURiRnJvbUFycmF5ID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciBub2RlLCBzdG9yZSwgdHJhbnNhY3Rpb24sIF9pLCBfbGVuO1xuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFtcImV1cm92ZWxvXzZcIl0sIFwicmVhZHdyaXRlXCIpO1xuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwiZXVyb3ZlbG9fNlwiKTtcbiAgICAgICAgc3RvcmUuY2xlYXIoKTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBzbWFsbERhdGFiYXNlRm9yVGVzdGluZy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIG5vZGUgPSBzbWFsbERhdGFiYXNlRm9yVGVzdGluZ1tfaV07XG4gICAgICAgICAgbm9kZS52b3RlX3BvcyA9IDA7XG4gICAgICAgICAgbm9kZS52b3RlX25lZyA9IDA7XG4gICAgICAgICAgbm9kZS51c2VyID0gXCJnc2FudGFcIjtcbiAgICAgICAgICBzdG9yZS5hZGQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgaWYgKGRiKSB7XG4gICAgICAgIGNsZWFyQW5kcG9wdWxhdGVEYkZyb21BcnJheShkZWZlcnJlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKCk7XG4gICAgICAgIG9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICByZXR1cm4gY2xlYXJBbmRwb3B1bGF0ZURiRnJvbUFycmF5KGRlZmVycmVkKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgdXBkYXRlTm9kZTogZnVuY3Rpb24oaWQsIHByb3BzKSB7XG4gICAgICB2YXIgcmVxdWVzdCwgc3RvcmUsIHRyYW5zYWN0aW9uO1xuICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJldXJvdmVsb182XCJdLCBcInJlYWR3cml0ZVwiKTtcbiAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJldXJvdmVsb182XCIpO1xuICAgICAgcmVxdWVzdCA9IHN0b3JlLnB1dChwcm9wcywgaWQpO1xuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcInN1Y2Nlc3Mgc2F2aW5nIG5vZGVcIik7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiZXJyb3Igc2F2aW5nIG5vZGVcIik7XG4gICAgICB9O1xuICAgIH0sXG4gICAgYWRkTm9kZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHJlcXVlc3QsIHN0b3JlLCB0cmFuc2FjdGlvbjtcbiAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1wiZXVyb3ZlbG9fNlwiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwiZXVyb3ZlbG9fNlwiKTtcbiAgICAgIHJlcXVlc3QgPSBzdG9yZS5hZGQobm9kZSk7XG4gICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwic3VjY2VzcyBhZGRpbmcgbm9kZVwiKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCJlcnJvciBhZGRpbmcgbm9kZVwiKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBnZXRVc2VyOiBmdW5jdGlvbih1c2VyTmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgbG9hZFVzZXJJbmZvRnJvbUluZGV4ZWREYiwgb3BlblJlcXVlc3Q7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBsb2FkVXNlckluZm9Gcm9tSW5kZXhlZERiID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciBjdXJzb3IsIHN0b3JlLCB0cmFuc2FjdGlvbiwgdXNlcjtcbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJ1c2Vyc1wiXSwgXCJyZWFkb25seVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcInVzZXJzXCIpO1xuICAgICAgICBjdXJzb3IgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgIHVzZXIgPSB2b2lkIDA7XG4gICAgICAgIGN1cnNvci5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIGFjdFVzZXI7XG4gICAgICAgICAgYWN0VXNlciA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICBpZiAoYWN0VXNlciAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoKGFjdFVzZXIudmFsdWUgIT0gbnVsbCkgJiYgYWN0VXNlci52YWx1ZS51c2VyTmFtZSA9PT0gdXNlck5hbWUpIHtcbiAgICAgICAgICAgICAgdXNlciA9IGFjdFVzZXIudmFsdWU7XG4gICAgICAgICAgICAgIHVzZXIuaWQgPSBhY3RVc2VyLmtleTtcbiAgICAgICAgICAgICAgcmV0dXJuIHVzZXIucGFzc3dvcmQgPSBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFjdFVzZXJbXCJjb250aW51ZVwiXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZSh1c2VyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZi5yZWplY3QoXCJsb2dpbiBlcnJvclwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgaWYgKGRiKSB7XG4gICAgICAgIGxvYWRVc2VySW5mb0Zyb21JbmRleGVkRGIoZGVmZXJyZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvcGVuUmVxdWVzdFwiKTtcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpO1xuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgcmV0dXJuIGxvYWRVc2VySW5mb0Zyb21JbmRleGVkRGIoZGVmZXJyZWQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICBhZGRVc2VyOiBmdW5jdGlvbihVc2VyKSB7XG4gICAgICB2YXIgYWRkVXNlclRvSW5kZXhlZERiLCBkZWZlcnJlZCwgb3BlblJlcXVlc3Q7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBhZGRVc2VyVG9JbmRleGVkRGIgPSBmdW5jdGlvbihkZWYpIHtcbiAgICAgICAgdmFyIHJlcXVlc3QsIHN0b3JlLCB0cmFuc2FjdGlvbjtcbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJ1c2Vyc1wiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJ1c2Vyc1wiKTtcbiAgICAgICAgcmVxdWVzdCA9IHN0b3JlLmFkZChVc2VyKTtcbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZXNvbHZlKFVzZXIpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVqZWN0KFwicHJvYmxlbSB3aXRoIHNpZ25pbmcgdXBcIik7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgaWYgKGRiKSB7XG4gICAgICAgIGFkZFVzZXJUb0luZGV4ZWREYihkZWZlcnJlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9wZW5SZXF1ZXN0XCIpO1xuICAgICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKCk7XG4gICAgICAgIG9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICByZXR1cm4gYWRkVXNlclRvSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgdXBkYXRlVXNlcjogZnVuY3Rpb24odXNlck5hbWUsIHVwZGF0ZU9iaikge1xuICAgICAgdmFyIGRlZmVycmVkLCBwcm9taXNlO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcHJvbWlzZSA9IHRoaXMuZ2V0VXNlcih1c2VyTmFtZSwgdm9pZCAwKTtcbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBrLCByZXF1ZXN0LCBzdG9yZSwgdHJhbnNhY3Rpb24sIHY7XG4gICAgICAgIGZvciAoayBpbiBkYXRhKSB7XG4gICAgICAgICAgdiA9IGRhdGFba107XG4gICAgICAgICAgaWYgKHVwZGF0ZU9ialtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBkYXRhW2tdID0gdXBkYXRlT2JqW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFtcInVzZXJzXCJdLCBcInJlYWR3cml0ZVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcInVzZXJzXCIpO1xuICAgICAgICByZXF1ZXN0ID0gc3RvcmUucHV0KGRhdGEsIGRhdGEuaWQpO1xuICAgICAgICByZXR1cm4gcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgcmVtb3ZlVXNlcjogZnVuY3Rpb24oVXNlcikge1xuICAgICAgdmFyIGRlZmVycmVkLCBvcGVuUmVxdWVzdCwgcmVtb3ZlZFVzZXJGcm9tSW5kZXhlZERiO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVtb3ZlZFVzZXJGcm9tSW5kZXhlZERiID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZXF1ZXN0LCBzdG9yZSwgdHJhbnNhY3Rpb247XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlVXNlclwiKTtcbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJ1c2Vyc1wiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICAgIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJ1c2Vyc1wiKTtcbiAgICAgICAgcmVxdWVzdCA9IHN0b3JlW1wiZGVsZXRlXCJdKFVzZXIuaWQpO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUoVXNlcik7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZWplY3QoXCJwcm9ibGVtIHdpdGggZGVsZXRpbmcgdXNlclwiKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICBpZiAoZGIpIHtcbiAgICAgICAgcmVtb3ZlZFVzZXJGcm9tSW5kZXhlZERiKGRlZmVycmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib3BlblJlcXVlc3RcIik7XG4gICAgICAgIG9wZW5SZXF1ZXN0ID0gb3BlbkNvbm5lY3Rpb24oKTtcbiAgICAgICAgb3BlblJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGRiID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHJldHVybiByZW1vdmVkVXNlckZyb21JbmRleGVkRGIoZGVmZXJyZWQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICBnZXRVc2VyVm90ZUZvck5vZGU6IGZ1bmN0aW9uKHVzZXJOYW1lLCBub2RlSWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgbG9hZFVzZXJWb3RlRm9yTm9kZSwgb3BlblJlcXVlc3Q7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBsb2FkVXNlclZvdGVGb3JOb2RlID0gZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciBjdXJzb3IsIHN0b3JlLCB0cmFuc2FjdGlvbiwgdm90ZTtcbiAgICAgICAgbm9kZUlkID0gcGFyc2VJbnQobm9kZUlkKTtcbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJ2b3Rlc1wiXSwgXCJyZWFkb25seVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcInZvdGVzXCIpO1xuICAgICAgICBjdXJzb3IgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgIHZvdGUgPSB2b2lkIDA7XG4gICAgICAgIGN1cnNvci5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIGFjdFZvdGU7XG4gICAgICAgICAgYWN0Vm90ZSA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICBpZiAoYWN0Vm90ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoYWN0Vm90ZS52YWx1ZS51c2VyID09PSB1c2VyTmFtZSAmJiBhY3RWb3RlLnZhbHVlLm5vZGUgPT09IG5vZGVJZCkge1xuICAgICAgICAgICAgICB2b3RlID0gYWN0Vm90ZS52YWx1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHZvdGUuaWQgPSBhY3RWb3RlLmtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBhY3RWb3RlW1wiY29udGludWVcIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZSh2b3RlKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICBpZiAoZGIpIHtcbiAgICAgICAgbG9hZFVzZXJWb3RlRm9yTm9kZShkZWZlcnJlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcGVuUmVxdWVzdCA9IG9wZW5Db25uZWN0aW9uKCk7XG4gICAgICAgIG9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBkYiA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICByZXR1cm4gbG9hZFVzZXJWb3RlRm9yTm9kZShkZWZlcnJlZCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHNldFVzZXJWb3RlRm9yTm9kZTogZnVuY3Rpb24odXNlck5hbWUsIG5vZGVJZCwgdm90ZSkge1xuICAgICAgdmFyIGRlZmVycmVkLCBwcm9taXNlLCBzZXRVc2VyVm90ZUZvck5vZGVUb0luZGV4RGI7XG4gICAgICBzZXRVc2VyVm90ZUZvck5vZGVUb0luZGV4RGIgPSBmdW5jdGlvbihkZWYsIGRhdGEsIGlzVXBkYXRlKSB7XG4gICAgICAgIHZhciByZXF1ZXN0LCBzdG9yZSwgdHJhbnNhY3Rpb247XG4gICAgICAgIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oW1widm90ZXNcIl0sIFwicmVhZHdyaXRlXCIpO1xuICAgICAgICBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFwidm90ZXNcIik7XG4gICAgICAgIGlmIChpc1VwZGF0ZSkge1xuICAgICAgICAgIHJlcXVlc3QgPSBzdG9yZS5wdXQoZGF0YSwgZGF0YS5pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVxdWVzdCA9IHN0b3JlLmFkZChkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gZGVmLnJlc29sdmUoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZi5yZWplY3QoXCJwcm9ibGVtIHdpdGggZGVsZXRpbmcgdXNlclwiKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICBwcm9taXNlID0gZmFjdG9yeU9iai5nZXRVc2VyVm90ZUZvck5vZGUodXNlck5hbWUsIG5vZGVJZCk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgICAgICAgZGF0YS52b3RlID0gdm90ZTtcbiAgICAgICAgICByZXR1cm4gc2V0VXNlclZvdGVGb3JOb2RlVG9JbmRleERiKGRlZmVycmVkLCBkYXRhLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgdXNlcjogdXNlck5hbWUsXG4gICAgICAgICAgICBub2RlOiBub2RlSWQsXG4gICAgICAgICAgICB2b3RlOiB2b3RlXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gc2V0VXNlclZvdGVGb3JOb2RlVG9JbmRleERiKGRlZmVycmVkLCBkYXRhLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICBnZXRWb3Rlc0Zvck5vZGU6IGZ1bmN0aW9uKG5vZGVJZCkge1xuICAgICAgdmFyIGRlZmVycmVkLCBsb2FkVXNlclZvdGVGb3JOb2RlLCBvcGVuUmVxdWVzdDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIGxvYWRVc2VyVm90ZUZvck5vZGUgPSBmdW5jdGlvbihkZWYpIHtcbiAgICAgICAgdmFyIGN1cnNvciwgc3RvcmUsIHRyYW5zYWN0aW9uLCB2b3RlcztcbiAgICAgICAgbm9kZUlkID0gcGFyc2VJbnQobm9kZUlkKTtcbiAgICAgICAgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihbXCJ2b3Rlc1wiXSwgXCJyZWFkb25seVwiKTtcbiAgICAgICAgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcInZvdGVzXCIpO1xuICAgICAgICBjdXJzb3IgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgIHZvdGVzID0ge1xuICAgICAgICAgIG5vZGVJZDogbm9kZUlkLFxuICAgICAgICAgIHBvczogMCxcbiAgICAgICAgICBuZWc6IDBcbiAgICAgICAgfTtcbiAgICAgICAgY3Vyc29yLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgYWN0Vm90ZTtcbiAgICAgICAgICBhY3RWb3RlID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIGlmIChhY3RWb3RlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChhY3RWb3RlLnZhbHVlLm5vZGUgPT09IG5vZGVJZCkge1xuICAgICAgICAgICAgICBpZiAoYWN0Vm90ZS52YWx1ZS52b3RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdm90ZXMubmVnICs9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0Vm90ZS52YWx1ZS52b3RlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdm90ZXMucG9zICs9IDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY3RWb3RlW1wiY29udGludWVcIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBkZWYucmVzb2x2ZSh2b3Rlcyk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgaWYgKGRiKSB7XG4gICAgICAgIGxvYWRVc2VyVm90ZUZvck5vZGUoZGVmZXJyZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BlblJlcXVlc3QgPSBvcGVuQ29ubmVjdGlvbigpO1xuICAgICAgICBvcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgcmV0dXJuIGxvYWRVc2VyVm90ZUZvck5vZGUoZGVmZXJyZWQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZmFjdG9yeU9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjQuMFxuKGZ1bmN0aW9uKCkge1xuICB2YXIgbW9kdWxlO1xuXG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwic2VydmljZXNcIik7XG5cbiAgbW9kdWxlLmZhY3RvcnkoJ0Zvcm1IZWxwZXInLCByZXF1aXJlKCcuL3NlY3VyaXR5L0Zvcm1IZWxwZXInKSk7XG5cbiAgbW9kdWxlLmZhY3RvcnkoJ0RhdGFQcm92aWRlclNlcnZpY2UnLCByZXF1aXJlKCcuL0RhdGFQcm92aWRlclNlcnZpY2UnKSk7XG5cbiAgbW9kdWxlLmZhY3RvcnkoJ0xvY2FsRGF0YVByb3ZpZGVyU2VydmljZScsIHJlcXVpcmUoJy4vTG9jYWxEYXRhUHJvdmlkZXJTZXJ2aWNlJykpO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEZvcm1IZWxwZXI7XG5cbkZvcm1IZWxwZXIgPSBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgdmFyIGZhY3RvcnlPYmo7XG4gIGZhY3RvcnlPYmogPSB7XG4gICAgbG9hZFBsYWNlSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvaW5mbycpO1xuICAgIH0sXG4gICAgbG9hZFJvdXRlSW5mbzogZnVuY3Rpb24oem9vbSwgbWFwcykge1xuICAgICAgdmFyIG1hcHNTdHIsIHJldDtcbiAgICAgIG1hcHNTdHIgPSBtYXBzLmpvaW4oKTtcbiAgICAgIHJldHVybiByZXQgPSAkaHR0cC5nZXQoXCJyb3V0ZS9ldXJvdmVsb182L1wiICsgem9vbSArIFwiL1wiICsgbWFwc1N0cik7XG4gICAgfSxcbiAgICBsb2FkTWFwQXJlYTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9tYXAvMCcpO1xuICAgIH0sXG4gICAgc2F2ZVBsYWNlSW5mbzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9pbmZvJywgZGF0YSk7XG4gICAgfSxcbiAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24odXNlck5hbWUpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICRodHRwLmdldChcIi91c2Vycy9cIiArIHVzZXJOYW1lKS50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgaWYgKHJlc3AuZGF0YS50aGVuICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcC5kYXRhLnRoZW4oZnVuY3Rpb24ocmVzcDIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXNlclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3AyKTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHJlc3AyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmYWN0b3J5T2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtSGVscGVyO1xuIl19
