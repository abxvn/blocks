const { parseRoutes, mapViews } = require('.')
const { resolve: resolvePath, extname, normalize } = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const axios = require('axios')

let didRunAlready = false
let pluginOptions

exports.createPages = ({ actions }) => {
  const configFile = pluginOptions.configFile

  if (['.ts', '.mjs'].includes(extname(configFile))) {
    require('@babel/register')({
      presets: ['@babel/preset-env'],
      extensions: ['.ts', '.mjs'],
      only: [
        pluginOptions.configFile
      ]
    })
  }

  const routeConfigData = require(pluginOptions.configFile)
  const routeDefinitions = routeConfigData ? routeConfigData.default || routeConfigData : {}
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
  const workingDir = directory

  didRunAlready = true

  const defaultConfigFile = resolvePath(workingDir, 'src/routes.js')
  const defaultOptions = {
    layout: 'index',
    configFile: defaultConfigFile,
    viewDir: resolvePath(workingDir, 'src')
  }

  pluginOptions = Object.assign(defaultOptions, options)
  pluginOptions.viewDir = normalizePath(pluginOptions.viewDir)
  pluginOptions.configFile = normalizePath(pluginOptions.configFile)

  console.log(pluginOptions)

  const configFile = pluginOptions.configFile

  if (!await fs.pathExists(configFile)) {
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

    const shortenConfigFile = configFile.replace(workingDir, '')
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

const normalizePath = path => normalize(path).replace(/\\/g, '/')
