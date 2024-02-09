// `path` is required to update aliases in the Webpack configuration
// eslint-disable-next-line import/no-nodejs-modules
const path = require('path')
const webpack = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: './src/appDev.js',
  mode: 'development',
  watch: true,
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    port: 3000
  },
  module: {
    rules: [
      {
        // Process all `js` imports with Babel.
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /\.test\.js$/,
          '/test/',
          '/public/'
        ],
        use: {
          loader: 'babel-loader'
        }
      },
      {
        // Process all `vue` imports with vue-loader
        test: /\.vue$/,
        exclude: [
          /node_modules/,
          '/public/'
        ],
        loader: 'vue-loader'
      },
      {
        test: /\.scss$/,
        exclude: [
          /node_modules/,
          '/public/'
        ],
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              prependData: "@import 'src/assets/scss/_variables.scss';"
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      bowser: 'bowser/src/bowser',
      datepicker: 'air-datepicker/src/js/air-datepicker',
      FileSaver: 'file-saver/FileSaver',
      Highcharts: 'highcharts/highcharts',
      HighchartsMore: 'highcharts/highcharts-more',
      jQuery: 'jquery/dist/jquery',
      katex: 'katex/katex',
      moment: 'moment/moment',
      Promise: 'promise-polyfill/promise',
      // q is the name of the library
      // eslint-disable-next-line id-length
      q: 'q/q',
      Raven: 'raven-js/src/singleton',
      RavenVue: 'raven-js/dist/plugins/vue.min',
      VModal: 'vue-js-modal/dist/index',
      VTooltip: 'v-tooltip/dist/v-tooltip.umd',
      // This will be replaced with
      // `Vue: 'vue/dist/vue.common.prod'`
      // when creating build for staging or production
      Vue: 'vue/dist/vue.common.dev',
      VueResource: 'vue-resource/dist/vue-resource.common',
      VueRouter: 'vue-router/dist/vue-router.common',
      Vuex: 'vuex/dist/vuex.common',

      collections: path.resolve(__dirname, 'src/app/collections/'),
      components: path.resolve(__dirname, 'src/app/components/'),
      config: path.resolve(__dirname, 'src/app/config/'),
      constants: path.resolve(__dirname, 'src/app/constants/'),
      directives: path.resolve(__dirname, 'src/app/directives/'),
      elements: path.resolve(__dirname, 'src/app/elements/'),
      helpers: path.resolve(__dirname, 'src/app/helpers/'),
      mixins: path.resolve(__dirname, 'src/app/mixins'),
      models: path.resolve(__dirname, 'src/app/models/'),
      services: path.resolve(__dirname, 'src/app/services/'),
      store: path.resolve(__dirname, 'src/app/store/'),
      views: path.resolve(__dirname, 'src/app/views/')
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      // jQuery must be registered as $
      // eslint-disable-next-line id-length
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new VueLoaderPlugin()
  ],
  optimization: {
    minimize: false
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'src/dist'),
    publicPath: 'dist/'
  }
}
