(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var module;

  module = angular.module("services");

  module.factory('BicycleRouteDaoService', require('./services/BicycleRouteDaoService'));

  module.factory('VoteDaoService', require('./services/VoteDaoService'));

}).call(this);

},{"./services/BicycleRouteDaoService":2,"./services/VoteDaoService":3}],2:[function(require,module,exports){
(function() {
  var BicycleRouteDaoService;

  BicycleRouteDaoService = function() {
    var factoryObj;
    factoryObj = {
      savePoints: function(nodes) {
        var node, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          _results.push(LocalDataProviderService.updateNode(node._id, {
            lat: node.lat,
            lon: node.lon
          }));
        }
        return _results;
      },
      addPoints: function(nodes) {
        var node, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          _results.push(LocalDataProviderService.addNode({
            user: node.user,
            lat: node.lat,
            lon: node.lon
          }));
        }
        return _results;
      }
    };
    return factoryObj;
  };

  module.exports = BicycleRouteDaoService;

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  var VoteDaoService;

  VoteDaoService = function() {
    var factoryObj;
    factoryObj = {
      getUserVoteToPoint: function(userName, nodeId) {
        var deferred, httpPromise;
        deferred = $q.defer();
        httpPromise = $http.get("/vote/" + userName + "/" + nodeId);
        httpPromise.then(function(resp) {
          if (resp.data.then != null) {
            return resp.data.then(function(data) {
              if (data === void 0) {
                data = {
                  user: userName,
                  node: nodeId,
                  vote: 1
                };
              }
              return deferred.resolve(data);
            });
          }
        });
        return deferred.promise;
      },
      getAllVotesToNode: function(nodeId) {
        var deferred, httpPromise;
        deferred = $q.defer();
        httpPromise = $http.get("/vote/" + nodeId);
        httpPromise.then(function(resp) {
          if (resp.data.then != null) {
            return resp.data.then(function(data) {
              if (data === void 0) {
                data = {
                  nodeId: nodeId,
                  pos: 0,
                  neg: 0
                };
              }
              return deferred.resolve(data);
            });
          }
        });
        return deferred.promise;
      },
      sendUserVoteForNode: function(userName, nodeId, vote) {
        return $http.post("/vote/new", {
          user: userName,
          nodeId: nodeId,
          vote: vote
        });
      }
    };
    return factoryObj;
  };

  module.exports = VoteDaoService;

}).call(this);

},{}]},{},[1])