'use strict';

var spawn = require('child_process').spawn;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/
});
var revall = require('gulp-rev-all');
var webpack = require("webpack");
var runSequence = require('run-sequence');
var nib = require('nib');
var stylusConfig = { use: [nib()] };

var defaultEnv = $.util.env._[0] === 'build' ? 'prod' : 'dev';
$.util.env.type = $.util.env.type || defaultEnv;
$.util.log('Environment is `' + $.util.env.type + '`.');
if (defaultEnv === 'prod') {
  // this makes webpack's envify-loader kick in
  process.env.NODE_ENV = 'production';
}

var serverEntry   = '/server/server-gulp.js';
var webpackPrefix = 'bundle';
var srcPath       = './src';
var dstProdPath   = './prod';
var dstDevPath    = './dev-gulp';
var dstHashPath   = '-hashed';
var client        = '/client';
var server        = '/server';

var paths = {
  src: {
    css:         srcPath + '/styles',
    cssWatch:    srcPath + '/styles/**/*',
    cssCompile: [srcPath + '/styles/app.styl',
           '!' + srcPath + '/styles/_*.styl'],
    js:          srcPath + '/js',
    jsWatch:     [srcPath + '/js/**/*', srcPath + '/js/**/*.jsx'],
    jsServer:    srcPath + '/js/server/**/*'
  },
  dst: {
    dev: {
      root:       dstDevPath,
      css:        dstDevPath + client + '/css',
      js:         dstDevPath + client + '/js',
      jsServer:   dstDevPath + server + '/js'
    },
    prod: {
      root:       dstProdPath,
      rootHashed: dstProdPath + dstHashPath,
      css:        dstProdPath + client + '/css',
      js:         dstProdPath + client + '/js',
      jsServer:   dstProdPath + server + '/js'
    }
  }
};

gulp.task('stylus', function () {
  return gulp.src(paths.src.cssCompile)
    .pipe($.stylus(stylusConfig))
    .on('error', $.util.log)
    .pipe($.autoprefixer())
    .pipe($.util.env.type === 'prod' ? $.csso() : $.util.noop())
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[$.util.env.type].css));
});

gulp.task('clean', function () {
  var pathsToClean = [paths.dst[$.util.env.type].root];
  if ($.util.env.type === 'prod') {
    pathsToClean.push(paths.dst[$.util.env.type].rootHashed);
  }
  return gulp.src(pathsToClean, { read: false })
    .pipe($.rimraf())
    .on('error', $.util.log);
});

gulp.task('copy:server', function () {
  return gulp.src(paths.src.jsWatch)
    .pipe(gulp.dest(paths.dst[$.util.env.type].jsServer));
});

gulp.task('webpack', function() {
  return gulp.src('./src/js')
    .pipe($.webpack({
      cache: true,
      devtool: "source-map",
      entry: {
        entry: "./src/js/views/entry",
        fake: "./src/js/webpack-common"
      },
      output: {
        path: __dirname + paths.dst[$.util.env.type].root,
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
      plugins: [new webpack.optimize.CommonsChunkPlugin("common.bundle.js")]
    }, webpack))
    // TODO uglify fails
//    .pipe($.util.env.type === 'prod' ? $.uglify() : $.util.noop())
//    .pipe($.rename(webpackPrefix + '.js'))
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[$.util.env.type].js));
});

gulp.task('hash', function () {
  var filterServer = $.filter(['**/*.js', '**/*.jsx']);
  var filterClient = $.filter(['**/*', '!**/*.js', '!**/*.jsx', '**/*' + webpackPrefix + '*.js'])
  return gulp.src([
      paths.dst[$.util.env.type].root + client + '/**/*',
      paths.dst[$.util.env.type].root + server + '/**/*'
    ])
    .pipe(revall())
    .pipe(filterServer)
    .pipe(gulp.dest(paths.dst[$.util.env.type].rootHashed + server))
    .pipe(filterServer.restore())
    .pipe(filterClient)
    .pipe(gulp.dest(paths.dst[$.util.env.type].rootHashed + client));
});

var httpDev;
gulp.task('http:dev', ['copy:server'], function () {
  if (httpDev) {
    httpDev.kill('SIGTERM');
  }
  httpDev = spawn('node', ['--harmony', paths.src.js + serverEntry], { stdio: 'inherit' });
});

gulp.task('build', function (callback) {
  runSequence('clean',
    ['stylus', 'webpack', 'copy:server'],
    'hash',
    callback);
});

gulp.task('default', function (callback) {
  runSequence('clean',
    ['stylus', 'webpack', 'copy:server'],
    'http:dev', callback);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.jsWatch,     ['webpack', 'http:dev']);
});

