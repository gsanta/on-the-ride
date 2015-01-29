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
