angular.module 'starter', [ 'ionic', 'controllers', 'services', 'classes' ]
.run ( $ionicPlatform ) ->
  $ionicPlatform.ready ->

    if window.cordova? and window.cordova.plugins.Keyboard?
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar true

    if window.StatusBar?
      StatusBar.styleDefault

.config ($stateProvider, $urlRouterProvider) ->

  $stateProvider
  .state 'tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  }

  .state 'tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      }
    }
  }

  .state 'tab.mapEdit', {
    url: '/mapEdit',
    views: {
      'tab-map-edit': {
        templateUrl: 'templates/mapEdit.html',
        controller: 'MapEditCtrl'
      }
    }
  }

  $urlRouterProvider.otherwise '/tab/mapEdit'