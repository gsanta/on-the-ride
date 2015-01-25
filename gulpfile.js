var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var jasmine = require('gulp-jasmine');
var coffee = require('gulp-coffee');
var karma = require('karma').server;
var coffeelint = require("gulp-coffeelint");
var connect = require('gulp-connect');
var coffeeify = require('gulp-coffeeify');
var browserify = require('gulp-browserify');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['connect']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch('www/src/**/*.coffee', ['coffeeLint', 'coffeeify'])
  // gulp.watch(['www/js/**/*.js', 'tests/**/*.js'], ['test'])
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

// gulp.task('jasmine', function() {
//   gulp.src('tests/**/*.spec.js')
//   .pipe(jasmine());
// })

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('coffee', function() {
  gulp.src('www/src/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('www/js'))
});

gulp.task('coffeeLint', function () {
    gulp.src('www/src/**/*.coffee')
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});

gulp.task('connect', function() {
  connect.server({
    port: 8001,
    livereload: true
  });
});

gulp.task('coffeeify', function() {

  gulp.src('www/src/app.coffee', { read: false })
  .pipe(browserify({
    transform: ['coffeeify'],
    extensions: ['.coffee'],
    debug: true
  }))
  .pipe(rename('app.js'))
  .pipe(gulp.dest('www/js'))
});
