const kindOf = require('kind-of')
const get = require('lodash/get')
const map = require('lodash/map')
const filter = require('lodash/filter')

const ensureFirstSlash = str => '/' + str.replace(/^\/+/, '')
const parseRoute = (route, importUri, defaultLayout = 'index') => {
  if (!importUri) {
    throw TypeError('Invalid route config, please provide uri')
  }

  let view
  let layout
  let exportUri = importUri
  let context

  switch (kindOf(route)) {
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

      if (kindOf(context) !== 'object') {
        throw TypeError(`Invalid route '${importUri}' context, object expected`)
      }

      if (kindOf(view) !== 'string' && kindOf(view) !== 'undefined') {
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

const parseRoutes = (routeDefinitions, { defaultLayout } = {}) =>
  map(routeDefinitions, (route, uri) => parseRoute(route, uri, defaultLayout))
    .filter(Boolean)
const mapViews = (parsedRoutes, { viewDir, suffix }) => {
  const routeWithViews = filter(parsedRoutes, ({ view }) => kindOf(view) === 'string')
  const resolveView = name => require.resolve(`${viewDir}/${name}${suffix || ''}`)

  return map(routeWithViews, route => Object.assign(route, {
    view: resolveView(route.view)
  }))
}

exports.parseRoute = parseRoute
exports.parseRoutes = parseRoutes
exports.mapViews = mapViews
