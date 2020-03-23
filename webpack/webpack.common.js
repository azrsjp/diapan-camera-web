const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const appTitle = 'だいあぱんカメラ';
const appVersion = '0.1';
const basePath = __dirname + '/..';

exports.basePath = basePath;
exports.webpackConfig = {
  entry: {
    main: path.resolve(basePath, 'src/scripts/main.ts'),
  },
  output: {
    path: path.resolve(basePath, 'build/js'),
    filename: '[name].js',
    publicPath: 'js/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      // FOLLOW tsconfig.json: "include":
      path.resolve(basePath, 'src/scripts'),
      path.resolve(basePath, 'node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        query: {
          pretty: true,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // App Config
      APP_TITLE: JSON.stringify(appTitle),
      APP_VERSION: JSON.stringify(appVersion),
    }),
    // Move .htmls to build to publish
    new HtmlWebpackPlugin({
      title: appTitle + ' v' + appVersion,
      filename: '../index.html',
      template: path.resolve(basePath, 'src/index.pug'),
      inject: true,
      alwaysWriteToDisk: true,
    }),
    // Add defer property to auto inserted <script>
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: '../assets',
        ignore: ['.DS_Store'],
      },
      {
        from: 'src/css',
        to: '../css',
        ignore: ['.DS_Store'],
      },
    ]),
  ],
  performance: {
    hints: false,
  },
};
