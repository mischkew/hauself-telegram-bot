import Telegraf from 'telegraf'
import flow from './flow'
import { startVBB, setupVBB } from './commands/sbahn/vbbCommand'
import { setupMensa } from './commands/mensa/mensaCommand'
import sayingsMiddleware from './middlewares/sayingsMiddleware'

const telegraf = new Telegraf(process.env.BOT_TOKEN)
telegraf.use(Telegraf.memorySession())
telegraf.use(flow.middleware())

// notify the user to use the /start command
telegraf.use(function * (next) {
  yield next

  if (!this.session.started) {
    this.reply('Dobby is not called into service yet. Use the /start command, Master.')
  }
})

telegraf.hears(
  '/start',

  function * (next) {
    // store user data on startup
    this.session.user = this.message.from

    this.session.started = true
    yield next
  },

  // start commands
  startVBB,

  // setup commands
  function * () {
    console.log('all start handlers are setup')
    console.log('register commands')

    // Mensa Command
    setupMensa(telegraf, sayingsMiddleware)

    // VBB Command
    setupVBB(telegraf, sayingsMiddleware)

    // get back to the user
    this.reply('Everything is setup, Master! The elf will do its best.')
  }
)

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
