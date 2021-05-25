const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const expandEntries = require('./config/expandEntries')
const DtsGeneratorPlugin = require('./config/plugins/DtsGeneratorPlugin')
const ImportReplacementPlugin = require('./config/plugins/ImportReplacementPlugin')

const getConfig = async (entries, envName = 'development') => {
  return {
    entry: entries,
    mode: envName,
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
    externalsPresets: { node: true },
    externals: [
      nodeExternals()
    ],
    plugins: [
      // new CleanWebpackPlugin(),
      new ImportReplacementPlugin({
        react: 'preact/compat',
        'react-dom': 'preact/compat'
      }, /preact\//),
      new DtsGeneratorPlugin(),
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(envName)
      })
    ],
    watch: envName === 'development',
    devtool: envName === 'development' && 'inline-source-map'
  }
}

exports = module.exports = async () => {
  const expandedEntriesPath = process.env.ENTRY_PATH || '{packages,react}/*'
  const entries = await expandEntries(expandedEntriesPath)

  return getConfig(entries, process.env.NODE_ENV)
}

exports.getConfig = getConfig
