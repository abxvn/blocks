import IPluggable from './IPluggable'
import IPlugin from './IPlugin'
import PluginLoader from './PluginLoader'

export const load = async (plugins: IPlugin[], dest: IPluggable, onItem?: (plugin: any, error?: Error) => any): Promise<string[]> => {
  return await new Promise((resolve, reject) => {
    const loader = new PluginLoader(plugins, dest)

    loader.on('done', loadedList => resolve(loadedList))
    loader.on('error', err => reject(err))

    if (onItem instanceof Function) {
      loader.on('plugin:loaded', onItem)
      loader.on('plugin:error', ({ plugin, error }) => onItem(plugin, error))
    }

    loader.load()
  })
}

export { default as IPluggable } from './IPluggable'
export { default as IPlugin } from './IPlugin'
export { default as PluginLoader } from './PluginLoader'
