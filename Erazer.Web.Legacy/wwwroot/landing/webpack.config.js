const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlCriticalPlugin = require("html-critical-webpack-plugin");

const sourcePath = path.join(__dirname, './src');
const destPathLocal = path.join(__dirname, './dist/');
const destPathServer = path.join(__dirname, '../dist/landing/');

module.exports = function (env) {
  let nodeEnv = 'development';
  let isProd = false;
  let isServer = false;
  let isLocal = false;

  if (env && env.prod) {
    isProd = true;
    nodeEnv = 'production';
  }
  else if (env && env.server)
    isServer = true;
  else
    isLocal = true;

  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: nodeEnv,
    }),
    new webpack.NamedModulesPlugin(),
  ];

  if (isProd) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
        output: {
          comments: false,
        },
      }),
      new ExtractTextPlugin({ filename: 'style.css' }),
      new HtmlWebpackPlugin(
        {
          filename: 'index.html',
          template: './index.html',
          inject: true,
          minify: false,                    // TODO Enable this!
          chunks: 'all',
          chunksSortMode: 'auto'
        })
    );
  } else if (isServer) {
    plugins.push(
      new ExtractTextPlugin({ filename: 'style.css' }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html',
        inject: true,
        minify: false,
        chunks: 'all',
        chunksSortMode: 'auto'
      })
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin({ filename: 'style.css' }),
      new HtmlWebpackPlugin(
        {
          filename: 'index.html',
          template: './index.html',
          inject: true,
          minify: false,
          chunks: 'all',
          chunksSortMode: 'auto'
        })
    );
  }

  return {
    devtool: isProd ? 'source-map' : 'eval',
    context: sourcePath,
    entry: {
      main: sourcePath + '/js/inspinia.js',
      vendor: [
        'script-loader!jquery/dist/jquery.js',
        'script-loader!bootstrap/dist/js/bootstrap.js',
        'script-loader!metismenu/dist/metisMenu.js',
        'script-loader!jquery-slimscroll/jquery.slimscroll.js',
        'script-loader!wowjs/dist/wow.js'
      ]
    },
    output: {
      path: isProd || isServer ? destPathServer : destPathLocal,
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          exclude: /node_modules/,
          loader: 'html-loader'
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', options: { minimize: true } }
            ]
          })
        },
        {
          test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: 'url-loader?limit=10000'
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: 'file-loader'
        },
        {
          test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
          use: 'file-loader'
        },
      ],
    },
    resolve: {
      extensions: ['.js'],
      modules: [
        path.resolve(__dirname, 'node_modules'),
        sourcePath
      ]
    },

    plugins,

    performance: isProd && {
      maxAssetSize: 100,
      maxEntrypointSize: 300,
      hints: 'warning',
    },

    stats: {
      colors: {
        green: '\u001b[32m',
      }
    },
	


    devServer: {
      contentBase: 'dist/',
      historyApiFallback: true,
      port: 3000,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: false,
        timings: true,
        version: false,
        warnings: true,
        colors: {
          green: '\u001b[32m',
        }
      },
    }
  };
};
