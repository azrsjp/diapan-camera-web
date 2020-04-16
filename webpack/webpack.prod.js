const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

module.exports = merge(common.webpackConfig, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: false,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new ImageminPlugin({
      optipng: {
        optimizationLevel: 7,
      },
      pngquant: {
        quality: '70',
        speed: 1,
      },
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 8,
          compress: true,
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
    ],
  },
});
