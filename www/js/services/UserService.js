(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])