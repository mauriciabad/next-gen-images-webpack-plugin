const HtmlWebpackPlugin = require('html-webpack-plugin')
const { JSDOM } = require('jsdom')
const { ImagePool } = require('@squoosh/lib')

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
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapPromise(
        'beforeEmit',
        async (data) => {
          data.html = await this.replaceImgToPicture(
            compiler,
            compilation,
            data.html
          )

          return data
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
   * @param {ImagePool} imagePool
   * @param {HTMLImageElement} img
   * @returns {Promise<string>}
   */
  async createNewImageAsset(compiler, compilation, imagePool, img) {
    const { RawSource } = compiler.webpack.sources

    const imgPathname = img.getAttribute('src').replace(/^([^\/]*\/)+/g, '')
    const newImgPathname =
      'new-img-' + imgPathname.replace(/\.[^\.]+$/i, '.webp')

    const originalImgAsset = compilation.getAsset(imgPathname)

    // TODO: once the webp is working, do the jxl format
    const newContent = await this.encodeImageToWebP(
      imagePool,
      originalImgAsset.source.buffer()
    )

    compilation.emitAsset(newImgPathname, new RawSource(newContent))

    return newImgPathname
  }

  /**
   * @param {ImagePool} imagePool
   * @param {Buffer} originalImage
   * @returns {Promise<Buffer>}
   */
  async encodeImageToWebP(imagePool, originalImage) {
    const image = imagePool.ingestImage(originalImage)

    await image.encode({
      webp: 'auto',
    })
    const rawEncodedImage = Buffer.from((await image.encodedWith.webp).binary)

    return rawEncodedImage
  }

  /**
   * @param {import('webpack').Compiler} compiler
   * @param {import('webpack').Compilation} compilation
   * @param {string} html
   * @returns {Promise<string>}
   */
  async replaceImgToPicture(compiler, compilation, html) {
    const dom = new JSDOM(html)
    const document = dom.window.document

    /** @type {HTMLImageElement[]} */
    const images = document.querySelectorAll(':not(picture) > img')
    const imagePool = new ImagePool()

    for (const img of images) {
      const newImgPathname = await this.createNewImageAsset(
        compiler,
        compilation,
        imagePool,
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

    await imagePool.close()

    return document.documentElement.outerHTML
  }
}

module.exports = { MyPlugin }
