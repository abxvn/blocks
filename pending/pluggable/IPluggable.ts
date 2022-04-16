import IPlugin from './IPlugin'

export default interface IPluggable {
  plugins: IPlugin[]
  use: (plugin: IPlugin) => any
}
