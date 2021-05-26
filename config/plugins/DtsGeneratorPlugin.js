const { basename } = require('path')
const dtsGenerator = require('dts-generator').default
const { resolvePath, rootPath } = require('../paths')

class DtsGeneratorPlugin {
  apply (compiler) {
    const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/
    let builtModulePaths = []

    compiler.hooks.compilation.tap('DtsGeneratorPlugin: Setup compilation', compilation => {
      compilation.hooks.succeedModule.tap('DtsGeneratorPlugin: Collect built module', module => {
        if (module.constructor.name !== 'NormalModule') {
          return
        }

        const fileSubPath = module.context.replace(rootPath, '')
        const matches = !fileSubPath.includes('node_modules') && fileSubPath.match(MODULE_PATH_REGEX)

        if (matches && builtModulePaths.indexOf(matches[0]) === -1) {
          builtModulePaths.push(matches[0])
        }
      })
    })

    compiler.hooks.beforeCompile.tapAsync(
      'DtsGeneratorPlugin: Start built modules collection',
      (compilation, callback) => {
        builtModulePaths = []

        callback()
      })

    compiler.hooks.afterCompile.tapAsync('DtsGeneratorPlugin: generate definitions', (compilation, callback) => {
      builtModulePaths.forEach(async p => {
        try {
          const packageInfo = require(resolvePath(`${p}/package.json`))
          const typesFile = packageInfo.types
          const packageName = packageInfo.name

          if (!typesFile) {
            return
          }

          await dtsGenerator({
            eol: '\n',
            project: resolvePath(p),
            out: resolvePath(`${p}/${typesFile}`),
            resolveModuleId: ({ importedModuleId, currentModuleId, isDeclaredExternalModule }) => {
              const isIndexModule = basename(currentModuleId) === 'index'

              return isIndexModule
                ? [packageName, currentModuleId.replace(/\/?index$/, '')].filter(Boolean).join('/')
                : packageName + '/.internal/' + currentModuleId.replace(/^src\/?/, '')
            },
            resolveModuleImport: ({ importedModuleId, currentModuleId, isDeclaredExternalModule }) => {
              const isInternalModule = !isDeclaredExternalModule && importedModuleId.indexOf('.') === 0

              return isInternalModule
                ? packageName + importedModuleId.replace(/^\.+\/src\//, '/.internal/')
                : importedModuleId
            }
          })
        } catch (err) {
          console.error(err)
        }
      })

      callback()
    })
  }
}

module.exports = DtsGeneratorPlugin
