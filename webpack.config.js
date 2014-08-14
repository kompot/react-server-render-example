var webpack = require('webpack');
var _ = require("lodash");
var path = require('path');
var paths = require('./gulppaths');
var nib = require('nib');
var jeet = require('jeet');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var baseConfig = {
  // enabling source maps decreases compilation speed significantly
//  devtool: 'source-map',
  progress: true,
  entry: {
    entry: [
      './src/js/views/entry.jsx'
    ],
    fake: ['./src/js/fake.js']
  },
  output: {
    path: path.join(__dirname, (paths.dst[process.env.NODE_ENV] && paths.dst[process.env.NODE_ENV].root) || './dev'),
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
      { test: /\.styl$/,
        loaders: [
          ExtractTextPlugin.loader({remove: false, extract: false}),
          'style',
          ExtractTextPlugin.loader({remove: false, extract: true}),
          'css',
          'autoprefixer?browsers=last 2 version,> 1%',
          'stylus'
        ]
      },
      { test: /\.jsx$/, loaders: ['react-hot', 'jsx?harmony'] },
      { test: /\.json$/, loader: 'json' }
    ],
    postLoaders: [{
      loader: "transform?envify"
    }]
  },
  plugins: [
    // plugins managed afterwards, insert with caution
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // /plugins managed afterwards, insert with caution
    new webpack.optimize.CommonsChunkPlugin('common', 'common.bundle.js', ['entry', 'fake']),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new ExtractTextPlugin('[name].css')
  ]
};

if (process.env.NODE_ENV === 'production') {
  delete baseConfig.plugins[1];
  delete baseConfig.devtool;
} else {
  delete baseConfig.plugins[0];
  for (var entry in baseConfig.entry) {
    baseConfig.entry[entry].push('webpack-dev-server/client?http://localhost:3000');
    baseConfig.entry[entry].push('webpack/hot/dev-server');
  }
}
baseConfig.plugins = _.compact(baseConfig.plugins);

module.exports = baseConfig;
