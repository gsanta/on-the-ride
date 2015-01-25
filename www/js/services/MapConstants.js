(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
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

}).call(this);

},{}]},{},[1])