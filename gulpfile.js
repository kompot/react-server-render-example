'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/,
  camelize: true
});
var webpack = require("webpack");
var runSequence = require('run-sequence');
var nib = require('nib');
var stylusConfig = { use: [nib()] };
var paths = require('./gulppaths.js');
var pagespeed = require('psi');
var ngrok = require('ngrok');

var implicitEnv = $.util.env._[0] === 'build' ? 'production' : 'development';
process.env.NODE_ENV = process.env.NODE_ENV || implicitEnv;
$.util.log('Environment is `' + process.env.NODE_ENV + '`.');

gulp.task('stylus', function () {
  return gulp.src(paths.src.cssCompile)
    .pipe($.stylus(stylusConfig))
    .on('error', $.util.log)
    .pipe($.autoprefixer())
    .pipe(process.env.NODE_ENV === 'production' ? $.csso() : $.util.noop())
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].css));
});

gulp.task('clean', function () {
  var pathsToClean = [paths.dst[process.env.NODE_ENV].root];
  if (process.env.NODE_ENV === 'production') {
    pathsToClean.push(paths.dst[process.env.NODE_ENV].rootHashed);
  }
  return gulp.src(pathsToClean, { read: false })
    .pipe($.rimraf())
    .on('error', $.util.log);
});

gulp.task('copy:server', function () {
  return gulp.src(paths.src.jsWatch)
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].jsServer));
});

var webpackConfig = {
  cache: true,
  devtool: "source-map",
  entry: {
    entry: "./src/js/views/entry",
    fake: "./src/js/webpack-common"
  },
  output: {
    path: __dirname + paths.dst[process.env.NODE_ENV].root,
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, loader: "envify-loader!jsx-loader?harmony"}
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("common.bundle.js"),
    new webpack.optimize.OccurenceOrderPlugin(true)
  ]
};

gulp.task('lint:js', function() {
  gulp.src(paths.src.jsWatch)
    .pipe($.react())
    .pipe($.traceur())
    .pipe($.eslint())
    .pipe($.eslint.formatEach(undefined, process.stderr))
    .pipe(process.env.NODE_ENV === 'production' ? $.eslint.failOnError() : $.util.noop());
});

gulp.task('webpack', function() {
  if (process.env.NODE_ENV === 'production') {
    delete webpackConfig.devtool;
  }
  return gulp.src(paths.src.js)
    .pipe($.webpack(webpackConfig, webpack))
    .pipe(process.env.NODE_ENV === 'production' ? $.uglify() : $.util.noop())
//    .pipe($.rename(webpackPrefix + '.js'))
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].js));
});

gulp.task('hash', function () {
  var filterServer = $.filter(['**/*.js', '**/*.jsx']);
  var filterClient = $.filter(['**/*', '!**/*.js', '!**/*.jsx', '**/*' + paths.webpackPrefix + '*.js'])
  return gulp.src([
      paths.dst[process.env.NODE_ENV].root + paths.client + '/**/*',
      paths.dst[process.env.NODE_ENV].root + paths.server + '/**/*'
    ])
    .pipe($.revAll())
    .pipe(filterServer)
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].rootHashed + paths.server))
    .pipe(filterServer.restore())
    .pipe(filterClient)
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].rootHashed + paths.client));
});

var httpDev;
gulp.task('http:dev', ['copy:server'], function () {
  if (httpDev) {
    httpDev.kill('SIGTERM');
  }
  httpDev = spawn('node', ['--harmony', paths.src.js + paths.serverEntry], { stdio: 'inherit' });
});

gulp.task('fb-flo', function () {
  var flo = require('fb-flo');
  var fs = require('fs');

  var server = flo(paths.dst.development.rootClient, {
      port: 8888,
      host: '127.0.0.1',
      glob: [ '**/*.js', '**/*.css' ]
    }, function resolver(filepath, callback) {
      callback({
        resourceURL: filepath,
        contents: fs.readFileSync(path.join(paths.dst.development.rootClient, filepath)),
        reload: false
      });
    }
  );

  server.once('ready', function() {
    $.util.log('Hot reloading js/css with `fb-flo` started.');
  });
});

gulp.task('pagespeed:ngrok', function (callback) {
  ngrok.connect(8080, function(err, url) {
    if (err) {
      $.util.log(err)
    }
    $.util.log('Will do PageSpeed test on', url);
    pagespeed({
      nokey: 'true',
      url: url,
      // apply `mobile` strategy, log results after each build
      strategy: 'desktop'
    }, callback);
  });
});

gulp.task('pagespeed:ngrok-disconnect', function () {
  ngrok.disconnect();
});

gulp.task('pagespeed', function(callback) {
  runSequence('pagespeed:ngrok', 'pagespeed:ngrok-disconnect', callback);
});

gulp.task('build', function (callback) {
  runSequence('clean', 'lint:js',
    ['stylus', 'webpack', 'copy:server'],
    'hash',
    callback);
});

gulp.task('default', function (callback) {
  runSequence('clean',
    ['lint:js', 'stylus', 'webpack', 'copy:server'],
    'fb-flo', 'http:dev', callback);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.jsWatch,     ['lint:js', 'webpack', 'http:dev']);
});

