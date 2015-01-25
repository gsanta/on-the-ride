(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var module;

  module = angular.module("directives", []);

  module.directive('flash', require('./flash'));

  module.directive('match', require('./match'));

}).call(this);

},{"./flash":2,"./match":3}],2:[function(require,module,exports){
(function() {
  var flash;

  flash = function($timeout) {
    return {
      restrict: 'E',
      template: "<button></button>",
      replace: true,
      scope: {
        content: "=",
        timeout: "@"
      },
      compile: function(element, attrs) {
        element.css("display", "none");
        if (!attrs.timeout) {
          attrs.timeout = 3000;
        }
        return function(scope, element, attrs) {
          return scope.$watch(function() {
            return scope.content;
          }, function(value) {
            var hideElement;
            if (value === "") {
              return;
            }
            element.text(value);
            element.css("display", "block");
            scope.content = "";
            hideElement = function() {
              scope.content = "";
              scope.$apply(function() {
                return scope.content = "";
              });
              return element.css("display", "none");
            };
            return $timeout(hideElement, parseInt(scope.timeout, 10));
          });
        };
      }
    };
  };

  module.exports = flash;

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  var match;

  match = function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        match: '='
      },
      link: function(scope, elem, attrs, ctrl) {
        return scope.$watch(function() {
          var modelValue;
          modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
          return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
        }, function(currentValue) {
          return ctrl.$setValidity('match', currentValue);
        });
      }
    };
  };

  module.exports = match;

}).call(this);

},{}]},{},[1])