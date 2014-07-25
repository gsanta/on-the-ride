require.config({

    paths: {
        angular: '../lib/angular/angular',
        angularAnimate: '../lib/angular-animate/angular-animate',
        angularSanitize: '../lib/angular-sanitize/angular-sanitize',
        uiRouter: '../lib/angular-ui-router/release/angular-ui-router',
        ionic: '../lib/ionic/js/ionic',
        ionicAngular: '../lib/ionic/js/ionic-angular',
    },
    shim: {
        angular : {exports : 'angular'},
        angularAnimate : {deps: ['angular']},
        angularSanitize : {deps: ['angular']},
        uiRouter : {deps: ['angular']},
        ionic :  {deps: ['angular'], exports : 'ionic'},
        ionicAngular: {deps: ['angular', 'ionic', 'uiRouter', 'angularAnimate', 'angularSanitize']}
    },
    priority: [
        'angular',
        'ionic'
    ],
    deps: [
        // kick start application... see bootstrap.js
        'bootstrap'
    ]
});

