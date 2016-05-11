// require('dotenv').config()
// require('babel-polyfill')
require('babel-core/register')({
  // ignore 3rd party packages
  // but build those which are written in es6 purely
  ignore: /(?!node_modules\/(telegraf))node_modules/
})
require('./index')
