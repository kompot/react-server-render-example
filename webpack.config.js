var webpack = require('webpack');
var path = require('path');
var paths = require('./gulppaths');
var nib = require('nib');
var jeet = require('jeet');

var baseConfig = {
//  stats: {
//    timings: true,
//  },
//  cache: true,
//  devtool: 'source-map',
//  watch: true,
//  watchDelay: 50,
  progress: true,
  allChunks: true,
  entry: {
    entry: [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/dev-server',
      './src/js/views/entry.jsx'
    ],
    fake: ['./src/js/fake.js']
  },
  output: {
    path: path.join(__dirname, paths.dst[process.env.NODE_ENV].root),
    publicPath: 'http://localhost:3000/js/',
    filename: '[name].bundle.js',
    chunkFilename: "[hash]/js/[id].js",
    hotUpdateMainFilename: "[hash]/update.json",
    hotUpdateChunkFilename: "[hash]/js/[id].update.js"
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.styl', '.css']
  },
  stylus: {
    use: [nib(), jeet()]
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['react-hot', 'envify', 'jsx?harmony'] },
      { test: /\.json$/, loader: 'json' },
      { test: /\.styl$/, loaders: ['style', 'css', 'stylus'] }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common.bundle.js', ['entry', 'fake']),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.HotModuleReplacementPlugin()
  ]
};

module.exports = {
  development: baseConfig,
  production:  baseConfig
};
