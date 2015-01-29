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
