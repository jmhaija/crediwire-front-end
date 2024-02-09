// Include required packages
const gulp = require('gulp')
const clean = require('gulp-clean')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const inject = require('gulp-inject')
const concat = require('gulp-concat')
const cleanCss = require('gulp-clean-css')
const rev = require('gulp-rev')
const jsonLint = require('gulp-jsonlint')
const jsonFile = require('jsonfile')
const mocha = require('gulp-mocha')
const htmlMin = require('gulp-htmlmin')
const {argv} = require('yargs')
const sass = require('gulp-sass')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')
const sassCompiler = require('node-sass')

// This is how sass compiler is registered
// eslint-disable-next-line fp/no-mutation
sass.compiler = sassCompiler

const environments = {
  test: 'test',
  docker: 'docker',
  staging: 'staging',
  production: 'production'
}

const {test, docker, staging, production} = environments

// Target environment is provided via command line argument
const getTargetEnvironment = () => {
  if (argv.t) {
    return test
  }
  if (argv.d) {
    return docker
  }
  if (argv.s) {
    return staging
  }
  return production
}

const indexFilePath = './public/index.html'

// Run a regression test of the entire test suite
const regressionTest = done => {
  gulp.src('./test/*.js')
    .pipe(mocha({
      reporter: 'spec',
      bail: true
    }))
    .once('error', () => {
      console.log('Test regression encountered. Fix issues before building.\n\n')
      // process.exit()
    })
  done()
}

// Clean up the build output directory
const cleanProductionDirectory = done => (
  gulp.src('./public/*', {read: false})
    .pipe(clean())
    .on('end', done)
)

// Copy App Files for manipulation
const copyAppFiles = done => (
  gulp.series(() => (
    gulp.src('./src/app/**/*')
      .pipe(gulp.dest('./public/app'))
  ), () => (
    gulp.src([
      './src/appDev.js',
      './src/appProd.js',
      './src/appDocker.js',
      './src/appStaging.js'
    ])
      .pipe(gulp.dest('./public'))
      .on('end', done)
  ))()
)

const compileSass = () => (
  gulp.src('./src/assets/scss/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/assets/css'))
)

// Copy CrediWire Fonts
const copyFonts = done => (
  gulp.src('./src/assets/fonts/crediwire.*')
    .pipe(rev())
    .pipe(gulp.dest('./public/assets/fonts'))
    .pipe(rev.manifest('fonts.json'))
    .pipe(gulp.dest('./public'))
    .on('end', done)
)

// Copy Math Fonts
const copyMathFonts = done => (
  gulp.src([
    './src/assets/fonts/*',
    '!./src/assets/fonts/crediwire.*'
  ])
    .pipe(gulp.dest('./public/assets/fonts'))
    .pipe(gulp.dest('./public'))
    .on('end', done)
)

// Optimize CSS
const optimizeCss = done => {
  const fontFiles = jsonFile.readFileSync('./public/fonts.json')
  return gulp.src('./src/assets/css/*.css')
    .pipe(concat('./styles.css'))
    .pipe(replace('crediwire.eot', fontFiles['crediwire.eot']))
    .pipe(replace('crediwire.svg', fontFiles['crediwire.svg']))
    .pipe(replace('crediwire.ttf', fontFiles['crediwire.ttf']))
    .pipe(replace('crediwire.woff', fontFiles['crediwire.woff']))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(gulp.dest('./public/assets/css'))
    .on('end', done)
}

// Inject css tags into the index file
const injectCss = done => (
  gulp.src(indexFilePath)
    .pipe(inject(gulp.src('./public/assets/css/*.css', {read: false}), {
      transform: filePath => (
        `<link rel="stylesheet" href="/${filePath.replace('/public/', '')}">`
      )
    }))
    .pipe(gulp.dest('./public'))
    .on('end', done)
)

// Copy Assets
const copyAssets = done => (
  gulp.src([
    './src/assets/**/*',
    '!./src/assets/img/*',
    '!./src/assets/ico',
    '!./src/assets/ico/*',
    '!./src/assets/favicons',
    '!./src/assets/favicons/*',
    '!./src/assets/css/*',
    '!./src/assets/scss',
    '!./src/assets/scss/*',
    '!./src/assets/patterns',
    '!./src/assets/patterns/*',
    '!./src/assets/fonts/*'
  ])
    .pipe(rev())
    .pipe(gulp.dest('./public/assets'))
    .pipe(rev.manifest('asset-map.json'))
    .pipe(gulp.dest('./public'))
    .on('end', done)
)

// Define asset map by turning it into a require module
const modularizeAssetMap = done => (
  gulp.src('./public/asset-map.json')
    .pipe(replace('{', 'define({'))
    .pipe(replace('}', '})'))
    .pipe(rename('assets.js'))
    .pipe(gulp.dest('./public/app/config'))
    .on('end', done)
)

// Copy favicon
const copyFavicon = done => (
  gulp.src('./src/assets/ico/*.ico')
    .pipe(rev())
    .pipe(gulp.dest('./public/assets/ico'))
    .on('end', done)
)

// Copy favicons
const copyFavicons = done => (
  gulp.src('./src/assets/favicons/*')
    .pipe(gulp.dest('./public/assets/favicons'))
    .on('end', done)
)

// Lint JSON dictionaries
const lintJson = done => (
  gulp.src('./src/assets/dict/*.json')
    .pipe(jsonLint())
    .pipe(jsonLint.failOnError())
    .pipe(jsonLint.reporter())
    .on('end', done)
)

