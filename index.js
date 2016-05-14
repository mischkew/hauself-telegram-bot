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

let domain = 'http://' + process.env.APP_NAME + '.herokuapp.com'
if (process.env.APP_NAME === 'localhost') {
  domain = 'http://localhost:5000'
}

console.log('Start Polling')
telegraf.startPolling()
