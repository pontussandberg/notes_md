const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, 'src')],
        use: 'ts-loader',
      },

      {
        test: /\.tsx?/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ]
          }
        }
      },

      {
        test: /\.css$/,
        use: [
          "style-loader",
          'css-modules-typescript-loader',
          "css-loader"
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
  devServer: {
    hot: true,
    compress: true,
    contentBase: './build',
    port: 3000,
    static: './public',
    port: '3000',
  },
  devtool: 'eval-source-map',
  output: {
    publicPath: '/',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};