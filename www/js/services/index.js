(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var DataProviderService;

  DataProviderService = function($http, $q) {
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

  module.exports = DataProviderService;

}).call(this);

},{}],2:[function(require,module,exports){
(function() {
  var LocalDataProviderService,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LocalDataProviderService = function($http, $q, MapConstants) {
    var db, factoryObj, idbSupported, openConnection, shouldPopulateDb;
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
          thisDB.createObjectStore("users", {
            autoIncrement: true
          });
        }
        if (!thisDB.objectStoreNames.contains("votes")) {
          return thisDB.createObjectStore("votes", {
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
            node.vote_pos = 0;
            node.vote_neg = 0;
            node.user = "gsanta";
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
                user = actUser.value;
                user.id = actUser.key;
                return user.password = "";
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
      updateUser: function(userName, updateObj) {
        var deferred, promise;
        deferred = $q.defer();
        promise = this.getUser(userName, void 0);
        promise.then(function(data) {
          var k, request, store, transaction, v;
          for (k in data) {
            v = data[k];
            if (updateObj[k] != null) {
              data[k] = updateObj[k];
            }
          }
          transaction = db.transaction(["users"], "readwrite");
          store = transaction.objectStore("users");
          request = store.put(data, data.id);
          return request.onsuccess = function(e) {
            return deferred.resolve(data);
          };
        });
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
      },
      getUserVoteForNode: function(userName, nodeId) {
        var deferred, loadUserVoteForNode, openRequest;
        deferred = $q.defer();
        loadUserVoteForNode = function(def) {
          var cursor, store, transaction, vote;
          nodeId = parseInt(nodeId);
          transaction = db.transaction(["votes"], "readonly");
          store = transaction.objectStore("votes");
          cursor = store.openCursor();
          vote = void 0;
          cursor.onsuccess = function(e) {
            var actVote;
            actVote = e.target.result;
            if (actVote != null) {
              if (actVote.value.user === userName && actVote.value.node === nodeId) {
                vote = actVote.value;
                return vote.id = actVote.key;
              } else {
                return actVote["continue"]();
              }
            }
          };
          return transaction.oncomplete = function(e) {
            return def.resolve(vote);
          };
        };
        if (db) {
          loadUserVoteForNode(deferred);
        } else {
          openRequest = openConnection();
          openRequest.onsuccess = function(e) {
            db = e.target.result;
            return loadUserVoteForNode(deferred);
          };
        }
        return deferred.promise;
      },
      setUserVoteForNode: function(userName, nodeId, vote) {
        var deferred, promise, setUserVoteForNodeToIndexDb;
        setUserVoteForNodeToIndexDb = function(def, data, isUpdate) {
          var request, store, transaction;
          transaction = db.transaction(["votes"], "readwrite");
          store = transaction.objectStore("votes");
          if (isUpdate) {
            request = store.put(data, data.id);
          } else {
            request = store.add(data);
          }
          request.onsuccess = function(e) {
            return def.resolve(data);
          };
          return request.onerror = function(e) {
            return def.reject("problem with deleting user");
          };
        };
        promise = factoryObj.getUserVoteForNode(userName, nodeId);
        deferred = $q.defer();
        promise.then(function(data) {
          if (data != null) {
            data.vote = vote;
            return setUserVoteForNodeToIndexDb(deferred, data, true);
          } else {
            data = {
              user: userName,
              node: nodeId,
              vote: vote
            };
            return setUserVoteForNodeToIndexDb(deferred, data, false);
          }
        });
        return deferred.promise;
      },
      getVotesForNode: function(nodeId) {
        var deferred, loadUserVoteForNode, openRequest;
        deferred = $q.defer();
        loadUserVoteForNode = function(def) {
          var cursor, store, transaction, votes;
          nodeId = parseInt(nodeId);
          transaction = db.transaction(["votes"], "readonly");
          store = transaction.objectStore("votes");
          cursor = store.openCursor();
          votes = {
            nodeId: nodeId,
            pos: 0,
            neg: 0
          };
          cursor.onsuccess = function(e) {
            var actVote;
            actVote = e.target.result;
            if (actVote != null) {
              if (actVote.value.node === nodeId) {
                if (actVote.value.vote === 0) {
                  votes.neg += 1;
                } else if (actVote.value.vote === 2) {
                  votes.pos += 1;
                }
              }
              return actVote["continue"]();
            }
          };
          return transaction.oncomplete = function(e) {
            return def.resolve(votes);
          };
        };
        if (db) {
          loadUserVoteForNode(deferred);
        } else {
          openRequest = openConnection();
          openRequest.onsuccess = function(e) {
            db = e.target.result;
            return loadUserVoteForNode(deferred);
          };
        }
        return deferred.promise;
      }
    };
    return factoryObj;
  };

  module.exports = LocalDataProviderService;

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  var LoginService;

  LoginService = function($http, $q, $location, SecurityRetryQueue, $ionicPopup, $rootScope, $timeout, $window) {
    var $scope, factoryObj, redirect;
    $scope = $rootScope.$new();
    SecurityRetryQueue.onItemAddedCallbacks.push(function(retryItem) {
      if (SecurityRetryQueue.hasMore()) {
        console.log("retry lefut");
        return factoryObj.showLoginDialog();
      }
    });
    $scope.loginDialog = void 0;
    $scope.registrationDialog = void 0;
    $scope.register = function() {
      console.log("register");
      if ($scope.loginDialog !== void 0) {
        $scope.loginDialog.close();
        $scope.loginDialog = void 0;
        return $timeout($scope.openRegistrationDialog, 1);
      }
    };
    $scope.login = function() {
      if ($scope.registrationDialog !== void 0) {
        $scope.registrationDialog.close();
        $scope.registrationDialog = void 0;
        return $timeout($scope.openLoginDialog, 1);
      }
    };
    $scope.openRegistrationDialog = function() {
      $scope.data = {};
      if ($scope.registrationDialog) {
        throw new Error('Trying to open a dialog that is already open!');
      }
      return $scope.registrationDialog = $ionicPopup.show({
        templateUrl: "/templates/registration.html",
        title: 'Please sign up',
        scope: $scope
      });
    };
    $scope.openLoginDialog = function() {
      $scope.data = {};
      if ($scope.loginDialog) {
        throw new Error('Trying to open a dialog that is already open!');
      }
      $scope.loginDialog = $ionicPopup.show({
        templateUrl: "/templates/login.html",
        title: 'Please log in',
        scope: $scope
      });
      $scope.retryAuthentication = function() {
        return SecurityRetryQueue.retryAll();
      };
      return $scope.cancelAuthentication = function() {
        SecurityRetryQueue.cancelAll();
        return redirect();
      };
    };
    redirect = function(url) {
      url = url || '/';
      return $location.path(url);
    };
    factoryObj = {
      openRegistrationDialog: function() {
        return $scope.openRegistrationDialog();
      },
      openLoginDialog: function() {
        return $scope.openLoginDialog();
      },
      closeLoginDialog: function() {
        $scope.loginDialog.close();
        return $scope.loginDialog = void 0;
      },
      closeRegistrationDialog: function() {
        $scope.registrationDialog.close();
        return $scope.registrationDialog = void 0;
      },
      retryAuthentication: function() {
        return SecurityRetryQueue.retryAll();
      },
      login: function(userName, password) {
        var deferred, handleResult;
        handleResult = function(result) {
          if (typeof result.data.then === "function") {
            return result.data.then(function(data) {
              sessionStorage.setItem("userName", data.userName);
              return data;
            });
          } else {
            return data;
          }
        };
        return $http.post('login', {
          userName: userName,
          password: password
        }).then(handleResult);
        return deferred = $q.defer();
      },
      signUp: function(User) {
        var deferred, handleResult;
        handleResult = function(result) {
          if (typeof result.data.then === "function") {
            return result.data.then(function(data) {
              sessionStorage.setItem("userName", data.userName);
              return data;
            });
          } else {
            return data;
          }
        };
        return $http.post('signUp', User).then(handleResult);
        return deferred = $q.defer();
      },
      logout: function() {
        sessionStorage.removeItem("userName");
        return $window.location.href = "/map";
      },
      showLoginDialog: function() {
        return $scope.openLoginDialog();
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
      getSignedInUser: function() {
        var defer, promise, userName;
        userName = sessionStorage.getItem("userName");
        defer = $q.defer();
        if (userName) {
          return userName;
        } else {
          promise = SecurityRetryQueue.pushRetryFn('unauthorized-server', factoryObj.getSignedInUser);
          return promise;
        }
      },
      getUserName: function() {
        return sessionStorage.getItem("userName");
      },
      isLoggedIn: function() {
        return sessionStorage.getItem("userName") != null;
      },
      changePassword: function(userName, oldPassword, newPassword) {
        var handleResult, requestData;
        handleResult = function(result) {
          if (typeof result.data.then === "function") {
            return result.data.then(function(data) {
              return data;
            });
          } else {
            return data;
          }
        };
        requestData = {
          userName: userName,
          oldPassword: oldPassword,
          newPassword: newPassword
        };
        return $http.put("changePassword", requestData).then(handleResult);
      }
    };
    return factoryObj;
  };

  module.exports = LoginService;

}).call(this);

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
(function() {
  var SecurityInterceptor;

  SecurityInterceptor = function($injector, SecurityRetryQueue) {
    return function(promise) {
      return promise.then(function(originalResponse) {
        return originalResponse;
      }, function(originalResponse) {
        console.log("login error");
        console.log(originalResponse.status);
        if (originalResponse.status === 401) {
          promise = SecurityRetryQueue.pushRetryFn('unauthorized-server', function() {
            return $injector.get('$http')(originalResponse.config);
          });
        }
        return promise;
      });
    };
  };

  module.exports = SecurityInterceptor;

}).call(this);

},{}],6:[function(require,module,exports){
(function() {
  var SecurityRetryQueue;

  SecurityRetryQueue = function($q, $log) {
    var retryQueue, service;
    retryQueue = [];
    service = {
      onItemAddedCallbacks: [],
      hasMore: function() {
        return retryQueue.length > 0;
      },
      push: function(retryItem) {
        retryQueue.push(retryItem);
        return angular.forEach(service.onItemAddedCallbacks, function(cb) {
          var e;
          try {
            return cb(retryItem);
          } catch (_error) {
            e = _error;
            return $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
          }
        });
      },
      pushRetryFn: function(reason, retryFn) {
        var deferred, retryItem;
        if (arguments.length === 1) {
          retryFn = reason;
          reason = void 0;
        }
        deferred = $q.defer();
        retryItem = {
          reason: reason,
          retry: function() {
            return $q.when(retryFn()).then(function(value) {
              return deferred.resolve(value);
            }, function(value) {
              return deferred.reject(value);
            });
          },
          cancel: function() {
            return deferred.reject();
          }
        };
        service.push(retryItem);
        return deferred.promise;
      },
      retryReason: function() {
        return service.hasMore() && retryQueue[0].reason;
      },
      cancelAll: function() {
        var _results;
        _results = [];
        while (service.hasMore()) {
          _results.push(retryQueue.shift().cancel());
        }
        return _results;
      },
      retryAll: function() {
        var _results;
        _results = [];
        while (service.hasMore()) {
          _results.push(retryQueue.shift().retry());
        }
        return _results;
      }
    };
    return service;
  };

  module.exports = SecurityRetryQueue;

}).call(this);

},{}],7:[function(require,module,exports){
(function() {
  var UserService;

  UserService = function($http) {
    var factoryObj;
    factoryObj = {
      changeProfileData: function(userName, changeObj) {
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
        return $http.put("users/" + userName, changeObj).then(handleResult);
      }
    };
    return factoryObj;
  };

  module.exports = UserService;

}).call(this);

},{}],8:[function(require,module,exports){
(function() {
  var module;

  module = angular.module("services", []);

  module.factory('FormHelper', require('./security/FormHelper'));

  module.factory('DataProviderService', require('./DataProviderService'));

  module.factory('LocalDataProviderService', require('./LocalDataProviderService'));

  module.factory('LoginService', require('./LoginService'));

  module.constant('MapConstants', require('./MapConstants'));

  module.factory('SecurityInterceptor', require('./SecurityInterceptor'));

  module.factory('SecurityRetryQueue', require('./SecurityRetryQueue'));

  module.factory('UserService', require('./UserService'));

  module.config(function($httpProvider) {
    return $httpProvider.responseInterceptors.push('SecurityInterceptor');
  });

}).call(this);

},{"./DataProviderService":1,"./LocalDataProviderService":2,"./LoginService":3,"./MapConstants":4,"./SecurityInterceptor":5,"./SecurityRetryQueue":6,"./UserService":7,"./security/FormHelper":9}],9:[function(require,module,exports){
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

},{}]},{},[8])