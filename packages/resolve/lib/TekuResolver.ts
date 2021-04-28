import { resolve as resolvePath, join as joinPath } from 'path'
import { readJson } from 'fs-extra'
import glob from 'fast-glob'

import { getPathNodeModulesDirs, isCoreModule, isDirectory, isFile } from './utils'
import type { ITekuResolverOptions, ITekuModule, ITekuResolver } from './types'
import TekuModule from './TekuModule'
import { FS_BASED_MODULE_REGEX } from './config'

export default class TekuResolver implements ITekuResolver {
  private readonly nodeModulesDirs: string[] = []

  constructor (readonly options: ITekuResolverOptions) {
    const { baseDirPath, baseNodeModulesPath } = this.options

    this.nodeModulesDirs = [
      ...getPathNodeModulesDirs(baseDirPath, baseNodeModulesPath),
      ...this.options.extraNodeModulesPaths
    ]
  }

  async resolveWildcard (pattern: string): Promise<any> {
    if (!pattern.includes('*')) {
      throw Error('At least one glob star (*) should be in glob path')
    }

    if (FS_BASED_MODULE_REGEX.test(pattern)) {
      throw Error('Wildcard only supports loading from node_modules')
    }

    const nodeModulesPatterns = this.nodeModulesDirs.map(d => joinPath(d, pattern))
    const nodeModulesPaths: string[] = await glob(nodeModulesPatterns, { dot: false, onlyDirectories: true })
    const modules = await Promise.all(nodeModulesPaths.map(async p => await this.resolveFromDirectory(p)))
    const moduleNames = modules.map(m => m.meta.name)

    const result: {[key: string]: ITekuModule} = {}
    moduleNames.forEach((name, idx) => {
      result[name] = modules[idx]
    })

    return result
  }

  async resolve (path: string): Promise<ITekuModule> {
    const { baseDirPath, types } = this.options

    try {
      if (isCoreModule(path)) {
        return new TekuModule(path)
      } else if (FS_BASED_MODULE_REGEX.test(path)) {
        // possible file or directory path
        let fullPath = resolvePath(baseDirPath, path)
        if (fullPath === '.' || fullPath === '..' || path.slice(-1) === '/') {
          fullPath += '/'
        }

        const shouldResolveAsDirectory = fullPath !== baseDirPath &&
          (/\/$/.test(fullPath) || await isDirectory(fullPath))

        if (shouldResolveAsDirectory) {
          if (types.includes('directory')) {
            return await this.resolveFromDirectory(fullPath)
          } else {
            throw Error('Resolving module from directory is not supported')
          }
        } else if (types.includes('file')) {
          return await this.resolveFromFile(fullPath)
        } else {
          throw Error('Resolving module from file is not supported')
        }
      } else if (types.includes('package')) {
        // load from node_modules
        return await this.resolveFromNodeModules(path)
      } else {
        throw Error('Resolving module from node_modules is not supported')
      }
    } catch (err) {
      const module = new TekuModule(path)

      module.error = err

      return module
    }
  }

  private async resolveFromDirectory (path: string, moduleOnly: boolean = false): Promise<ITekuModule> {
    const { packageFile, extensions } = this.options

    if (!await isDirectory(path)) {
      throw Error(`Directory '${path}' doesn't exists`)
    }

    const module = new TekuModule(path)
    const packageFilePath = joinPath(path, packageFile)

    if (await isFile(packageFile)) {
      module.meta = await readJson(packageFilePath)
    } else if (moduleOnly) {
      throw Error(`Module at ${path} doesn't have a package.json file`)
    }

    const mainFilePosibilities = module.meta.main !== undefined
      ? [joinPath(path, module.meta.main)]
      : extensions.map(ext => joinPath(path, `index.${ext}`))
    let mainFile
    for (const mainFilePath of mainFilePosibilities) {
      if (await isFile(mainFilePath)) {
        mainFile = mainFilePath
        break
      }
    }

    if (mainFile === undefined) {
      throw Error(`Main file for '${path}' doesn't exists`)
    }

    module.entry = mainFile === undefined ? '' : resolvePath(path, mainFile)

    return module
  }

  private async resolveFromFile (path: string): Promise<ITekuModule> {
    const { extensions } = this.options
    const filePosibilities = [
      path,
      ...extensions.map(ext => `${path}.${ext}`)
    ]

    let resolvedPath
    for (const filePath of filePosibilities) {
      if (await isFile(filePath)) {
        resolvedPath = filePath
        break
      }
    }

    if (resolvedPath === undefined) {
      throw Error(`Cannot resolve module file '${path}'`)
    }

    const module = new TekuModule(path)

    module.entry = resolvedPath

    return module
  }

  private async resolveFromNodeModules (path: string): Promise<ITekuModule> {
    const nodeModulesPaths = this.nodeModulesDirs.map(d => joinPath(d, path))
    let resolvedModule: TekuModule | undefined

    for (const nodeModulesPath of nodeModulesPaths) {
      try {
        resolvedModule = await this.resolveFromDirectory(nodeModulesPath, true)
      } catch (err) {
        continue
      }
    }

    if (resolvedModule === undefined) {
      throw Error(`Cannot resolve node module '${path}'`)
    } else {
      return resolvedModule
    }
  }
}
