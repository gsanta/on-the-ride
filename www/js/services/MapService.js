(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var MapService,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MapService = function(DataProviderService, LocalDataProviderService, MapConstants, Coord, $compile, LoginService, $http, $q) {
    var addClickEventToMarker, addDragendEventToMarker, factoryObj, infoWindowContent, infowindow, mapZoomDiameterSquares;
    mapZoomDiameterSquares = [5825, 1456.25, 364.0625, 91.016, 22.754, 5.691, 1.422, 0.3557, 0.0892];
    infoWindowContent = '<div>\n  <div class="list">\n      <div class="item item-divider">\n        Basic info\n      </div>\n\n      <div class="item"> \n        User: {{actNode.user}}<br/>\n        Id: {{actNode.lat}}\n      </div>\n\n      <div class="item item-divider">\n        How accurate this point is?\n      </div>\n\n      <div class="item range range-energized"> \n        <div> \n        <input type="range" name="volume" min="0" max="2" value="1" ng-model="vote.value">\n        </div>\n        <div>\n          <i class="icon ion-happy">&nbsp;{{actNode.vote_pos}}</i>\n          <i class="icon ion-sad">&nbsp;{{actNode.vote_neg}}</i>\n        </div>\n      </div>\n  </div>\n</div>\n';
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(infowindow, 'closeclick', function() {});
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
        infowindow.setContent(content);
        return infowindow.open(googleMap, marker);
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
    factoryObj = {
      calculateZoom: function(topLeftCoord, bottomRightCoord) {
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
              return 1;
            } else {
              return index;
            }
          }
        }
        return mapZoomDiameterSquares.length;
      },
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
      },
      createRouteFromNodeArray: function(nodeArray, zoom, mapIds) {
        var createRouteFromStartNode, finalRoute, i, mapId, n, node, nodeAssocMap, route, startNode, startNodes, _i, _j, _k, _l, _len, _len1, _len2, _len3;
        if (zoom > MapConstants.max_zoom) {
          throw new Error("zoom is bigger than the maximum (use MapConstants.max_zoom)");
        }
        if (zoom < 1) {
          throw new Error("zoom is smaller than the minimum (use MapConstants.min_zoom)");
        }
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
        nodeAssocMap = {};
        for (_i = 0, _len = nodeArray.length; _i < _len; _i++) {
          node = nodeArray[_i];
          nodeAssocMap[node._id] = node;
        }
        startNodes = [];
        for (_j = 0, _len1 = mapIds.length; _j < _len1; _j++) {
          mapId = mapIds[_j];
          startNode = this.getStartNodeFromNodesAtMap(nodeArray, mapId);
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
        for (i = _l = 0, _len3 = finalRoute.length; _l < _len3; i = ++_l) {
          n = finalRoute[i];
          if (n === void 0) {
            console.log("undef at " + i);
          }
        }
        return finalRoute;
      },
      getStartNodeFromNodesAtMap: function(nodes, mapId) {
        var node, _i, _len;
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          if (__indexOf.call(node.startNodeInMap, mapId) >= 0) {
            return node;
          }
        }
        return void 0;
      },
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
      createPointsFromRoute: function(route, googleMap) {
        var circle, circles, index, node, pointOptions, _i, _len;
        circles = [];
        for (index = _i = 0, _len = route.length; _i < _len; index = ++_i) {
          node = route[index];
          pointOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            draggable: true,
            map: googleMap,
            center: new google.maps.LatLng(node.lat, node.lon),
            radius: (Math.random() * 10) + 10
          };
          circle = new google.maps.Circle(pointOptions);
          circle._id = node._id;
          circles.push(circle);
        }
        return circles;
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
      calculateMapIdForNodeAtZoom: function(coord, zoom) {
        var column, distFromLatStart, distFromLonStart, index, latFullLen, latLenAtZoom, lonFullLen, lonLenAtZoom, mapIdOffset, row, rowsColumnsAtZoom, _i;
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
        rowsColumnsAtZoom = Math.pow(2, zoom);
        latFullLen = Math.abs(MapConstants.latStart - MapConstants.latEnd);
        lonFullLen = Math.abs(MapConstants.lonStart - MapConstants.lonEnd);
        distFromLatStart = Math.abs(MapConstants.latStart - coord.lat);
        distFromLonStart = Math.abs(MapConstants.lonStart - coord.lon);
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
      },
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

  module.exports = MapService;

}).call(this);

},{}]},{},[1])