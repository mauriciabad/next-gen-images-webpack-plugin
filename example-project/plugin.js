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
          data.html = await replaceImgToPicture(
            compiler,
            compilation,
            data.html
          )

          return data
        }
      )
    })
  }
}

/**
 * @param {import('webpack').Compiler} compiler
 * @param {import('webpack').Compilation} compilation
 * @param {ImagePool} imagePool
 * @param {HTMLImageElement} img
 * @returns {Promise<{webp: string, jxl:string}>}
 */
async function createNewImageAssets(
  compiler,
  compilation,
  imagePool,
  imageElement
) {
  const { RawSource } = compiler.webpack.sources

  const imageName = imageElement
    .getAttribute('src')
    .replace(/^([^\/]*\/)+/g, '')
  const imageNameWithoutExtension = imageName.replace(/\.[^\.]+$/i, '')
  const newImagesNames = {
    webp: imageNameWithoutExtension + '.webp',
    jxl: imageNameWithoutExtension + '.jxl',
  }

  const image = compilation.getAsset(imageName).source.buffer()
  const newImages = await encodeImageToAllFormats(imagePool, image)

  for (const format in newImages) {
    compilation.emitAsset(
      newImagesNames[format],
      new RawSource(newImages[format])
    )
  }

  return newImagesNames
}

/**
 * @param {ImagePool} imagePool
 * @param {Buffer} originalImage
 * @returns {Promise<{webp: Buffer, jxl:Buffer}>}
 */
async function encodeImageToAllFormats(imagePool, originalImage) {
  const image = imagePool.ingestImage(originalImage)

  await image.encode({
    webp: 'auto',
    jxl: 'auto',
  })

  return {
    webp: Buffer.from((await image.encodedWith.webp).binary),
    jxl: Buffer.from((await image.encodedWith.jxl).binary),
  }
}

/**
 * @param {import('webpack').Compiler} compiler
 * @param {import('webpack').Compilation} compilation
 * @param {string} html
 * @returns {Promise<string>}
 */
async function replaceImgToPicture(compiler, compilation, html) {
  const dom = new JSDOM(html)
  const document = dom.window.document

  /** @type {HTMLImageElement[]} */
  const imageElements = document.querySelectorAll(':not(picture) > img')
  const imagePool = new ImagePool()

  for (const imageElement of imageElements) {
    const newImgNames = await createNewImageAssets(
      compiler,
      compilation,
      imagePool,
      imageElement
    )

    const picture = document.createElement('picture')
    imageElement.parentElement.insertBefore(picture, imageElement)

    for (const format of ['jxl', 'webp']) {
      const source = document.createElement('source')
      source.setAttribute('srcset', newImgNames[format])
      source.setAttribute('type', `image/${format}`)

      // customSetAttribute(source, img, 'sizes')
      // customSetAttribute(source, img, 'srcset')
      // customSetAttribute(source, img, 'media')

      // if (!source.hasAttribute('srcset')) {
      //   customSetAttribute(source, img, 'src', 'srcset')
      // }

      picture.appendChild(source)
    }

    picture.appendChild(imageElement)
  }

  await imagePool.close()

  return document.documentElement.outerHTML
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

module.exports = { MyPlugin }
