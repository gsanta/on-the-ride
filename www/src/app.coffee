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

  .state 'tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      }
    }
  }

  .state 'tab.friends', {
    url: '/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/place_info_form.html',
        controller: 'PlaceInfoCtrl'
      }
    }
  }

  $urlRouterProvider.otherwise '/tab/dash' 