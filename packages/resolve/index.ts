import { dirname } from 'path'
import { EXTENSIONS, PACKAGE_FILE } from './lib/config'
import TekuModule from './lib/TekuModule'
import TekuResolver from './lib/TekuResolver'
import { ITekuResolverOptions } from './lib/types'
import { caller, getNpmGlobalDirPath, getYarnGlobalDirPath } from './lib/utils'

type IResolveOptions = Partial<ITekuResolverOptions>

const defaultOptions: IResolveOptions = {
  types: [
    'package',
    'file',
    'directory'
  ],
  baseNodeModulesPath: 'node_modules',
  extraNodeModulesPaths: [
    getYarnGlobalDirPath(),
    getNpmGlobalDirPath()
  ],
  packageFile: PACKAGE_FILE,
  extensions: EXTENSIONS
}

export function createResolver (options?: IResolveOptions): TekuResolver {
  options = Object.assign({}, defaultOptions, options)
  if (options.baseDirPath === undefined) {
    options.baseDirPath = dirname(caller())
  }

  return new TekuResolver(options as ITekuResolverOptions)
}

export default async function resolve (path: string, options?: IResolveOptions): Promise<TekuModule> {
  const resolver = createResolver(options)

  return await resolver.resolve(path)
}
