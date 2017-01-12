# Digitalquill webpack config

This package contains common config for webpack

# Usage

    ```javascript
    const buildBaseConfig = require('dq-webpack');

    const baseConfig = buildBaseConfig({});

    const config = baseConfig.merge({

      entry: {
        myEntry: pathToEntryFile,
      },

      anyOtherWebpackOption: {},

    });

    // Add custom config for production
    if (process.env.APP_ENV === 'production') {
      config.merge({
      });
    }

    module.exports = config;
    ```
