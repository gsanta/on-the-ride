(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var BicycleRouteBuilderService, factoryObj;

  BicycleRouteBuilderService = function(InfoWindowService) {
    var addClickEventToMarker, addDragendEventToMarker;
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
    return addDragendEventToMarker = function(marker, scope) {
      return google.maps.event.addListener(marker, 'dragend', function(event) {
        marker.nodeInfo.changed = true;
        marker.nodeInfo.lat = event.latLng.k;
        marker.nodeInfo.lon = event.latLng.B;
        return scope.isThereEditedNode = true;
      });
    };
  };

  factoryObj = {
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

  factoryObj;

  module.exports = BicycleRouteBuilderService;

}).call(this);

},{}]},{},[1])