import 'core-js/stable'
import 'regenerator-runtime/runtime'

const settings = require('./app/config/settings-staging')
const crediwire = require('./app/crediwire')
const ErrorHandler = require('./app/services/ErrorHandler')

try {
  crediwire.run(settings)
}
catch (error) {
  ErrorHandler.handleError(error)
}
