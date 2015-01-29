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