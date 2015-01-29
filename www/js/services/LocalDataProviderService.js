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
