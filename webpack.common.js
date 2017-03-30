const dotEnv = require('dotenv');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
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

module.exports = function(rootDir, params = {}) {
  const babelNodeExcept = params.babelNodeExcept || [];

  if (babelNodeExcept.indexOf('dq') === -1) {
    babelNodeExcept.push('dq');
  }

  let config = {

    output: {
      path: path.join(rootDir, 'public', 'build'),
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
          loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: `css-loader!sass-loader?sourceMap&includePaths[]=${bourbon}`
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
      new WebpackNotifierPlugin(),
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
        config:   path.join(rootDir, 'config'),
        jquery: path.join(rootDir, 'node_modules', 'jquery', 'dist', 'jquery'),
      }
    },

    watchOptions: {
      aggregateTimeout: 200
    },
  };

  config = new Config().merge(config);

  if (APP_ENV === 'production') {
    const productionParams = params.production != null ? params.production : {};
    config.merge(require('./webpack.common.production')(rootDir, productionParams));
  }

  return config;
};
