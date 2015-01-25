(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
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

}).call(this);

},{}]},{},[1])