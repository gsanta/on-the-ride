(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])