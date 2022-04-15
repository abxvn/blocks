const { parseRoutes, mapViews } = require('.')
const { resolve: resolvePath } = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const axios = require('axios')

let didRunAlready = false
let pluginOptions

exports.createPages = ({ actions }) => {
  const { configFile } = pluginOptions
  const routeDefinitions = require(configFile)
  const parsedRoutes = parseRoutes(routeDefinitions, pluginOptions)

  mapViews(parsedRoutes, pluginOptions)
    .map(({ uri, view, layout, context }) => ({
      path: uri.replace(/\/:/g, '/__'),
      matchPath: uri,
      component: view,
      context: Object.assign(context, layout && {
        layout
      })
    }))
    .forEach(page => {
      actions.createPage(page)
    })
}

exports.onPreInit = async ({ store }, options) => {
  if (didRunAlready) {
    throw new Error(
      'Please only define one instance of gatsby-teku-routes in your gatsby-config.js'
    )
  }

  const program = store.getState().program
  const { directory, host, https, p: port } = program

  didRunAlready = true
  pluginOptions = Object.assign({
    // default values
    configFile: resolvePath(directory, 'src/routes.js'),
    viewDir: resolvePath(directory, 'src'),
    defaultLayout: 'index'
  }, options)

  const configFile = pluginOptions.configFile

  if (!await fs.exists(configFile)) {
    throw Error(
      `Route definition file not found at ${configFile}`
    )
  }

  const command = program._[0]

  // Activate watch mode only during development
  if (command === 'develop' && options.watch) {
    if (!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT) {
      throw new Error(
        'To use watch mode, gatsby command should be run with ENABLE_GATSBY_REFRESH_ENDPOINT enabled'
      )
    }

    const shortenConfigFile = configFile.replace(directory, '')
    const cacheRefreshURL = `${https ? 'https' : 'http'}://${host}:${port}/__refresh`
    const watcher = chokidar.watch(configFile, {
      persistent: true
    })

    watcher.once('ready', () => console.info(`[teku-routes] Watching route definitions at ${shortenConfigFile}`))
    watcher.on('change', () => {
      console.info('[teku-routes] Route definitions changes detected, rebuilding ...')
      // Invalidate route config by deleting its cache
      delete require.cache[configFile]

      axios.post(cacheRefreshURL)
        .catch(err => {
          console.error('[teku-routes] Cannot refresh cache on route definition changes')
          console.error(err)
        })
    })
    watcher.on('error', err => {
      console.error(`[teku-routes] Error while watching route definitions at ${shortenConfigFile}`)
      console.error(err)
    })
  }
}
