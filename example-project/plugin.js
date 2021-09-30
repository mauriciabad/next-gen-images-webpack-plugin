const HtmlWebpackPlugin = require('html-webpack-plugin')
const { JSDOM } = require('jsdom')

class MyPlugin {
  static defaultOptions = {
    outputFile: 'assets.md',
  }

  constructor(options = {}) {
    this.options = { ...MyPlugin.defaultOptions, ...options }
  }

  /** @type {{outputFile: string}}  */
  options = MyPlugin.defaultOptions

  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    const pluginName = MyPlugin.name

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'beforeEmit',
        (data, callback) => {
          data.html = this.replaceImgToPicture(data.html)

          // compilation.emitAsset(
          //   this.options.outputFile,
          //   new RawSource('this is a test')
          // )

          callback(null, data)
        }
      )
    })

    const { RawSource } = compiler.webpack.sources
  }

  customSetAttribute(source, img, attr, newAttr) {
    let value = img.getAttribute(attr)
    if (value) {
      source.setAttribute(
        newAttr || attr,
        value.replace(/\.(jpe?g|png|gif)/gi, '.webp')
      )
    }
  }

  /**
   * @param {string} html
   * @returns {string}
   */
  replaceImgToPicture(html) {
    const dom = new JSDOM(html)
    const document = dom.window.document

    const images = document.querySelectorAll(':not(picture) > img')

    for (const img of images) {
      const picture = document.createElement('picture')
      const source = document.createElement('source')
      source.setAttribute('type', 'image/webp')
      this.customSetAttribute(source, img, 'sizes')
      this.customSetAttribute(source, img, 'srcset')
      this.customSetAttribute(source, img, 'media')

      if (!source.hasAttribute('srcset')) {
        this.customSetAttribute(source, img, 'src', 'srcset')
      }

      img.parentElement.insertBefore(picture, img)
      picture.appendChild(source)
      picture.appendChild(img)
    }

    return document.documentElement.outerHTML
  }
}

module.exports = { MyPlugin }
