(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  angular.module('starter').config(function($provide) {
    return $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
  }).run(function($httpBackend, LocalDataProviderService, LoginService, $q) {
    $httpBackend.whenPOST('users/new').respond(function(method, url, data) {
      var promise;
      promise = LocalDataProviderService.addUser(data);
      return [401, promise, {}];
    });
    $httpBackend.whenDELETE('users').respond(function(method, url, data) {
      return console.log("deleting");
    });
    $httpBackend.whenPOST('login').respond(function(method, url, data) {
      var obj, promise;
      obj = angular.fromJson(data);
      promise = LocalDataProviderService.getUser(obj.userName, obj.password);
      return [200, promise, {}];
    });
    $httpBackend.whenPOST('signUp').respond(function(method, url, data) {
      var obj, promise;
      obj = angular.fromJson(data);
      promise = LocalDataProviderService.addUser(obj);
      return [200, promise, {}];
    });
    $httpBackend.whenGET(/users\/.*/).respond(function(method, url, data) {
      var promise, userName, userNameIndex;
      userNameIndex = url.lastIndexOf("/");
      userName = url.substring(userNameIndex + 1);
      promise = LocalDataProviderService.getUser(userName);
      return [200, promise, {}];
    });
    $httpBackend.whenPUT(/users\/.*/).respond(function(method, url, data) {
      var obj, promise, userName, userNameIndex;
      userNameIndex = url.lastIndexOf("/");
      userName = url.substring(userNameIndex + 1);
      obj = angular.fromJson(data);
      promise = LocalDataProviderService.updateUser(userName, obj);
      return [200, promise, {}];
    });
    $httpBackend.whenPUT('changePassword').respond(function(method, url, data) {
      var newObj, obj, promise;
      obj = angular.fromJson(data);
      newObj = {
        password: obj.newPassword
      };
      promise = LocalDataProviderService.updateUser(obj.userName, newObj);
      return [200, promise, {}];
    });
    $httpBackend.whenGET(/vote\/.*\/.*/).respond(function(method, url, data) {
      var nodeId, nodeIdIndex, promise, userName, userNameIndex;
      userNameIndex = url.indexOf("/", 1);
      nodeIdIndex = url.lastIndexOf("/");
      userName = url.substring(userNameIndex + 1, nodeIdIndex);
      nodeId = url.substring(nodeIdIndex + 1);
      promise = LocalDataProviderService.getUserVoteForNode(userName, nodeId);
      return [200, promise, {}];
    });
    $httpBackend.whenGET(/vote\/.*/).respond(function(method, url, data) {
      var nodeId, nodeIdIndex, promise;
      nodeIdIndex = url.lastIndexOf("/");
      nodeId = url.substring(nodeIdIndex + 1);
      promise = LocalDataProviderService.getVotesForNode(nodeId);
      return [200, promise, {}];
    });
    $httpBackend.whenPOST('/vote/new').respond(function(method, url, data) {
      var obj, promise;
      obj = angular.fromJson(data);
      promise = LocalDataProviderService.setUserVoteForNode(obj.user, obj.nodeId, obj.vote);
      return [200, promise, {}];
    });
    return $httpBackend.whenGET(/templates\/.*/).passThrough();
  });

}).call(this);

},{}]},{},[1])