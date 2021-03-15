const path = require('path')
const webpack = require('webpack')
const glob = require('fast-glob')
const { zipObject } = require('lodash')
const nodeExternals = require('webpack-node-externals')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// const pkg = require('./package.json')
const { resolve } = require('path')
const {
  NODE_ENV = 'production'
} = process.env

const expandEntries = async packagePath => {
  const files = await glob(`${packagePath}/**/index.ts`)

  return zipObject(files, files.map(f => resolve(path.join(__dirname, f))))
}

const getConfig = async () => ({
  entry: await expandEntries('packages'),
  mode: NODE_ENV,
  target: 'node',
  output: {
    path: path.resolve(__dirname),
    filename: ({ chunk: { name } }) => {
      return name.replace('.ts', '.js') // may change index.ts to index.js
    },
    // libraryExport: 'default',
    libraryTarget: 'commonjs2'
  },
  resolve: {
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
  externals: [
    nodeExternals()
  ],
  plugins: [
    // new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      // APP_VERSION: JSON.stringify(pkg.version),
      // APP_NAME: JSON.stringify(pkg.name),
      NODE_ENV: JSON.stringify(NODE_ENV)
    })
  ],
  watch: NODE_ENV === 'development'
  // devtool: NODE_ENV === 'development' && 'source-map'
})

module.exports = getConfig
