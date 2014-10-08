angular.module "directives"
.directive 'flash', ( $timeout ) ->
  return {
    restrict: 'E'
    scope: {
      content: "@"
      timeout: "@"
    }
    compile: ( element, attrs ) ->
      if (!attrs.timeout) 
        attrs.timeout = 3000

      (scope, element, attrs) ->

        scope.$watch "content", ( value ) ->
          if value == ""
            return

          element.text( value )
          element.css( "display", "block")

          hideElement = () ->
            element.css( "display", "none" )

          $timeout hideElement, parseInt( scope.timeout, 10 )
  }