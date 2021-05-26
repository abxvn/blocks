const { zipObject } = require('lodash')
const glob = require('fast-glob')
const { resolvePath } = require('./paths')

const expandEntries = async (packagePath, pattern = '**/index.ts') => {
  const files = await glob(`${packagePath}/${pattern}`)

  return zipObject(files, files.map(f => resolvePath(f)))
}

module.exports = expandEntries
