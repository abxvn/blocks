const { basename, dirname, resolve, join, normalize } = require('path')
const dtsGenerator = require('dts-generator').default
const { resolvePath, rootPath } = require('../paths')
const glob = require('fast-glob')

class DtsGeneratorPlugin {
  apply (compiler) {
    const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/
    let builtModulePaths = []

    compiler.hooks.compilation.tap('DtsGeneratorPlugin: Setup compilation', compilation => {
      compilation.hooks.succeedModule.tap('DtsGeneratorPlugin: Collect built module', module => {
        if (module.constructor.name !== 'NormalModule') {
          return
        }

        const fileSubPath = module.context.replace(rootPath, '').replace(/\\/g, '/')
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
      Promise.all(builtModulePaths.map(async p => {
        try {
          const packageInfo = require(resolvePath(`${p}/package.json`))
          const typesFile = packageInfo.types
          const packageName = packageInfo.name

          if (!typesFile) {
            return
          }

          const packagePath = `${rootPath.replace(/\\/g, '/')}/${p}`
          // For avoiding generating types of other packages
          const sourceFiles = await glob([
            `${packagePath}/*.ts`,
            `${packagePath}/**/*.ts`
          ], {
            dot: false,
            onlyFiles: true,
            ignore: [
              `${packagePath}/node_modules/**`,
              `${packagePath}/*.d.ts`,
              `${packagePath}/**/*.d.ts`
            ]
          })

          await dtsGenerator({
            eol: '\n',
            baseDir: rootPath,
            files: sourceFiles,
            out: resolvePath(`${p}/${typesFile}`),
            resolveModuleId: ({ currentModuleId, isDeclaredExternalModule }) => {
              const currentModule = currentModuleId.replace(/\/index(\.[^\/])?$/, '').replace(new RegExp(`^${p}/?`), '')
              const isMainModule = currentModule === ''

              if (isMainModule) {
                return packageName
              } else {
                return packageName + '/.internals/' + currentModule
              }
            },
            resolveModuleImport: ({ importedModuleId, currentModuleId, isDeclaredExternalModule }) => {
              const isInternalModuleImported = !isDeclaredExternalModule && importedModuleId.indexOf('.') === 0
              const currentModule = currentModuleId.replace(/\/index(\.[^\/])?$/, '').replace(new RegExp(`^${p}/?`), '')
              const importedModule = importedModuleId.replace(/\/index(\.[^\/])?$/, '').replace(new RegExp(`^${p}/?`), '')
              const importingToMainModule = currentModule === ''

              if (!isInternalModuleImported) {
                return currentModuleId
              }

              const subModulePath = dirname(currentModule)
              const resolvedImportedModule = normalize(packageName + '/.internals/' + subModulePath + '/' + importedModule).replace(/\\/g, '/')

              return resolvedImportedModule
            }
          })

          console.info(`[TS] Definition generated for ${packageName}`)
        } catch (err) {
          console.error(err)
        }
      })).then(() => callback())
    })
  }
}

module.exports = DtsGeneratorPlugin
