/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


// For our css modules these will be locally scoped
const CSSModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: true,
    localIdentName: '[name]_[local]_[hash:base64:5]',
    importLoaders: 2,
    camelCase:true,
    sourceMap: false, // turned off as causes delay
  }
}
// For our normal CSS files we would like them globally scoped
const CSSLoader = {
  loader: 'css-loader',
  options: {
    modules: "global",
    importLoaders: 2,
    camelCase:true,
    sourceMap: false, // turned off as causes delay
  }
}
// Our PostCSSLoader
const autoprefixer = require('autoprefixer')
const PostCSSLoader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    sourceMap: false, // turned off as causes delay
    plugins: () => [
      autoprefixer({
        browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']
      })
    ]
  }
}

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve('../server/src/dist'),
    publicPath: '/',
  },
  devServer: {
    hot: true,
    compress: true,
    contentBase: './build',
    port: 3000,
    historyApiFallback: true,
    proxy: [{
      // context: [ '/api', '/auth', '/socket' ],
      target: 'http://localhost:3000',
      ws: true,
    }],
  },
  devtool: 'eval-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'minify',
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },

      // Css
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /\.module\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin, CSSLoader, PostCSSLoader, "sass-loader"]
      },
      {
        test: /\.module\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin, CSSModuleLoader, PostCSSLoader, "sass-loader"]
      },

      {
        test: /\.(?:png|jpe?g|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: 'media/[name].[ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      scriptLoading: 'defer',
      template: './public/index.html',
      favicon: './src/media/favicon.ico',
    }),
  ],
};
