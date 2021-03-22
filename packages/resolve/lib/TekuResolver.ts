import { resolve as resolvePath, join as joinPath } from 'path'

import { getPathNodeModulesDirs, isCoreModule, isDirectory, isFile } from './utils'
import type { ITekuResolverOptions, ITekuModule, ITekuResolver } from './types'
import { readJson } from 'fs-extra'
import TekuModule from './TekuModule'

export default class TekuResolver implements ITekuResolver {
  private readonly nodeModulesDirs: string[] = []

  constructor (readonly options: ITekuResolverOptions) {
    const { baseDirPath, baseNodeModulesPath } = this.options

    this.nodeModulesDirs = [
      ...getPathNodeModulesDirs(baseDirPath, baseNodeModulesPath),
      ...this.options.extraNodeModulesPaths
    ]
  }

  async resolve (path: string): Promise<ITekuModule> {
    const { baseDirPath, types } = this.options

    try {
      if (isCoreModule(path)) {
        return new TekuModule(path)
      } else if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(path)) {
        // possible file or directory path
        let fullPath = resolvePath(baseDirPath, path)
        if (fullPath === '.' || fullPath === '..' || fullPath.slice(-1) === '/') {
          fullPath += '/'
        }

        if (/\/$/.test(path) && fullPath !== baseDirPath) {
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

  private async resolveFromDirectory (path: string): Promise<TekuModule> {
    const { packageFile, extensions } = this.options

    if (!await isDirectory(path)) {
      throw Error(`Directory '${path}' doesn't exists`)
    }

    const module = new TekuModule(path)
    const packageFilePath = joinPath(path, packageFile)

    if (await isFile(packageFile)) {
      module.meta = await readJson(packageFilePath)
    }

    const mainFilePosibilities = module.meta.main !== undefined
      ? [module.meta?.main]
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

    module.entry = resolvePath(path, mainFile)

    return module
  }

  private async resolveFromFile (path: string): Promise<TekuModule> {
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

  private async resolveFromNodeModules (path: string): Promise<TekuModule> {
    const nodeModulesPaths = this.nodeModulesDirs.map(d => joinPath(d, path))
    let resolvedModule: TekuModule | undefined

    for (const nodeModulesPath of nodeModulesPaths) {
      try {
        resolvedModule = await this.resolveFromDirectory(nodeModulesPath)

        // node_modules package should have package.json file
        if (resolvedModule.meta.name !== undefined) {
          break
        }
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
