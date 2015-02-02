var LocalBicycleRouteDaoService;

LocalBicycleRouteDaoService = function($http, $q, MapConstants) {
  var db;
  var factoryObj;

  function updateNode(id, props) {
    var request, store, transaction;
    
    transaction = db.transaction([MapConstants.iDBRouteStoreName], "readwrite");
    store = transaction.objectStore(MapConstants.iDBRouteStoreName);
    request = store.put(props, id);
    
    request.onsuccess = function(e) {
      return console.log("success saving node");
    };

    request.onerror = function(e) {
      return console.log("error saving node");
    };
  }

  function addNode(node) {
    var request, store, transaction;
    
    transaction = db.transaction([MapConstants.iDBRouteStoreName], "readwrite");
    store = transaction.objectStore(MapConstants.iDBRouteStoreName);
    request = store.add(node);
    
    request.onsuccess = function(e) {
      return console.log("success adding node");
    };

    return request.onerror = function(e) {
      return console.log("error adding node");
    };
  }

  function shouldPopulateDb() {
    var deferred, openRequest, queryDbIfThereAreAnyData;

    function queryDbIfThereAreAnyData(def) {
      var cursor, route, store, transaction;

      transaction = db.transaction([MapConstants.iDBRouteStoreName], "readonly");
      store = transaction.objectStore(MapConstants.iDBRouteStoreName);
      cursor = store.openCursor();

      route = [];

      cursor.onsuccess = function(e) {
        var res;

        res = e.target.result;
        if (res) {
          return def.resolve(false);
        } else {
          return def.resolve(true);
        }
      };
    };

    deferred = $q.defer();

    if(!db) {
      throw new Error("database is not open")
    }

    queryDbIfThereAreAnyData(deferred);

    return deferred.promise;
  };

  factoryObj = {
    updateNodes: function(nodes) {
      var results;

      results = [];

      nodes.forEach(function(node) {
        results.push(updateNode(node._id, {
          lat: node.lat,
          lon: node.lon
        }));
      });

      return results;
    },

    addNodes: function(nodes) {
      var results;

      results = [];
      
      nodes.forEach(function(node) {
        results.push(addNode({
          user: node.user,
          lat: node.lat,
          lon: node.lon
        }));
      });

      return results;
    },

    loadRouteInfo: function(zoom, maps) {
      var deferred, loadRouteInfoFromIndexedDb, shouldPopulatePromise, that;

      loadRouteInfoFromIndexedDb = function(def) {
        var cursor, route, store, transaction;
        transaction = db.transaction(["eurovelo_6"], "readonly");
        store = transaction.objectStore("eurovelo_6");
        cursor = store.openCursor();
        route = [];
        cursor.onsuccess = function(e) {
          var node, res;
          res = e.target.result;
          if (res) {
            node = res.value;
            node._id = res.key;
            route.push(node);
            return res["continue"]();
          }
        };
        return transaction.oncomplete = function(e) {
          return def.resolve(route);
        };
      };

      deferred = $q.defer();

      shouldPopulatePromise = shouldPopulateDb();
      that = this;
      shouldPopulatePromise.then(function(should) {
        var promise;
        if (should) {
          promise = that.clearAndPopulateDbForTesting();
          return promise.then(function() {
            return loadRouteInfoFromIndexedDb(deferred);
          });
        } else {
          return loadRouteInfoFromIndexedDb(deferred);
        }
      });
      return deferred.promise;
    }
  };
  return factoryObj;
};

module.exports = LocalBicycleRouteDaoService;
