const { zipObject } = require('lodash')
const glob = require('fast-glob')
const { resolvePath } = require('./paths')

const expandEntries = async (packagePath, pattern = '**/index.ts') => {
  const files = await glob(`${packagePath}/${pattern}`)
  // const gatsbyEntries = files.filter(f => f.includes('/gatsby-'))

  // if (gatsbyEntries.length) { // support gatsby typescript plugin hooks
  //   const gatsbyRelativePaths = gatsbyEntries.map(entry => relativePath(dirname(entry)))
  //     .map(p => p.replace('packages/', ''))
  //     .join(',')
  //   const gatsbyPluginTsSearchPattern = `packages/${gatsbyEntries.length > 2 ? `${gatsbyRelativePaths}` : gatsbyRelativePaths}/*.ts`
  //   const gatsbyPluginTsFiles = await glob(gatsbyPluginTsSearchPattern)

  //   files = sortBy(uniq(files.concat(gatsbyPluginTsFiles)))
  // }

  return zipObject(files, files.map(f => resolvePath(f)))
}

module.exports = expandEntries
