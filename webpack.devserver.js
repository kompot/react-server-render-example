var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: 'http://localhost:3000/js/',
  contentBase: 'http://localhost:8080',
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
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Webpack listening at localhost:3000');
});
