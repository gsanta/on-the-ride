
#TODO put into 3rd party codes: https://github.com/TheSharpieOne/angular-input-match
angular.module "directives"
.directive 'match', () ->
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      match: '='
    },
    link: (scope, elem, attrs, ctrl) ->
      scope.$watch () ->
        modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue
        return ( ctrl.$pristine && angular.isUndefined modelValue ) || scope.match == modelValue
      ,( currentValue ) ->
        ctrl.$setValidity 'match' , currentValue
  }