// This logic is more readable when imperative,
// as we are updating the Webpack configuration.
/* eslint-disable fp/no-mutation */
const updateWebpackConfig = config => {
  // Take the original webpack config file
  const updatedWebpackConfig = {...config}

  // Update `entry` based on environment
  const targetEnvironment = getTargetEnvironment()

  console.log(`Preparing build for ${targetEnvironment}...`)

  if (targetEnvironment === test) {
    updatedWebpackConfig.entry = './public/appDev.js'
  }
  if (targetEnvironment === docker) {
    updatedWebpackConfig.entry = './public/appDocker.js'
  }
  if (targetEnvironment === staging) {
    updatedWebpackConfig.entry = './public/appStaging.js'
  }
  if (targetEnvironment === production) {
    updatedWebpackConfig.entry = './public/appProd.js'
  }

  // Disable watch mode
  updatedWebpackConfig.watch = false

  // Some additional work for staging and production
  if ([staging, production].includes(targetEnvironment)) {
    // Remove dev-tools mapping
    updatedWebpackConfig.devtool = ''

    // Set production environment variable
    updatedWebpackConfig.mode = 'production'

    // Switch to Vue production
    updatedWebpackConfig.resolve.alias.Vue = 'vue/dist/vue.common.prod'
  }

  // Exclude `src` folder instead of `public` in `rules`
  updatedWebpackConfig.module.rules = (
    updatedWebpackConfig.module.rules.map(rule => ({
      ...rule,
      exclude: rule.exclude.map(exclude => (
        (exclude === '/public/')
          ? '/src/'
          : exclude
      ))
    }))
  )

  // Update resolve alias values from src folder to public folder
  const aliases = [
    'collections', 'components', 'config', 'constants',
    'directives', 'elements', 'helpers', 'mixins',
    'models', 'services', 'store', 'views'
  ]
  aliases.forEach(alias => {
    const newValue = updatedWebpackConfig.resolve.alias[alias].replace('/src/', '/public/')
    updatedWebpackConfig.resolve.alias[alias] = newValue
  })

  // Minify
  updatedWebpackConfig.optimization = {}

  return updatedWebpackConfig
  /* eslint-enable fp/no-mutation */
}

// Transpile modules using Babel
const transpileModules = done => (
  webpackStream(updateWebpackConfig(webpackConfig))
    .pipe(gulp.dest('./public/assets/js')) // Save it to this folder
    .on('end', done)
)

const optimizeModules = done => (
  gulp.series(
    transpileModules,
    () => (
      gulp.src('./public/assets/js/bundle.js')
        .pipe(rename('app.js'))
        .pipe(rev()) // Add hash to file name
        .pipe(gulp.dest('./public/assets/js')) // Save it to this folder
        .on('end', done)
    )
  )()
)

// Copy the index file
const copyIndex = done => (
  gulp.src('./src/index.html')
    .pipe(gulp.dest('./public'))
    .on('end', done)
)

// Inject favicon into the index file
const injectFavicon = done => (
  gulp.src(indexFilePath)
    .pipe(inject(gulp.src('./public/assets/ico/*.ico', {read: false}), {
      transform: filePath => (
        `<link rel="shortcut icon" href="/${filePath.replace('/public/', '')}">`
      )
    }))
    .pipe(gulp.dest('./public'))
    .on('end', done)
)


// Inject Javascript into the index file
const injectJavascript = done => gulp.src(indexFilePath)
  .pipe(inject(gulp.src(['./public/assets/js/app-*.js'], {read: false}), {
    transform: filePath => `<script src="/${filePath.replace('/public/', '')}"></script>`
  }))
  .pipe(gulp.dest('./public'))
  .on('end', done)

// Minify the html
const minifyHtml = done => (
  gulp.src(indexFilePath)
    .pipe(htmlMin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('./public'))
    .on('end', done)
)

// Clean build files
const cleanBuild = done => (
  gulp.src([
    './public/*.js',
    './public/*.eot',
    './public/*.ttf',
    './public/*.woff',
    './public/*.woff2',
    './public/*.svg',
    './public/*.json',
    './public/app',
    './public/assets/js/bundle.js'
  ])
    .pipe(clean())
    .on('end', done)
)

const jsWatch = () => (
  // eslint-disable-next-line fp/no-mutating-methods
  gulp.watch('./src/app/**/*', done => {
    gulp.series(
      copyAppFiles,
      () => {
        done()
      }
    )()
  })
)

const sassWatch = () => (
  // eslint-disable-next-line fp/no-mutating-methods
  gulp.watch('./src/assets/scss/**/*.scss', done => {
    gulp.series(
      compileSass,
      copyMathFonts,
      copyFonts,
      optimizeCss,
      () => {
        done()
      }
    )()
  })
)

const watchAll = () => (
  gulp.parallel(jsWatch, sassWatch)()
)

// Run tasks in sequence
const defaultTask = done => {
  gulp.series(
    regressionTest,
    cleanProductionDirectory,
    copyAppFiles,
    copyAssets,
    copyFavicon,
    copyFavicons,
    copyMathFonts,
    copyFonts,
    optimizeCss,
    modularizeAssetMap,
    lintJson,
    copyIndex,
    optimizeModules,
    injectCss,
    injectFavicon,
    injectJavascript,
    minifyHtml,
    cleanBuild,
    reallyDone => {
      done()
      reallyDone()
    }
  )()
}

module.exports = {
  default: defaultTask,
  jsWatch,
  sassWatch,
  watchAll,
  test: regressionTest
}
