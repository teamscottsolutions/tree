const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: 'tree_builder.js',
    library: 'kigi',
    libraryTarget: 'umd',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                regenerator: true
              }],
              ['@babel/plugin-transform-modules-commonjs'],
            ]
          }
        }
      }
    ]
  }
};
