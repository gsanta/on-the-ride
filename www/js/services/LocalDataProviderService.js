// Generated by CoffeeScript 1.7.1
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('services').factory('LocalDataProviderService', function($http, $q, MapConstants) {
    var db, factoryObj, idbSupported, openConnection, shouldPopulateDb;
    console.log("lefut");
    idbSupported = false;
    if (__indexOf.call(window, "indexedDB") >= 0) {
      idbSupported = true;
    }
    db = void 0;
    openConnection = function() {
      var connRequest;
      connRequest = indexedDB.open(MapConstants.dbPrefix, MapConstants.indexedDbVersion);
      connRequest.onupgradeneeded = function(e) {
        var thisDB;
        console.log("upgradeneedeed");
        thisDB = e.target.result;
        if (!thisDB.objectStoreNames.contains("eurovelo_6")) {
          thisDB.createObjectStore("eurovelo_6", {
            autoIncrement: true
          });
        }
        if (!thisDB.objectStoreNames.contains("users")) {
          return thisDB.createObjectStore("users", {
            autoIncrement: true
          });
        }
      };
      connRequest.onerror = function(e) {
        console.log("Error");
        return console.dir(e);
      };
      return connRequest;
    };
    shouldPopulateDb = function() {
      var deferred, openRequest, queryDbIfThereAreAnyData;
      queryDbIfThereAreAnyData = function(def) {
        var cursor, route, store, transaction;
        transaction = db.transaction(["eurovelo_6"], "readonly");
        store = transaction.objectStore("eurovelo_6");
        cursor = store.openCursor();
        route = [];
        return cursor.onsuccess = function(e) {
          var res;
          res = e.target.result;
          if (res) {
            console.log("should'nt");
            return def.resolve(false);
          } else {
            console.log("should");
            return def.resolve(true);
          }
        };
      };
      deferred = $q.defer();
      if (db) {
        queryDbIfThereAreAnyData(deferred);
      } else {
        openRequest = openConnection();
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          return queryDbIfThereAreAnyData(deferred);
        };
      }
      return deferred.promise;
    };
    factoryObj = {
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
      },
      clearAndPopulateDbForTesting: function() {
        var clearAndpopulateDbFromArray, clearAndpopulateDbFromServer, deferred, openRequest;
        clearAndpopulateDbFromServer = function(def) {
          var dbPromise;
          dbPromise = $http.get("dummyDatabase");
          dbPromise.success(function(nodes) {
            var node, store, transaction, _i, _len;
            transaction = db.transaction(["eurovelo_6"], "readwrite");
            store = transaction.objectStore("eurovelo_6");
            store.clear();
            for (_i = 0, _len = nodes.length; _i < _len; _i++) {
              node = nodes[_i];
              store.add(node);
            }
            return def.resolve();
          });
          return dbPromise.error(function(data) {
            return console.log("failure");
          });
        };
        clearAndpopulateDbFromArray = function(def) {
          var node, store, transaction, _i, _len;
          transaction = db.transaction(["eurovelo_6"], "readwrite");
          store = transaction.objectStore("eurovelo_6");
          store.clear();
          for (_i = 0, _len = smallDatabaseForTesting.length; _i < _len; _i++) {
            node = smallDatabaseForTesting[_i];
            store.add(node);
          }
          return def.resolve();
        };
        deferred = $q.defer();
        if (db) {
          clearAndpopulateDbFromArray(deferred);
        } else {
          openRequest = openConnection();
          openRequest.onsuccess = function(e) {
            db = e.target.result;
            return clearAndpopulateDbFromArray(deferred);
          };
        }
        return deferred.promise;
      },
      updateNode: function(id, props) {
        var request, store, transaction;
        transaction = db.transaction(["eurovelo_6"], "readwrite");
        store = transaction.objectStore("eurovelo_6");
        request = store.put(props, id);
        request.onsuccess = function(e) {
          return console.log("success saving node");
        };
        return request.onerror = function(e) {
          return console.log("error saving node");
        };
      },
      addNode: function(node) {
        var request, store, transaction;
        transaction = db.transaction(["eurovelo_6"], "readwrite");
        store = transaction.objectStore("eurovelo_6");
        request = store.add(node);
        request.onsuccess = function(e) {
          return console.log("success adding node");
        };
        return request.onerror = function(e) {
          return console.log("error adding node");
        };
      },
      getUser: function(userName, password) {
        var deferred, loadUserInfoFromIndexedDb, openRequest;
        deferred = $q.defer();
        loadUserInfoFromIndexedDb = function(def) {
          var cursor, store, transaction, user;
          transaction = db.transaction(["users"], "readonly");
          store = transaction.objectStore("users");
          cursor = store.openCursor();
          user = void 0;
          cursor.onsuccess = function(e) {
            var actUser;
            actUser = e.target.result;
            if (actUser != null) {
              if ((actUser.value != null) && actUser.value.userName === userName) {
                return user = {
                  id: actUser.key,
                  userName: actUser.value.userName
                };
              } else {
                return actUser["continue"]();
              }
            }
          };
          return transaction.oncomplete = function(e) {
            if (user) {
              return def.resolve(user);
            } else {
              return def.reject("login error");
            }
          };
        };
        if (db) {
          loadUserInfoFromIndexedDb(deferred);
        } else {
          console.log("openRequest");
          openRequest = openConnection();
          openRequest.onsuccess = function(e) {
            db = e.target.result;
            return loadUserInfoFromIndexedDb(deferred);
          };
        }
        return deferred.promise;
      },
      addUser: function(User) {
        var addUserToIndexedDb, deferred, openRequest;
        deferred = $q.defer();
        addUserToIndexedDb = function(def) {
          var request, store, transaction;
          transaction = db.transaction(["users"], "readwrite");
          store = transaction.objectStore("users");
          request = store.add(User);
          request.onsuccess = function(e) {
            return def.resolve(User);
          };
          return request.onerror = function(e) {
            return def.reject("problem with signing up");
          };
        };
        if (db) {
          addUserToIndexedDb(deferred);
        } else {
          console.log("openRequest");
          openRequest = openConnection();
          openRequest.onsuccess = function(e) {
            db = e.target.result;
            return addUserToIndexedDb(deferred);
          };
        }
        return deferred.promise;
      },
      removeUser: function(User) {
        var deferred, openRequest, removedUserFromIndexedDb;
        deferred = $q.defer();
        removedUserFromIndexedDb = function(def) {
          var request, store, transaction;
          console.log("removeUser");
          transaction = db.transaction(["users"], "readwrite");
          store = transaction.objectStore("users");
          request = store["delete"](User.id);
          request.onsuccess = function(e) {
            return def.resolve(User);
          };
          return request.onerror = function(e) {
            return def.reject("problem with deleting user");
          };
        };
        if (db) {
          removedUserFromIndexedDb(deferred);
        } else {
          console.log("openRequest");
          openRequest = openConnection();
          openRequest.onsuccess = function(e) {
            db = e.target.result;
            return removedUserFromIndexedDb(deferred);
          };
        }
        return deferred.promise;
      }
    };
    return factoryObj;
  });

}).call(this);
