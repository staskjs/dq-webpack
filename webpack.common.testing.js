const path = require('path');
const webpack = require('webpack');
const { Config } = require('webpack-config');

module.exports = function (rootDir, params = {}) {
  const babelNodeExcept = params.babelNodeExcept || [];

  if (babelNodeExcept.indexOf('dq') === -1) {
    babelNodeExcept.push('dq');
  }

  config = {

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: new RegExp(`(node_modules\/(?!(${babelNodeExcept.join('|')})\/).*)`),
          loader: 'babel-loader',
        },
        {
          test: /\.(png|jpg|svg|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader?name=[path][name].[ext]'
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?name=[path][name].[ext]&limit=10000&minetype=application/font-woff"
        },
        {
          test: /\.scss$/,
          loader: 'css-loader!sass-loader?sourceMap'
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
      ]
    },

    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),
      new webpack.LoaderOptionsPlugin({
        vue: {
          esModule: true,
        }
      }),
    ],

    devtool: 'inline-source-map',

    resolve: {
      extensions: ['.js', '.vue', '.json', '.min.js'],
      alias: {
        config:   path.join(__dirname, 'config'),
        spec_helper: path.join(__dirname, 'tests', 'js', 'unit', 'spec_helper'),
      }
    },
  };

  return new Config().merge(config);
};
