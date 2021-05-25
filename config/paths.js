const { resolve } = require('path')

const rootPath = resolve(__dirname, '..')
const srcPath = resolve(rootPath, 'src')

exports.rootPath = rootPath
exports.resolvePath = subPath => resolve(rootPath, subPath)
exports.resolveSrc = subPath => resolve(srcPath, subPath)
