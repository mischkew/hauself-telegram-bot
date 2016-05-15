import './src/polyfills'
import Telegraf from 'telegraf'
import { setupMensa } from './src/commands/mensa/mensaCommand'

// TODO: fix json-jscs errors in emacs
// TODO: put telegraf logic into bot.js
// TODO: only leave telegraf polling in index.js

// TODO: write testable code!
// TODO: create commands/mensaCommand.js
// TODO: use apis/mensaApi.js and load mensa info
// TODO: document commands in bot.js so BotFather can add them via copy & paste

// TODO: add tests for jrr-frontend for api
// TODO: add mocha tests for mensaCommand.js

const telegraf = new Telegraf(process.env.BOT_TOKEN)
telegraf.use(Telegraf.memorySession())

// Mensa Command
setupMensa(telegraf)

//
// Operating Mode
//

// Reset Webhook Configs

if (process.env.OPERATING_MODE === 'polling') {
  console.log('Start Polling')
  telegraf.removeWebHook()
    .then(() => telegraf.startPolling())
} else if (process.env.OPERATING_MODE === 'webhook') {
  // build heroku deploy url
  let domain = 'https://' + process.env.APP_NAME + '.herokuapp.com'
  console.log('Setup Webhook for', domain)

  // set telegram webhook
  telegraf.setWebHook(domain + '/' + process.env.BOT_TOKEN)

  // http webhook, for nginx/heroku users.
  telegraf.startWebHook('/' + process.env.BOT_TOKEN, null, process.env.PORT)
} else {
  throw new Error('Define OPERATING_MODE environment variable.')
}
