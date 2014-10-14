angular.module 'starter', [ 'ionic', 'controllers', 'services', 'classes', 'directives', 'ui.gravatar' ]
.run ( $ionicPlatform, $rootScope, $location, LoginService ) ->

  $ionicPlatform.ready ->

    if window.cordova? and window.cordova.plugins.Keyboard?
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar true

    if window.StatusBar?
      StatusBar.styleDefault

.config ($stateProvider, $urlRouterProvider ) ->

  # $stateProvider
  # .state 'tab', {
  #   url: "/tab",
  #   abstract: true,
  #   templateUrl: "templates/tabs.html"
  # }

  # .state 'tab.map', {
  #   url: '/map',
  #   views: {
  #     'tab-map': {
  #       templateUrl: 'templates/map.html',
  #       controller: 'MapCtrl'
  #     }
  #   }
  # }

  # .state 'tab.mapEdit', {
  #   url: '/mapEdit',
  #   views: {
  #     'tab-map-edit': {
  #       templateUrl: 'templates/mapEdit.html',
  #       controller: 'MapEditCtrl'
  #     }
  #   },
  #   resolve: {
  #     auth: ( $q, $injector, LoginService ) ->
  #       return LoginService.getSignedInUser()
  #   }
  # }

  # .state 'edit', {
  #   url: '/edit',
  #   templateUrl: 'templates/mapEdit.html',
  #   controller: 'MapEditCtrl'
  #   resolve: {
  #     auth: ( $q, $injector, LoginService ) ->
  #       return LoginService.getSignedInUser()
  #   }
  # }

  # .state 'tab.profile', {
  #   url: '/profile',
  #   views: {
  #     'tab-profile': {
  #       templateUrl: 'templates/profile.html',
  #       controller: 'ProfileCtrl'
  #     }
  #   }
  # }

  # .state 'login', {
  #   url: '/login',
  #   templateUrl: 'templates/login.html',
  #   controller: 'LoginCtrl'
  # } 

  # $urlRouterProvider.otherwise '/tab/mapEdit'
    $stateProvider

    .state('map', {
      url: "/map",
      templateUrl: 'templates/mapEdit.html',
      controller: 'MapEditCtrl'
    })

    .state('profile', {
      url: "/profile",
      templateUrl: 'templates/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        auth: ( $q, $injector, LoginService ) ->
          return LoginService.getSignedInUser()
      }
    })

    .state('loginTemp', {
      url: "/loginTemp",
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl',
    })

    # .state('app.browse', {
    #   url: "/browse",
    #   views: {
    #     'menuContent' :{
    #       templateUrl: "templates/browse.html"
    #     }
    #   }
    # })
    # .state('app.playlists', {
    #   url: "/playlists",
    #   views: {
    #     'menuContent' :{
    #       templateUrl: "templates/playlists.html",
    #       controller: 'PlaylistsCtrl'
    #     }
    #   }
    # })

    # .state('app.single', {
    #   url: "/playlists/:playlistId",
    #   views: {
    #     'menuContent' :{
    #       templateUrl: "templates/playlist.html",
    #       controller: 'PlaylistCtrl'
    #     }
    #   }
    # });
  
    # if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/map');