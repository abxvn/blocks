import { parse, resolve as resolvePath } from 'path'
import fs from 'fs-extra'
import globalDirs from 'global-dirs'

// packages
export { default as isCoreModule } from 'is-core-module'

// fs
const isFsNonExistsError = (err: any): boolean => err.code === 'ENOENT' || err.code === 'ENOTDIR'
export const isFile = async (path: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(path)

    return stats.isFile() || stats.isFIFO()
  } catch (err) {
    if (isFsNonExistsError(err)) {
      return false
    } else {
      throw err
    }
  }
}
export const isDirectory = async (path: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(path)

    return stats.isDirectory()
  } catch (err) {
    if (isFsNonExistsError(err)) {
      return false
    } else {
      throw err
    }
  }
}

// node modules
export const getYarnGlobalDirPath = (): string => globalDirs.yarn.packages
export const getNpmGlobalDirPath = (): string => globalDirs.yarn.packages
export const getPathNodeModulesDirs = (path: string, nodeModulesDir: string): string[] => {
  let prefix = '/'
  if ((/^([A-Za-z]:)/).test(path)) {
    prefix = ''
  } else if (/^\\\\/.test(path)) {
    prefix = '\\\\'
  }

  const paths = [path]
  let parsed = parse(path)
  // Go up
  while (parsed.dir !== paths[paths.length - 1]) {
    paths.push(parsed.dir)
    parsed = parse(parsed.dir)
  }

  return paths.map(p => resolvePath(prefix, p, nodeModulesDir))
}

// others
export const caller = (): string => {
  // see https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  const origPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = function (_, stack) { return stack }

  const stack = (new Error()).stack as any
  Error.prepareStackTrace = origPrepareStackTrace

  return stack[2].getFileName()
}

// export const getRealPath = async (path: string): Promise<string> => {
//   if (SUPPORT_SYMLINKS) { // fast-forward symlinks
//     return path
//   }

//   try {
//     const realPath = await fs.realpath(path)

//     return realPath
//   } catch (err) {
//     if (err.code !== 'ENOENT') {
//       err.code = ErrorCodes.REALPATH_NOT_EXISTS
//       throw err
//     } else {
//       return path
//     }
//   }
// }
