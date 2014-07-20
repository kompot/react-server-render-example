'use strict';

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
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

var implicitEnvsByTask = {
  'default':   'development',
  'build':     'production',
  'pagespeed': 'production',
  'run':       'production',
  'test':      'production'
}
var task = $.util.env._[0];
var implicitEnv = implicitEnvsByTask[task] ? implicitEnvsByTask[task] : 'development';
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
  // not async
  // http://stackoverflow.com/questions/21699146/gulp-js-task-return-on-src
  // should be fixed for correct task ordering
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

var revAllOptions = {
  transformFilename: function (file, hash) {
    var ext = path.extname(file.path);
    if (file.path.indexOf(paths.serverEntry) != -1) {
      return path.basename(file.path, ext) + ext;
    } else {
      return path.basename(file.path, ext) + '.' + hash.substr(0, 8) + ext;
    }
  }
};

var revAllSrc = {
  client: paths.dst[process.env.NODE_ENV].root + paths.client + '/**/*',
  server: paths.dst[process.env.NODE_ENV].root + paths.server + '/**/*'
};

gulp.task('hash:client', function () {
  return gulp.src(revAllSrc.client)
    .pipe($.revAll(revAllOptions))
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].rootHashed + paths.client));
});

gulp.task('hash:server', function () {
  return gulp.src(revAllSrc.server)
    .pipe($.revAll(revAllOptions))
    .pipe(gulp.dest(paths.dst[process.env.NODE_ENV].rootHashed + paths.server));
});

gulp.task('hash', function (callback) {
  // these 2 should be run sequentially as gulp-rev-all keeps state
  // between runs (as we share options between tasks and gulp-rev-all stores
  // state in there) and this leads to a nice effect of revisioning client
  // assets in server files but may disappear any moment
  // https://github.com/smysnk/gulp-rev-all/issues/28
  runSequence('hash:client', 'hash:server', callback)
});

require('coffee-script/register');

gulp.task('test:private', function (callback) {
  gulp.src(paths.tst.root, { read: false })
      .pipe($.mocha({
        reporter: 'spec',
        require: 'chai',
        timeout: 100000
      }, callback));
});

var httpServer;
gulp.task('http', function (callback) {
  if (httpServer) {
    httpServer.kill('SIGTERM');
  }
  // TODO optimize paths, think about hashed as a separate environment
  var entryPoint = process.env.NODE_ENV === 'production' ?
      paths.dst.production.rootHashedServer + '/js' + paths.serverEntry :
      paths.src.js + paths.serverEntry;
  if (process.env.NODE_ENV === 'production') {
    process.env.NODE_STATIC_DIR = paths.dst.production.rootHashedClient
  } else {
    delete process.env.NODE_STATIC_DIR;
  }
  httpServer = spawn('node', ['--harmony', entryPoint], {stdio: 'inherit'});
  setTimeout(function () {
    // some delay to let node start up before reporting it's up
    // should be replaced with a real watcher
    callback()
  }, 100);
});

gulp.task('http:kill', function (callback) {
  if (httpServer) {
    httpServer.kill('SIGTERM');
  }
  callback()
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

gulp.task('pagespeed:private', function(callback) {
  runSequence('pagespeed:ngrok', 'pagespeed:ngrok-disconnect', callback);
});

gulp.task('build', function (callback) {
  runSequence('clean', 'lint:js',
    ['stylus', 'webpack', 'copy:server'],
    'hash',
    callback);
});

gulp.task('run', function (callback) {
  runSequence('build', 'http', callback)
});

gulp.task('test', function (callback) {
  runSequence('run', 'test:private', 'http:kill', callback);
});

gulp.task('pagespeed', function (callback) {
  runSequence('run', 'pagespeed:private', 'http:kill', callback);
});

gulp.task('default', function (callback) {
  runSequence('clean',
    ['lint:js', 'stylus', 'webpack', 'copy:server'],
    'fb-flo', 'http', callback);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.jsWatch,     ['lint:js', 'webpack', 'http']);
});

