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
