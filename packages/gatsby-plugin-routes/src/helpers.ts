import { IRouteDefinition, IRouteDefinitionList } from './IRoutes'
import { get, map, filter } from 'lodash'

const ensureFirstSlash = (str: string): string => '/' + str.replace(/^\/+/, '')

export const parseRoute = (route: string | IRouteDefinition, importUri: string, defaultLayout = 'index'): IRouteDefinition => {
  if ([null, undefined, ''].includes(importUri)) {
    throw TypeError('Invalid route config, please provide uri')
  }

  let view
  let layout
  let exportUri = importUri
  let context

  switch (typeof route) {
    // user: 'components/User'
    case 'string':
      return {
        uri: ensureFirstSlash(exportUri),
        layout: defaultLayout,
        context: {},
        view: route
      }
    case 'object':
      // user: { view: 'components/User' }
      // user: { }
      view = get(route, 'view')
      layout = get(route, 'layout', defaultLayout)
      // for named route, the importUri is route name rather than real uri
      exportUri = get(route, 'uri', importUri)
      context = get(route, 'context', {})

      if (typeof context !== 'object') {
        throw TypeError(`Invalid route '${importUri}' context, object expected`)
      }

      if (typeof view !== 'string' && typeof view !== 'undefined') {
        throw TypeError(`Invalid route '${importUri}' view, file path string or undefined expected`)
      }

      return {
        uri: ensureFirstSlash(exportUri),
        layout,
        context,
        view
      }
    default:
      throw TypeError(`Invalid route '${importUri}', only view path or route object accepted`)
  }
}

interface IParseRoutesOptions {
  defaultLayout?: string
}
/**
 * Parse route definitions
 * @param routes route definitions
 * @param options parse routes options
 * @returns
 */
export const parseRoutes = (routes: IRouteDefinitionList, options: IParseRoutesOptions = { defaultLayout: 'index' }): IRouteDefinition[] =>
  map(routes, (route, uri) => parseRoute(route, uri, options.defaultLayout))
    .filter(Boolean)

interface IMapViewsOptions {
  viewDir: string
  suffix?: string
}
/**
 * Map real view file paths into route definitions
 * @param parsedRoutes Parsed route definitions
 * @param options map views options
 */
export const mapViews = (parsedRoutes: IRouteDefinition[], options: IMapViewsOptions): IRouteDefinition[] => {
  const { viewDir, suffix } = options

  const routeWithViews = filter(parsedRoutes, ({ view }) => typeof view === 'string')
  const resolveView = (name: string): string => `${viewDir.replace(/\\/g, '/')}/${name}${suffix ?? ''}`

  return map(routeWithViews, route => Object.assign(route, {
    view: resolveView(route.view)
  }))
}
