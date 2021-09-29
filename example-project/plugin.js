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

    const { RawSource } = compiler.webpack.sources

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,

          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          const content =
            '# In this build:\n\n' +
            Object.keys(assets)
              .map((filename) => `- ${filename}`)
              .join('\n')

          compilation.emitAsset(this.options.outputFile, new RawSource(content))
        }
      )
    })
  }
}

module.exports = { MyPlugin }
