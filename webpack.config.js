var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: {
    entry: "./src/js/views/entry",
    fake: "./src/js/webpack-common"
  },
  output: {
    path: __dirname + "/dev",
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
};
