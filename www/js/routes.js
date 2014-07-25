
define(['app'], function (app) {
    'use strict';

    app.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

        $stateProvider
        // setup an abstract state for the tabs directive
        .state('tab', {
          url: "/tab",
          abstract: true,
          templateUrl: "templates/tabs.html"
        })

        // Each tab has its own nav history stack:

        .state('tab.dash', {
          url: '/dash',
          views: {
            'tab-dash': {
              templateUrl: 'templates/map.html',
              controller: 'MapCtrl'
            }
          }
        })

        .state('tab.friends', {
          url: '/friends',
          views: {
            'tab-friends': {
              templateUrl: 'templates/place_info_form.html',
              controller: 'PlaceInfoCtrl'
            }
          }
        })
        .state('tab.friend-detail', {
          url: '/friend/:friendId',
          views: {
            'tab-friends': {
              templateUrl: 'templates/friend-detail.html',
              controller: 'FriendDetailCtrl'
            }
          }
        })

        .state('tab.account', {
          url: '/account',
          views: {
            'tab-account': {
              templateUrl: 'templates/tab-account.html',
              controller: 'AccountCtrl'
            }
          }
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    }]);
});