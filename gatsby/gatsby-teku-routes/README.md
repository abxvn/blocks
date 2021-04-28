gatsby-teku-routes
=====
[![gatsby-teku-routes version][npm-version-badge]][npm-url]
[![gatsby-teku-routes downloads per months][npm-downloads-badge]][npm-url]

- 🏭 A part of `teku` [Building Blocks](https://github.com/tekuasia/blocks) project
- 🚀 Programmatically create pages and routes from configuration
- 📦 Designed to be highly reusable between build time and run time, between any application parts
- 💡 Provides helpful APIs to access route config
- 🌓 Supports [gatsby-plugin-layout](https://www.gatsbyjs.com/plugins/gatsby-plugin-layout/) out of the box

**Table of contents**
  * [Installation](#installation)
  * [How To Use](#how-to-use)
    + [Enable plugin](#enable-plugin)
    + [Plugin options](#plugin-options)
  * [Route definitions](#route-definitions)
    + [Example route definitions:](#example-route-definitions)
    + [Uri to view route](#uri-to-view-route)
    + [Named route](#named-route)
    + [Custom layout route](#custom-layout-route)
  * [Reusable APIs](#reusable-apis)
    + [parseRoute](#parseroute)
    + [mapViews](#mapviews)
  * [Contribution](#contribution)

## Installation

```shell
npm install --dev gatsby-teku-routes
```

## How To Use

### Enable plugin

Enable the plugin in `plugins` section of your `gatsby-config.js`:

```javascript
...
plugins: [
  'gatsby-teku-routes'
]
```

### Plugin options

All plugin options are optional, example options:

```javascript
{
  resolve: 'gatsby-teku-routes',
  options: {
    suffix: 'Page.tsx'
  }
}
```

The `suffix` option helps you shorten for view path declaration, so instead of having to define route like `/: 'components/BlogPage.tsx'`, it can be shorten like this `/: 'components/Blog'`. More information can be found with full list of options below:

| Option        | Type     | Description                                                   | Default         |
|---------------|----------|---------------------------------------------------------------|-----------------|
| configFile    | `string` | Full path to routes config file                               | `src/routes.js` |
| viewDir       | `string` | Base directory path to resolve views                          | `src`           |
| defaultLayout | `string` | Default layout name, provide context for gatsby-plugin-layout | `'index'`       |
| suffix        | `string` | Resolved view file name suffix                                | `''`            |

## Route definitions

### Example route definitions:

```javascript
module.exports = {
  // 1. Uri to view route
  '/': 'landing/Index',

  // 2. Named route
  auth: {
    // Real uri
    uri: '_auth',
    view: 'auth/Callback'
  },

  // 3. Custom layout route
  '/404': {
    view: 'lib/errors/404',
    layout: 'error'
  }
}

```

### Uri to view route

This route definition simply contains direct mapping between uri to view resolve path.

> We have a default layout name as `index`, can be changed using [options](#plugin-options) `defaultLayout`.

`'/': 'landing/Index'` is resolved as:
```javascript
{
  uri: '/',
  layout: 'index',
  view: 'landing/Index'
}
```

### Named route

Sometimes you don't want to access routes using its uri, which is hard to manage or change across source code later. So instead of `/_user_auth_callback`, you can name it as `authCallback`, like this:

```javascript
authCallback: {
  uri: '/_user_auth_callback',
  view: 'auth/Callback'
}
```

### Custom layout route

This plugin supports `gatsby-plugin-layout` out of the box, and the default layout is `index`. You can customize it per route using route config object:

**Use `list` layout instead of `index`**
```
'/users': {
  view: 'users/List',
  layout: 'list'
}
```

**Without any layouts at all**
```
'/user-custom': {
  view: 'users/custom',
  layout: ''
}
```

In order to fully archive page render without any layouts, you may config it in your  layout index file, for example the [default layout file](https://www.gatsbyjs.com/plugins/gatsby-plugin-layout/#how-to-use):

```javascript
// src/layouts/index.js
const Layout= (props) => {
  const { children, pageContext } = props

  switch (pageContext.layout) {
    case '':
      // Disable layout
      return children
    default:
      return <Layout>{children}</Layout>
  }
}
```

## Reusable APIs

### parseRoute

> parseRoute(route, uri, defaultLayout = 'index')

Parse a route config into an array of route config object:
* `route`: can be string path to view or route definitions object
* `uri`: a string uri or route name
* `defaultLayout`: layout name to use when no layout specified in route definition

### mapViews

> mapViews(parsedRoutes, options)

Map resolved view component path into an array of route config objects:
* `parsedRoutes`: array of route config objects, mostly comes from calling `parseRoute`
* `options`: more information can be found from [options](#plugin-options)

## Contribution

All contributions are welcome. Feel free to open PR or share your ideas of improvement.

Thank you.

[npm-url]: https://www.npmjs.com/package/gatsby-teku-routes
[npm-downloads-badge]: https://img.shields.io/npm/dw/gatsby-teku-routes
[npm-version-badge]: https://badge.fury.io/js/gatsby-teku-routes.svg
