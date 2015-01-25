(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var module;

  module = angular.module("services");

  module.factory('BicycleRouteService', require('./services/BicycleRouteService'));

  module.factory('MapPartitionService', require('./services/MapPartitionService'));

}).call(this);

},{"./services/BicycleRouteService":2,"./services/MapPartitionService":3}],2:[function(require,module,exports){
(function() {
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

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
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

}).call(this);

},{}]},{},[1])