# next-gen-images-webpack-plugin

> ⚠️ **DISCLAIMER:** This plugin is still in development, for any bugs/requests open issues and PRs.

This plugin transforms `<img>` tags with images in `jpg`, `jpeg` and `png` to a `<picture>` tag with the original one and it's version in `jxl` and `webp` formats.

```html
<!-- INPUT -->
<img src="./cat.jpg" alt="Cat" />

<!-- OUTPUT -->
<picture>
  <source srcset="cat.jxl" type="image/jxl">
  <source srcset="cat.webp" type="image/webp">
  <img src="cat.jpg" alt="Cat">
</picture>
```

## Installation

npm:
```console
npm install next-gen-images-webpack-plugin --save-dev
```

Yarn:
```console
yarn add -D next-gen-images-webpack-plugin
```

You also need `webpack 5` and `html-webpack-plugin`

## Usage

### Setting up `webpack.config.js`

```js
const NextGenImagesWebpackPlugin = require('next-gen-images-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // other options...

  plugins: [
    // other plugins...
    new HtmlWebpackPlugin(
      // Your HtmlWebpackPlugin custom config
    ),
    new NextGenImagesWebpackPlugin(),
    // other plugins...
  ],
}

```

### Plugin options

For now, it doesn't have any options.

## Authors

Maurici Abad Gutierrez - @mauriciabad - https://mauriciabad.com
