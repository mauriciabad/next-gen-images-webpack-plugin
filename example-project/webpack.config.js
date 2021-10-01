const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// The plugin is imported from the folder above.
// Don't import it like this in your project
const NextGenImagesWebpackPlugin = require('../plugin')
// In your project, import it like this:
// const NextGenImagesWebpackPlugin = require('next-gen-images-webpack-plugin')

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
    new NextGenImagesWebpackPlugin({
      outputFile: 'my-assets.md',
    }),
  ],
}
