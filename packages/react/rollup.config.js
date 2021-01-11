import { join } from 'path'
import glob from 'glob'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
// import commonjs from '@rollup/plugin-commonjs'
import sass from 'node-sass'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'

const baseConfig = {
  plugins: [
    // This prevents needing an additional `external` prop in this config file by automaticall excluding peer dependencies
    peerDepsExternal({
      packageJsonPath: join(__dirname, 'package.json')
    }),
    // Convert CommonJS modules to ES6
    // commonjs({
    //   include: 'node_modules/**',
    //   // This was required to fix some random errors while building
    //   namedExports: {
    //     'react-is': ['isForwardRef', 'isValidElementType']
    //   }
    // }),
    // "...locates modules using the Node resolution algorithm"
    resolve(),
    // Do Babel transpilation
    babel({
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ],
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    // Does a number of things; Compiles sass, run autoprefixer, creates a sourcemap, and saves a .css file
    postcss({
      preprocessor: (content, id) => new Promise((resolve) => {
        const result = sass.renderSync({ file: id })

        resolve({ code: result.css.toString() })
      }),
      plugins: [autoprefixer],
      modules: {
        scopeBehaviour: 'global'
      },
      sourceMap: true,
      extract: true
    })
  ]
}

const dirPath = __dirname
const inputFiles = glob.sync(`${dirPath}/src/**/*.js`)

const config = inputFiles.map(path => {
  return Object.assign({
    input: path,
    output: {
      file: path.replace(/.+\/src\//, 'components/'),
      format: 'module'
    }
  }, baseConfig)
})

export default config
