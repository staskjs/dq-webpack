const dotEnv = require('dotenv');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { Config } = require('webpack-config');

dotEnv.config();

const isMac = process.platform === 'darwin';

const APP_ENV = process.env.APP_ENV;
process.env.NODE_ENV = APP_ENV;

const bourbon = require('node-bourbon').includePaths;

let outputFilename = '[name].js';
let stylesFilename = '[name].css';

if (APP_ENV === 'production') {
  outputFilename = '[name]-[hash].js'
  stylesFilename = '[name]-[hash].css';
}

module.exports = function(params = {}) {
  const babelNodeExcept = params.babelNodeExcept || [];

  if (babelNodeExcept.indexOf('dq') === -1) {
    babelNodeExcept.push('dq');
  }

  let config = {

    output: {
      path: path.join(__dirname, 'public', 'build'),
      publicPath: '/build/',
      filename: outputFilename,
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: new RegExp(`(node_modules\/(?!(${babelNodeExcept.join('|')})\/).*)`),
          loader: 'babel-loader',
        },
        {
          test: /\.(png|jpg|svg|gif|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader?name=[path][name].[ext]'
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?name=[path][name].[ext]&limit=10000&minetype=application/font-woff"
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader' })
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: `css-loader!sass-loader?sourceMap&includePaths[]=${bourbon}`
          })
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
      ]
    },

    plugins: [
      new webpack.DefinePlugin({
        WP_APP_ENV: JSON.stringify(APP_ENV),
        'process.env': {
          NODE_ENV: JSON.stringify(APP_ENV),
        },
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
      new ExtractTextPlugin(stylesFilename),
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: params.minChunks || 2,
      }),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
      new webpack.LoaderOptionsPlugin({
        vue: {
          esModule: true,
        }
      }),
    ],

    resolve: {
      extensions: ['.js', '.vue', '.json', '.min.js'],
      alias: {
        config:   path.join(__dirname, 'config'),
        jquery: path.join(__dirname, 'node_modules', 'jquery', 'dist', 'jquery'),
      }
    },

    watchOptions: {
      aggregateTimeout: 200
    },
  };

  config = new Config().merge(config);

  if (APP_ENV === 'production') {
    config.merge(require('./webpack.common.production'));
  }

  return config;
};