const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const ExtractPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HappyPack = require('happypack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const product = process.env.product;
const title = process.env.title;

const PRODUCT_SRC = path.join(__dirname, '..', product, '/src');
const ASSETS_PATH = path.join(__dirname, '../dist', product, '/assets');

module.exports = {
  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  postcss() {
    return [precss, autoprefixer];
  },

  plugins: [
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, '../'),
      manifest: require(path.join(ASSETS_PATH, '/vendor-manifest.json'))
    }),
    new HappyPack({
      id: 'babel',
      cache: true,
      threads: 4,
      loaders: [{
        path: path.join(__dirname, '../node_modules/babel-loader/lib/index.js'),
        query: '?' + JSON.stringify({ cacheDirectory: true })
      }]
    }),
    new ExtractPlugin('bundle.css'),
    new CopyWebpackPlugin([
      { from: path.join(PRODUCT_SRC, '/sources/fonts.xml'), to: 'fonts.xml' },
      { from: path.join(PRODUCT_SRC, '/sources/spec.xml'), to: 'spec.xml' },
      { from: path.join(PRODUCT_SRC, '/browser.html'), to: 'browser.html' },
      { from: path.join(PRODUCT_SRC, '/browser-image.svg'), to: 'browser-image.svg' },
      { from: path.join(PRODUCT_SRC, '/store.ico'), to: 'store.ico' }
    ]),
    new HtmlWebpackPlugin({
      title,
      filename: 'index.html',
      template: path.join(PRODUCT_SRC, '/index.html'),
      excludeChunks: ['i18n'],
      hash: true
    }),
    new AddAssetHtmlPlugin([
      {
        filepath: path.join(ASSETS_PATH, '/vendor.js'),
        hash: true,
        includeSourcemap: false
      }
    ]),
    new WebpackAssetsManifest({
      output: 'manifest.json'
    })
  ],

  module: {
    loaders: [
      {
        test: /\.s?css$/,
        loader: ExtractPlugin.extract('style', 'css!postcss!sass')
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loaders: ['file']
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loaders: ['url?limit=10000&mimetype=application/octet-stream']
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loaders: ['url?limit=10000&mimetype=image/svg+xml']
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loaders: ['url?prefix=font/&limit=5000']
      },
      {
        test: /\.(png|jpg|gif)$/,
        loaders: ['url?limit=8192'],
        exclude: /node_modules/
      },
      {
        test: /\.yml$/,
        loader: 'file?name=[name].json?[hash]&context=./i18n/!yaml',
      }
    ]
  }
};
