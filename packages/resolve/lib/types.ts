export type ModuleType = 'file' | 'directory' | 'package'
export interface ITekuModule {
  type: ModuleType
  error?: Error
  entry?: string
  meta: any
  path: string

  /**
   * For function based module, which has (4 cases):
   *   - A function exported as default from main entry (in package meta)
   *   - A function exported as module.exports from main entry (in package meta)
   *   - A function exported as default from its path (without meta)
   *   - A function exported as module.exports from its path (without meta)
   */
  execute: <T extends any>(params: any[], context: any) => Promise<T>

  isYarnGlobal: () => boolean
  isNpmGlobal: () => boolean
  isCore: () => boolean
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
  extraNodeModulesPaths: string[]
  packageFile: string
  extensions: string[]
}
