(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
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

}).call(this);

},{}]},{},[1])