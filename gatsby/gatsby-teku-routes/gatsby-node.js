const { parseRoutes, mapViews } = require('.')
const { resolve: resolvePath } = require('path')

let didRunAlready = false
let routeOptions

exports.createPages = ({ actions }) => {
  mapViews(
    parseRoutes(require(routeOptions.configFile)),
    routeOptions
  ).forEach(({ uri, view, layout }) => {
    const page = {
      path: uri,
      matchPath: uri,
      component: view,
      context: {
        layout
      }
    }

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
    viewDir: resolvePath(baseDir, 'src')
  }, options)
}
