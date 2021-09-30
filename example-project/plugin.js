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
          data.html = this.replaceImgToPicture(compiler, compilation, data.html)

          callback(null, data)
        }
      )
    })
  }

  // customSetAttribute(source, img, attr, newAttr) {
  //   let value = img.getAttribute(attr)
  //   if (value) {
  //     source.setAttribute(
  //       newAttr || attr,
  //       value.replace(/\.(jpe?g|png|gif)/gi, '.webp')
  //     )
  //   }
  // }

  /**
   * @param {import('webpack').Compiler} compiler
   * @param {import('webpack').Compilation} compilation
   * @param {HTMLImageElement} img
   * @returns {string}
   */
  createNewImageAsset(compiler, compilation, img) {
    const { RawSource } = compiler.webpack.sources

    const imgPathname = img.getAttribute('src').replace(/^([^\/]*\/)+/g, '')
    // const newImgPathname = imgPathname.replace(/\.(jpe?g|png|gif)/gi, '.webp')
    const newImgPathname = 'new-img-' + imgPathname

    const originalImgAsset = compilation.getAsset(imgPathname)
    console.log(originalImgAsset)

    // TODO: here use the squash lib to generate the webp
    // TODO: once the webp is working, do the jxl format
    const newContent = originalImgAsset.source.source()

    compilation.emitAsset(newImgPathname, new RawSource(newContent))

    return newImgPathname
  }

  /**
   * @param {import('webpack').Compiler} compiler
   * @param {import('webpack').Compilation} compilation
   * @param {string} html
   * @returns {string}
   */
  replaceImgToPicture(compiler, compilation, html) {
    const dom = new JSDOM(html)
    const document = dom.window.document

    /** @type {HTMLImageElement[]} */
    const images = document.querySelectorAll(':not(picture) > img')

    for (const img of images) {
      const newImgPathname = this.createNewImageAsset(
        compiler,
        compilation,
        img
      )

      const picture = document.createElement('picture')

      const source = document.createElement('source')
      source.setAttribute('type', 'image/webp')
      source.setAttribute('src', newImgPathname)

      // this.customSetAttribute(source, img, 'sizes')
      // this.customSetAttribute(source, img, 'srcset')
      // this.customSetAttribute(source, img, 'media')

      // if (!source.hasAttribute('srcset')) {
      //   this.customSetAttribute(source, img, 'src', 'srcset')
      // }

      img.parentElement.insertBefore(picture, img)
      picture.appendChild(source)
      picture.appendChild(img)
    }

    return document.documentElement.outerHTML
  }
}

module.exports = { MyPlugin }
