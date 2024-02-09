// eslint-disable-next-line unicorn/prevent-abbreviations
import 'core-js/stable'
import 'regenerator-runtime/runtime'

const settings = require('./app/config/settings-dev')
const crediwire = require('./app/crediwire')
const ErrorHandler = require('./app/services/ErrorHandler')

try {
  crediwire.run(settings)
}
catch (error) {
  ErrorHandler.handleError(error)
}
