var webpack = require('webpack');
var _ = require("lodash");
var path = require('path');
var paths = require('./gulppaths');

var baseConfig = {
//  progress: true,
  entry: {
    server: ['./src/js/server/server.js']
  },
  watch: 'true',
  bail: 'true',
  target: 'node',
  node: {
    console: true,
    process: true,
    global: true,
    buffer: true,
    __filename: true,
    __dirname: true
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.styl', '.css']
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['react-hot', 'jsx?harmony'] },
      { test: /\.json$/, loader: 'json' }
    ],
    postLoaders: [{
      loader: "transform?envify"
    }]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true)
  ]
};

if (process.env.NODE_ENV === 'production') {
  delete baseConfig.watch;
}

module.exports = baseConfig;
