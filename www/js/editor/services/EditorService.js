(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  angular.module("services").factory("EditorService", function() {
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
  });

}).call(this);

},{}]},{},[1])