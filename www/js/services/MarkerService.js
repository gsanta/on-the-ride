(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var MarkerService;

  MarkerService = function() {
    var factoryObj;
    factoryObj = {
      createMarker: function(position, title, map) {
        var marker;
        marker = new google.maps.Marker({
          position: position,
          map: map,
          title: title
        });
        return marker;
      },
      createInfoWindow: function(text, map, marker) {
        var infowindow;
        infowindow = new google.maps.InfoWindow({
          content: text
        });
        if ((map != null) && (marker != null)) {
          return google.maps.event.addListener(marker, 'click', function() {
            return infowindow.open($scope.map, marker);
          });
        }
      }
    };
    return factoryObj;
  };

  module.exports = MarkerService;

}).call(this);

},{}]},{},[1])