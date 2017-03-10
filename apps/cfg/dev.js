const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const commonConfig = require('./common');

const product = process.env.product;

const PRODUCT_SRC = path.join(__dirname, '..', product, '/src');
const PRODUCT_DIST = path.join(__dirname, '../dist', product, '/assets');

module.exports = merge(commonConfig, {
  debug: true,
  devtool: 'source-map',
  entry: {
    app: [
      'webpack-dev-server/client?http://localhost:8000',
      'webpack/hot/only-dev-server',
      path.join(PRODUCT_SRC, '/index')
    ],
    i18n: path.join(PRODUCT_SRC, '/i18n/index')
  },
  output: {
    path: PRODUCT_DIST,
    filename: '[name].js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __DEVELOPMENT__: true
    }),
    new WriteFilePlugin(),
    new WebpackNotifierPlugin({ alwaysNotify: true })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'happypack/loader?id=babel'],
        exclude: /node_modules/
      },
      {
        test: require.resolve('react-addons-perf'),
        loader: 'expose?Perf'
      }
    ]
  }
});
