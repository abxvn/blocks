import EventEmitter from 'events'
import IPlugin from './IPlugin'

export default class PluginLoader extends EventEmitter {
  private readonly loadedPlugins: string[] = []
  private readonly loadingPlugins: string[] = []

  constructor (private readonly plugins: IPlugin[], private readonly dest: any) {
    super()
  }

  async loadPlugin (plugin: IPlugin): Promise<any> {
    if (!this.isLoaded(plugin) && !this.isLoading(plugin) && this.areDependenciesLoaded(plugin)) {
      this.loadingPlugins.push(plugin.id)

      await plugin.install(this.dest)
    }

    return this.load()
  }

  isLoaded (plugin: IPlugin): boolean {
    return this.loadedPlugins.includes(plugin.id)
  }

  isLoading (plugin: IPlugin): boolean {
    return this.loadingPlugins.includes(plugin.id)
  }

  areDependenciesLoaded (plugin: IPlugin): boolean {
    return !plugin.dependencies.some(d => !this.loadedPlugins.includes(d))
  }

  load (): void {
    const pendingPlugins = this.plugins.filter(p => !this.isLoaded(p) && !this.isLoading(p))

    if (pendingPlugins.length === 0) {
      this.emit('done', this.loadedPlugins)
    }

    pendingPlugins.forEach(plugin => {
      this.loadPlugin(plugin)
        .then(() => {
          this.loadedPlugins.push(plugin.id)
          this.emit('plugin:loaded', plugin)
        })
        .catch(error => {
          this.emit('plugin:error', {
            error,
            plugin
          })
          this.emit('error', error)
        })
    })
  }
}
