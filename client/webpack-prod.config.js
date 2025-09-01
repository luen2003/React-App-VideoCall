const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: {
    app: './src/index.js'
  },
  output: {
    publicPath: '/',  // Webpack will use this to reference assets
    path: path.resolve(__dirname, 'dist'),  // Output directory
    filename: 'js/[name].[contenthash].js',  // Output JS file with hash for cache busting
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      },
      {
        test: require.resolve('webrtc-adapter'),
        use: 'expose-loader'
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,  // Extract CSS into separate files
          'css-loader',  // Load CSS files
          'sass-loader'  // Compile SCSS to CSS
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/i,
        type: 'asset/resource',  // Use asset modules for images, fonts, etc.
        generator: {
          filename: 'assets/[name].[hash][ext][query]',  // Output asset files
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),  // Output CSS to 'css' folder with hash
    new HtmlWebpackPlugin({
      title: 'React VideoCall',
      filename: 'index.html',
      template: 'src/html/index.html',  // Use the template for generating HTML file
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: { ecma: 6 }
      })
    ]
  }
};
