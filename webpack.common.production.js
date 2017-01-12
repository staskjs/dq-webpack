const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

module.exports = {

  devtool: false,

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      exclude: /\.min.js$/,
      sourceMap: false,
    }),
    new CleanWebpackPlugin(['build'], {
      root: path.join(__dirname, 'public'),
      verbose: true,
      dry: false,
    }),
    function() {
      this.plugin("done", function(stats) {
        const fs = require('fs');
        const buildPath = path.join(__dirname, 'public', 'build');
        if (!fs.existsSync(buildPath)) {
          fs.mkdirSync(buildPath);
        }
        fs.writeFileSync(path.join(buildPath, 'hash.txt'), stats.hash);
      });
    },
  ],
};
