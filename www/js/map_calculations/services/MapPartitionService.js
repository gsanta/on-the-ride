(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  angular.module("services").factory("MapPartitionService", function() {
    var factoryObj;
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
      }
    };
    return factoryObj;
  });

}).call(this);

},{}]},{},[1])