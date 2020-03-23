const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = merge(common.webpackConfig, {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: true,
    }),
    new WriteFilePlugin(),
  ],
  devServer: {
    contentBase: path.resolve(common.basePath, 'build'),
    port: 8080,
    inline: true,
    host: '0.0.0.0',
    https: true,
    disableHostCheck: true,
    watchContentBase: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true,
      ignored: /node_modules/,
    },
  },
});
