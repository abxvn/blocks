export interface IRouteDefinition {
  uri: string
  layout?: string
  context: any
  view: string
}

export interface IRouteDefinitionList {
  [name: string]: string | IRouteDefinition
}
