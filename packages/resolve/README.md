@teku-blocks/resolve
=====
This is an extended version of [resolve](https://www.npmjs.com/package/resolve) to provide async [`node require.resolve algorithmn`](https://nodejs.org/api/modules.html#modules_all_together), with extra features:
  - Allow multiple module resolving using wildcard (*)
  - Allow advanced search using file contents search (coming soon)

**Table of contents**
+ [Installation](#installation)
+ [Usage](#usage)
  - [Resolves modules in async way](#resolves-modules-in-async-way)
  - [Resolves wildcard modules](#resolves-wildcard-modules)
  - [Resolves modules using custom file contents filter](#resolves-modules-using-custom-file-contents-filter)
+ [Contribution](#contribution)


Installation
-----
Install using `yarn` or `npm`:
```
yarn add @teku-blocks/resolve
```

Usage
----
### Resolves modules in async way
The `resolve` function return a Promise with module's path and package.json contents
```js
import resolve from `@teku-blocks/resolve`

// {
//   path: string,
//   pkg: object
// }
const { path, pkg } = await resolve('moduleA')
```

### Resolves wildcard modules
For example, to resolve all modules belonging to [`@teku`](https://teku.asia) organization
```js
// {
//    '@teku/form': { path, pkg },
//    '@teku/react': { path, pkg },
//    '@teku/firebase': { path, pkg }
// }
const tekuModules = await resolveWildcard('@teku/*')
```

### Resolves modules using custom file contents filter
(Coming soon)

Contribution
-----
All contributions are welcomed. Feel free to clone this project, make changes that your feel necessary and pull request anytime you want.

Install dependencies
```
yarn install
```

Run development build
```
yarn start
```

If you have any other suggestions, you can even open new issues with `enhancement` label.

-----

🍻 Cheers
