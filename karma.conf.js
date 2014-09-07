module.exports = function(config){
  config.set({
    basePath : '.',

    files: [
      'www/lib/angular/angular.min.js',
      'www/lib/angular-animate/angular-animate.min.js',
      'www/lib/angular-sanitize/angular-sanitize.min.js',
      'www/lib/angular-touch/angular-touch.min.js',
      'www/lib/angular-ui-router/release/angular-ui-router.min.js',
      'www/lib/ionic/release/js/ionic.min.js',
      'www/lib/ionic/release/js/ionic-angular.min.js',  
      'www/lib/angular-mocks/angular-mocks.js',  
      'www/js/controllers/index.js',
      'www/js/services/index.js',
      'www/js/services/DataProviderService.js',
      'www/js/classes/index.js',
      'www/js/classes/Coord.js',
      'www/js/**/*.js',
      /*'tests/helper.js',*/
      'tests/spec/**/*.spec.js'
    ],


    exclude : [

    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-script-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
};
