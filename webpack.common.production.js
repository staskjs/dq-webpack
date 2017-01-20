const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

module.exports = function(rootDir, params = {}) {
  const publicDir = params.publicDir != null
    ? params.publicDir
    : path.join(rootDir, 'public');
  return {
    devtool: false,

    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        exclude: /\.min.js$/,
        sourceMap: false,
      }),
      new CleanWebpackPlugin(['build'], {
        root: publicDir,
        verbose: true,
        dry: false,
      }),
      function() {
        this.plugin("done", function(stats) {
          const fs = require('fs');
          const buildPath = path.join(publicDir, 'build');
          if (!fs.existsSync(buildPath)) {
            fs.mkdirSync(buildPath);
          }
          fs.writeFileSync(path.join(buildPath, 'hash.txt'), stats.hash);
        });
      },
    ],
  };
};
