const { resolve, join } = require('path')
const webpack = require('webpack')
const glob = require('fast-glob')
const { zipObject } = require('lodash')
const nodeExternals = require('webpack-node-externals')
const dtsGenerator = require('dts-generator').default

const {
  NODE_ENV = 'development'
} = process.env

const resolvePath = subPath => resolve(__dirname, subPath)
const expandedEntriesPath = process.env.ENTRY_PATH || '{packages,react}/*'
const getConfig = async () => {
  return {
    entry: await expandEntries(expandedEntriesPath),
    mode: NODE_ENV,
    target: 'node',
    output: {
      path: __dirname,
      filename: ({ chunk: { name } }) => {
        return name.replace(/\.tsx?$/, '.js') // may change index.ts to index.js
      },
      libraryTarget: 'commonjs2'
      // libraryExport: 'default'
    },
    resolve: {
      extensions: [
        '.ts',
        '.js',
        '.tsx'
      ]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            'ts-loader'
          ],
          exclude: /node_modules/
        }
      ]
    },
    externals: Object.assign(
      nodeExternals()
    ),
    plugins: [
      // new CleanWebpackPlugin(),
      new DtsGeneratorPlugin(),
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(NODE_ENV)
      })
    ],
    watch: NODE_ENV === 'development',
    devtool: NODE_ENV === 'development' && 'inline-source-map'
  }
}

const expandEntries = async (packagePath, pattern = '**/index.ts') => {
  const files = await glob(`${packagePath}/${pattern}`)

  return zipObject(files, files.map(f => resolve(join(__dirname, f))))
}

module.exports = getConfig

class DtsGeneratorPlugin {
  apply (compiler) {
    const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/
    let builtModulePaths = []

    compiler.hooks.compilation.tap('DtsGeneratorPlugin: Setup compilation', (compilation) => {
      compilation.hooks.succeedModule.tap('DtsGeneratorPlugin: Collect built module', module => {
        if (module.constructor.name !== 'NormalModule') {
          return
        }

        const fileSubPath = module.context.replace(__dirname, '')
        const matches = fileSubPath.match(MODULE_PATH_REGEX)

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
              return currentModuleId === 'index'
                ? packageName
                : packageName + '/.internal/' + currentModuleId.replace(/^src\/?/, '')
            },
            resolveModuleImport: ({ importedModuleId, currentModuleId, isDeclaredExternalModule }) => {
              const isInternalModule = !isDeclaredExternalModule && importedModuleId.indexOf('.') === 0

              return isInternalModule
                ? packageName + '/.internal/' + importedModuleId.replace(/^\.\.?\/?/, '').replace(/^src\/?/, '')
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
