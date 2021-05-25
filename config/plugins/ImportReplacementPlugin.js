const { bold } = require('chalk')
const { reduce } = require('lodash')
const { Compilation, sources: { RawSource } } = require('webpack')

class ImportReplacementPlugin {
  constructor (replacementMap = {}, assetRegex = null) {
    this.replacementMap = replacementMap
    this.assetRegex = assetRegex
  }

  apply (compiler) {
    compiler.hooks.compilation.tap('ImportReplacementPlugin: Setup compilation', compilation => {
      compilation.hooks.processAssets.tap({
        name: 'ImportReplacementPlugin: Replace assets before saving',
        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
      }, assets => {
        const replacementList = reduce(
          this.replacementMap,
          (list, to, from) => {
            list.push(`${from}:${to}`)

            return list
          },
          []
        )
        const shortenListStr = replacementList.join(' ').slice(0, 25) + '...'

        for (const name in assets) {
          if (this.assetRegex && !this.assetRegex.test(name)) {
            continue
          }

          const asset = assets[name]
          const assetText = asset.source()
          const newText = reduce(
            this.replacementMap,
            (text, to, from) => text.replace(new RegExp(`require\\(['"]${from}['"]\\)`, 'g'), `require("${to}")`),
            assetText
          )

          compilation.updateAsset(
            name,
            new RawSource(newText)
          )

          console.info(`asset ${bold.green(name)} replacements ${bold.cyan(shortenListStr)}`)
        }
      })
    })
  }
}

module.exports = ImportReplacementPlugin
