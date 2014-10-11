angular.module "directives"
.directive 'flash', ( $timeout ) ->
  return {
    restrict: 'E'
    template: "<button></button>"
    replace: true
    scope: {
      content: "@"
      timeout: "@"
    }
    compile: ( element, attrs ) ->
      element.css( "display", "none" )
      if (!attrs.timeout) 
        attrs.timeout = 3000

      return (scope, element, attrs) ->

        scope.$watch "content", ( value ) ->
          if value == ""
            return

          element.text( value )
          element.css( "display", "block")

          hideElement = () ->
            scope.content = ""
            element.css( "display", "none" )

          $timeout hideElement, parseInt( scope.timeout, 10 )
  }