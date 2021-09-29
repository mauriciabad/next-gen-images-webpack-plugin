const path = require('path')
const { MyPlugin } = require('./plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve('dist'),
    publicPath: '/',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif|avif|jxl|webp)$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: true,
              minimize: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
    new MyPlugin({
      outputFile: 'my-assets.md',
    }),
  ],
}
