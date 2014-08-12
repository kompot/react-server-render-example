var webpack = require('webpack');
var _ = require("lodash");
var path = require('path');
var paths = require('./gulppaths');

// put here our those package.json dependencies
// that should be packed into our server bundle
var externalsExceptions = [];

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
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  externals: [],
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

var allPackages = require('./package.json');
function addToExternals (version, dep) {
  if (!_.contains(externalsExceptions, dep)) {
    baseConfig.externals.push(dep);
  }
}
_.forOwn(allPackages.dependencies, addToExternals);
_.forOwn(allPackages.devDependencies, addToExternals);

module.exports = baseConfig;
