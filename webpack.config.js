var webpack = require('webpack');
var path = require('path');

const PATHS = {
  internal: path.resolve(__dirname, 'internal')
}

module.exports = {
    devtool: 'inline-source-map',
    entry: {
      data: path.resolve(PATHS.internal, 'src', 'index.jsx')
    },
    output: {
      path: path.resolve(PATHS.internal, 'dist'),
      filename: '[name].bundle.js',
    },
    module: {
      loaders: [
        {
          // babel loader that looks for .js files (excludes the node_modules...
          //... directory, and transforms es2016 to es5, and JSX to Javascript)
          test: /.js|.jsx$/,
          loader: 'babel',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react']
          }
        }
      ]
    }
  }