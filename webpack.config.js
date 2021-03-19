const { resolve, join } = require('path')
const webpack = require('webpack')
const glob = require('fast-glob')
const { zipObject } = require('lodash')
const nodeExternals = require('webpack-node-externals')

// const { pathExists } = require('fs-extra')
const {
  NODE_ENV = 'development'
} = process.env

const getConfig = async () => {
  return {
    entry: {
      ...await expandEntries('packages'),
      ...await expandEntries('packages/react/controls', '**/*.tsx')
    },
    mode: NODE_ENV,
    target: 'node',
    output: {
      path: resolve(__dirname),
      filename: ({ chunk: { name } }) => {
        return name.replace('.tsx', '.js').replace('.ts', '.js') // may change index.ts to index.js
      },
      libraryExport: 'default'
    },
    resolve: {
      // alias: await expandAliases(['react'], NODE_ENV), // TODO: attermpting to fix React https://github.com/tekuasia/blocks/issues/4
      extensions: ['.ts', '.js', '.tsx']
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
      // Use external version of React
      // TODO: attempting to fix React issue
      // @see https://github.com/tekuasia/blocks/issues/4

      // NODE_ENV === 'production' && {
      //   react: 'umd react',
      //   'react-dom': 'umd react-dom',
      //   classnames: 'classnames',
      //   plyr: 'plyr',
      //   'styled-components': 'styled-components',
      //   inputmask: 'inputmask'
      // }
    ),
    plugins: [
    // new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
      // APP_VERSION: JSON.stringify(pkg.version),
      // APP_NAME: JSON.stringify(pkg.name),
        NODE_ENV: JSON.stringify(NODE_ENV)
      })
      // NODE_ENV === 'production' && new webpack.IgnorePlugin(/react/)
    ],
    watch: NODE_ENV === 'development',
    devtool: NODE_ENV === 'development' && 'inline-source-map'
  }
}

const expandEntries = async (packagePath, pattern = '**/index.ts') => {
  const files = await glob(`${packagePath}/${pattern}`)

  return zipObject(files, files.map(f => resolve(join(__dirname, f))))
}

// const expandAliases = async (aliases, env = 'development') => {
//   return zipObject(aliases, await Promise.all(aliases.map(async alias => {
//     const guessingPaths = [
//       `alias/${alias}.${env}.ts`,
//       `alias/${alias}.ts`
//     ]

//     for (let i = 0, l = guessingPaths.length, currentPath; i < l; i++) {
//       currentPath = guessingPaths[i]

//       if (await pathExists(currentPath)) {
//         return resolve(__dirname, currentPath)
//       }
//     }

//     throw Error(`No path found for alias '${alias}'`)
//   })))
// }

module.exports = getConfig
