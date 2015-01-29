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
