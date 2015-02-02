// var classesModule, controllersModule, directivesModule, servicesModule;

// servicesModule = angular.module("services", []);

// classesModule = angular.module("classes", []);

// directivesModule = angular.module("directives", []);

// controllersModule = angular.module("controllers", ["services", "directives"]);

// require('./services');

// require('./dao');

// require('./editor');

// require('./map_builder');

// require('./map_calculation');

// require('./misc');

// require('./profile');

// require('./security');

// servicesModule.config(function($httpProvider) {
//   return $httpProvider.responseInterceptors.push('SecurityInterceptor');
// });

// angular.module('starter', ['ionic', 'controllers', 'services', 'classes', 'directives', 'ui.gravatar']).run(function($ionicPlatform, $rootScope, $location, LoginService) {
//   return $ionicPlatform.ready(function() {
//     if ((window.cordova != null) && (window.cordova.plugins.Keyboard != null)) {
//       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//     }
//     if (window.StatusBar != null) {
//       return StatusBar.styleDefault; 
//     }
//   });
// }).config(function($stateProvider, $urlRouterProvider) {
//   $stateProvider.state('map', {
//     url: "/map",
//     templateUrl: 'templates/mapEdit.html',
//     controller: 'MapEditCtrl'
//   }).state('profile', {
//     url: "/profile",
//     templateUrl: 'templates/profile.html',
//     controller: 'ProfileCtrl',
//     resolve: {
//       auth: function($q, $injector, LoginService) {
//         return LoginService.getSignedInUser();
//       }
//     }
//   }).state('loginTemp', {
//     url: "/loginTemp",
//     templateUrl: 'templates/login.html',
//     controller: 'LoginCtrl'
//   });
//   return $urlRouterProvider.otherwise('/map');
// });

var classesModule, controllersModule, directivesModule, servicesModule;

servicesModule = angular.module("services", []);

classesModule = angular.module("classes", []);

directivesModule = angular.module("directives", []);

controllersModule = angular.module("controllers", ["services", "directives"]);

require('./services');

require('./dao');

require('./editor');

require('./map_builder');

require('./map_calculation');

require('./misc');

require('./profile');

require('./security');

servicesModule.config(function($httpProvider) {
  return $httpProvider.responseInterceptors.push('SecurityInterceptor');
});

angular.module('starter', ['ionic', 'controllers', 'services', 'classes', 'directives', 'ui.gravatar']).run(function($ionicPlatform, $rootScope, $location, LoginService) {
  return $ionicPlatform.ready(function() {
    if ((window.cordova != null) && (window.cordova.plugins.Keyboard != null)) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar != null) {
      return StatusBar.styleDefault; 
    }
  });
}).config(function($stateProvider, $urlRouterProvider) {
  
  $urlRouterProvider.when('', '/');

  $stateProvider 
  .state("root", {
    url: "/",
    templateUrl: 'templates/root.html',
    controller: 'AppCtrl'
  })
  .state('root.map', {
    url: "^/map",
    templateUrl: 'templates/mapEdit.html',
    controller: 'MapEditCtrl'
  })
  .state('main.profile', {
    url: "^/profile",
    templateUrl: 'templates/profile.html',
    controller: 'ProfileCtrl',
    resolve: {
      auth: function($q, $injector, LoginService) {
        return LoginService.getSignedInUser();
      }
    }
  })
  // .state('loginTemp', { 
  //   url: "/loginTemp",
  //   templateUrl: 'templates/login.html',
  //   controller: 'LoginCtrl'
  // });

  $urlRouterProvider.otherwise('/map');

});
