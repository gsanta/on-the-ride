module.exports = function(config){
  config.set({
    basePath : '.',

    files: [
      'www/lib/ionic/js/ionic.bundle.js',
      'www/lib/ionic/js/angular/angular-mocks.js',
      'www/js/controllers/index.js',
      'www/js/services/index.js',
      'www/js/services/DataProviderService.js',
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
