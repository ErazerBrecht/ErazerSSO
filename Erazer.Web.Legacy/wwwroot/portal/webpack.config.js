const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');

const sourcePath = path.join(__dirname, './src');
const destPathLocal = path.join(__dirname, './dist/');
const destPathServer = path.join(__dirname, '../dist/portal/');

module.exports = function (env) {
  let nodeEnv = 'development';
  let isProd = false;
  let isServer = false;
  let isLocal = false;

  if (env && env.prod){
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
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
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
      new HtmlWebpackPlugin(
        {
          filename: 'index.html',
          template: './index.html',
          inject: false,
          minify: false,                    // TODO Enable this!
          chunks: 'all',
          chunksSortMode: 'auto'
        }),
      new HtmlReplaceWebpackPlugin(
        {
          pattern: '@@baseUrl',
          replacement: '"/portal/"'
        })
    );
  } else if (isServer) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html',
        inject: false,
        minify: false,
        chunks: 'all',
        chunksSortMode: 'auto'
      }),
      new HtmlReplaceWebpackPlugin({
        pattern: '@@baseUrl',
        replacement: '"/portal/"'
      })
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin(
        {
          filename: 'index.html',
          template: './index.html',
          inject: false,
          minify: false,
          chunks: 'all',
          chunksSortMode: 'auto'
        }),
      new HtmlReplaceWebpackPlugin(
        {
          pattern: '@@baseUrl',
          replacement: '"/"'
        })
    );
  }

  return {
    devtool: isProd ? 'source-map' : 'eval',
    context: sourcePath,
    entry: {
      main: sourcePath + '/app/app.module.ts',
      vendor: [
        'angular/angular.js',
        'angular-aria/angular-aria.js',
        'angular-material/angular-material.js',
        'angular-messages/angular-messages.js',
        'angular-sanitize/angular-sanitize.js',
        'angular-animate/angular-animate.js',
        'angular-material-data-table/dist/md-data-table.js',
        '@uirouter/angularjs/release/angular-ui-router.js'
      ]
    },
    output: {
      path: isProd || isServer ? destPathServer : destPathLocal,
      publicPath: '/dist/',
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
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            'ng-annotate-loader',
            'awesome-typescript-loader'
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts'],
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
      publicPath: '/',
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
