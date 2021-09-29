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
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          Object.entries(assets)
            .filter(([fileName]) => /.html$/i.test(fileName))
            .forEach(([fileName, source]) => {
              // Only html files

              console.log(source)

              // TODO: modify the source so it has the picture elem
            })

          compilation.emitAsset(
            this.options.outputFile,
            new RawSource('this is a test')
          )
        }
      )
    })
  }
}

module.exports = { MyPlugin }
