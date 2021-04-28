const { parseRoutes, mapViews } = require('.')
const { resolve: resolvePath } = require('path')

let didRunAlready = false
let routeOptions

exports.createPages = ({ actions }) => {
  const routeDefinitions = require(routeOptions.configFile)
  const parsedRoutes = parseRoutes(routeDefinitions, routeOptions)

  mapViews(parsedRoutes, routeOptions)
    .map(({ uri, view, layout, context }) => Object.assign({
      path: uri,
      matchPath: uri,
      component: view,
      layout,
      context: Object.assign(context, layout && {
        layout
      })
    }))
    .forEach(page => {
      actions.createPage(page)
    })
}

exports.onPreInit = ({ store }, options) => {
  if (didRunAlready) {
    throw new Error(
      'You can only have single instance of gatsby-plugin-layout in your gatsby-config.js'
    )
  }

  const baseDir = store.getState().program.directory

  didRunAlready = true
  routeOptions = Object.assign({
    // default values
    configFile: resolvePath(baseDir, 'src/routes.js'),
    viewDir: resolvePath(baseDir, 'src'),
    defaultLayout: 'index'
  }, options)
}
