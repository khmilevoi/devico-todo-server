const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: ['./src/index.js'],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: ['/__tests__/**.*'],
      },
    ],
  },
  target: 'node',
  plugins: [new CleanWebpackPlugin()],
  externals: [nodeExternals()],
};
