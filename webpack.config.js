var webpack = require('webpack');
var _ = require("lodash");
var path = require('path');
var paths = require('./gulppaths');
var nib = require('nib');
var jeet = require('jeet');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var baseConfig = {
  // disable source maps to increase compilation speed significantly
  devtool: 'source-map',
  progress: true,
  entry: {
    entry: [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/dev-server',
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
          'style',
          // extract CSS is disabled in dev mode as this plugin is not able
          // to extract CSS and also leave it in the bundle
          // and hot reloading stops working when CSS is not injected via JS
          ExtractTextPlugin.extract(),
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
  for (var entry in baseConfig.entry) {
    // TODO add webpack modules for dev environment instead of removing
    // for production
    baseConfig.entry[entry] = _.compact(_.map(baseConfig.entry[entry], function (e) {
      if (!(e.indexOf('webpack') === 0)) {
        return e;
      }
    }));
  }
  delete baseConfig.devtool;
  delete baseConfig.plugins[1];
} else {
  for (var i = 0; i < baseConfig.module.loaders.length; i++) {
    if (baseConfig.module.loaders[i].test.test('.styl')) {
      delete baseConfig.module.loaders[i].loaders[1];
      baseConfig.module.loaders[i].loaders = _.compact(baseConfig.module.loaders[i].loaders);
    }
  }
  delete baseConfig.plugins[0];
}
baseConfig.plugins = _.compact(baseConfig.plugins);

module.exports = baseConfig;
