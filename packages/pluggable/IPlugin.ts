export default interface IPlugin {
  id: string
  dependencies: string[]
  install: (dest: any) => Promise<any>
}
