var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.client');
var paths = require('./paths');

new WebpackDevServer(webpack(config), {
  publicPath: 'http://' + paths.webpackHost + ':' + paths.webpackPort + '/js/',
  contentBase: 'http://' + paths.devHost + ':' + paths.devPort,
  hot: true,
  stats: {
    colors: true,
    assets: true,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false, // set to true to get debug info on each file
    children: false
  }
}).listen(paths.webpackPort, paths.webpackHost, function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Webpack listening at ' + paths.webpackHost + ':' + paths.webpackPort);
});
