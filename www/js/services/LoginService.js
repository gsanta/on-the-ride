// Generated by CoffeeScript 1.7.1
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('services').factory('LoginService', function($http, $q, $location) {
    var db, factoryObj, idbSupported, openConnection, redirect;
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
          return thisDB.createObjectStore("eurovelo_6", {
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
    redirect = function(url) {
      url = url || '/';
      return $location.path(url);
    };
    factoryObj = {
      login: function(userName, password) {
        var deferred, loadUserInfoFromIndexedDb;
        deferred = $q.defer();
        loadUserInfoFromIndexedDb = function(def, userName) {
          var cursor, store, transaction, user;
          transaction = db.transaction(["eurovelo_6"], "readonly");
          store = transaction.objectStore("users");
          cursor = store.openCursor();
          user = {};
          cursor.onsuccess = function(e) {
            var actUser;
            actUser = e.target.result;
            if (actUser.value.userName === userName) {
              user.id = actUser.key;
              return user.userName = actUser.value.userName;
            } else {
              return actUser["continue"]();
            }
          };
          return transaction.oncomplete = function(e) {
            return def.resolve(route);
          };
        };
        loadRouteInfoFromIndexedDb(deferred, userName);
        return deferred.promise;
      },
      addUser: function(User) {
        var handleResult;
        handleResult = function(result) {
          if (typeof result.data.then === "function") {
            return result.data.then(function(data) {
              return data;
            });
          } else {
            return data;
          }
        };
        return $http.post('users/new', User).then(handleResult);
      },
      removeUser: function(User) {
        var handleResult;
        handleResult = function(result) {
          if (typeof result.data.then === "function") {
            return result.data.then(function(data) {
              return data;
            });
          } else {
            return data;
          }
        };
        return $http["delete"]("users", {
          id: User.id
        }).then(handleResult);
      },
      getLoggedInUser: function() {
        return void 0;
      }
    };
    return factoryObj;
  });

}).call(this);
