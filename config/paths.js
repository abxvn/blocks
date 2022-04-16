const { resolve, normalize } = require('path')

const normalizePath = path => normalize(path).replace(/\\/g, '/')
const rootPath = normalizePath(resolve(__dirname, '..'))
const srcPath = normalizePath(resolve(rootPath, 'src'))

exports.rootPath = rootPath
exports.resolvePath = subPath => resolve(rootPath, subPath)
exports.resolveSrc = subPath => resolve(srcPath, subPath)
exports.relativePath = fullPath => normalizePath(fullPath).replace(rootPath, '')
exports.normalizePath = normalizePath
