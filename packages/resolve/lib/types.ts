export type ModuleType = 'file' | 'directory' | 'package'
export interface ITekuModule {
  // Determine where module is loaded from
  // Where it's from a file, a directory or a package
  type: ModuleType
  // posible error during module resolving
  error?: Error
  // entry / main path to require module
  entry?: string
  // module metadata, mostly loaded from package.json files
  meta: any
  // module path (provided path)
  path: string

  // Check if module is a Yarn global module
  isYarnGlobal: () => boolean
  // Check if module is a Npm global module
  isNpmGlobal: () => boolean
  // Check if module is a NodeJS core module
  isCore: () => boolean

  /**
   * For function based module, which has (4 cases):
   *   - A function exported as default from main entry (in package meta)
   *   - A function exported as module.exports from main entry (in package meta)
   *   - A function exported as default from its path (without meta)
   *   - A function exported as module.exports from its path (without meta)
   */
  execute: <T extends any>(params: any[], context: any) => Promise<T>
}

export interface ITekuResolver {
  options: ITekuResolverOptions
  resolve: (path: string) => Promise<ITekuModule>
  // resolveWildcard: (wildcardPath: string) => Promise<ITekuModule>
}

export interface ITekuResolverOptions {
  types: ModuleType[]
  baseDirPath: string
  baseNodeModulesPath: string
  packageFile: string
  extensions: string[]
  extraNodeModulesPaths: string[]
}
