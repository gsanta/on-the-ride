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
