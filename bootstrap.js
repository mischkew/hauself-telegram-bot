//
// Bootstrap Test Environment
// This file has to be written in plain ES5!
//

//
// Enable ES6
//

// node_modules written in es6 which have to be compiled as well.
// Add packges names here.
var ES6_PACKAGES = [
  'fetch-mock',
  'telegraf'
]
require('babel-core/register')({
  // ignore 3rd party packages
  // but build those which are written in es6 purely
  ignore: new RegExp('/(?!node_modules\/(' + ES6_PACKAGES.join('|') + '))node_modules/')
})

//
// Execute Polyfills
//

require('babel-polyfill')
require('./bluebird-polyfill')
require('isomorphic-fetch')
