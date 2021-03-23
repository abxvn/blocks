import kindOf from 'kind-of'
import type { ITekuModule, ModuleType } from './types'
import { getNpmGlobalDirPath, getYarnGlobalDirPath, isCoreModule } from './utils'

export default class TekuModule implements ITekuModule {
  type: ModuleType = 'file'
  error?: Error
  entry?: string
  meta: any = {}

  constructor (readonly path: string) {}

  /**
   * For function based module, which has (4 cases):
   *   - A function exported as default from main entry (in package meta)
   *   - A function exported as module.exports from main entry (in package meta)
   *   - A function exported as default from its path (without meta)
   *   - A function exported as module.exports from its path (without meta)
   */
  async execute<T extends any> (params: any[], context: any): Promise<T> {
    const exports = this.entry !== undefined && require(this.entry) // eslint-disable-line @typescript-eslint/no-var-requires
    const mainExport = exports.default ?? exports

    if (kindOf(mainExport) === 'function') {
      return mainExport.apply(context ?? this, params)
    } else {
      throw Error('Module exported main is not a function')
    }
  }

  isYarnGlobal (): boolean {
    return this.path.indexOf(getYarnGlobalDirPath()) === 0
  }

  isNpmGlobal (): boolean {
    return this.path.indexOf(getNpmGlobalDirPath()) === 0
  }

  isCore (): boolean {
    return isCoreModule(this.path)
  }
}
