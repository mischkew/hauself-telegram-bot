import Telegraf from 'telegraf'
import debug from 'debug'
import flowEngine from './flow'
import { CANCEL_COMMANDS } from './sharedCommands'
import { setupPocket, setupPocketAuthApi } from './commands/pocket/pocketCommand'
import { setupSbahn } from './commands/sbahn/sbahnCommand'
import { setupMensa } from './commands/mensa/mensaCommand'
import sayingsMiddleware from './middlewares/sayingsMiddleware'
import express from 'express'
import session from './session'

const log = debug('HauselfBot:core')
const app = express()
app.listen(process.env.PORT, () => {
  log('Server running on %s', process.env.PORT)
})

// setup telegraf and middlewares
const telegraf = new Telegraf(process.env.BOT_TOKEN)

// TODO: when connection failed, give error message and use memory
// session
telegraf.use(session.middleware())
telegraf.use(flowEngine.middleware())

// clear session for debug purpose
let reset = {}
telegraf.use(Telegraf.optional(process.env.RESET_SESSION, (ctx, next) => {
  if (!reset[session.options.getSessionKey(ctx)]) {
    reset[session.options.getSessionKey(ctx)] = true
    ctx.session = null
  }
  return next()
}))

// clear session setup on each startup
let resetSetup = {}
telegraf.use((ctx, next) => {
  if (!resetSetup[session.options.getSessionKey(ctx)]) {
    resetSetup[session.options.getSessionKey(ctx)] = true
    ctx.session.isSetup = false
  }
  return next()
})

// notify the user to use the /start command
telegraf.use((ctx, next) => {
  return next().then(() => {
    if (!ctx.session.started) {
      return ctx.reply('Dobby is not called into service yet. Use the /start command, Master.', {
        reply_markup: { // hide remaining keyboards
          hide_keyboard: true
        }
      })
    }
  })
})

// configure all commands
async function setup(ctx, next) {
  log('register commands')

  // Mensa Command
  await setupMensa(telegraf, ctx, sayingsMiddleware)

  // S-Bahn Command
  await setupSbahn(telegraf, sayingsMiddleware)

  // Pocket Command
  await setupPocket(telegraf)

  CANCEL_COMMANDS.forEach((command) => {
    telegraf.command(command, (ctx) => {
      ctx.reply('There is nothing to cancel.')
    })
  })

  return next()
}

// setup express app routes
setupPocketAuthApi(telegraf, app)

// automatically setup all middleware, when previous session was
// interrupted
telegraf.use(Telegraf.optional(
  (ctx) => !ctx.session.isSetup && ctx.session.started,
  setup,
  (ctx, next) => {
    ctx.session.isSetup = true
    log('Current Session', ctx.session)
    return next()
  }
))

// otherwise we require a start command
telegraf.command(
  '/start',

  (ctx, next) => {
    // store user data on startup
    ctx.session.user = ctx.from
    log(ctx.session.user)

    ctx.session.started = true
    return next()
  },

  // setup commands
  setup,

  // get back to the user
  (ctx) => {
    return ctx.reply('Everything is setup, Master! The elf will do its best.', {
      reply_markup: { // hide remaining keyboards
        hide_keyboard: true
      }
    })
  }
)

//
// Operating Mode
//

// Reset Webhook Configs

if (process.env.OPERATING_MODE === 'polling') {
  log('Start Polling')
  telegraf
    .stop()
    .startPolling(300)
} else if (process.env.OPERATING_MODE === 'webhook') {
  // build heroku deploy url
  let domain = 'https://' + process.env.APP_NAME + '.herokuapp.com'
  log('Setup Webhook for', domain)

  // set telegram webhook
  telegraf.setWebHook(domain + '/' + process.env.BOT_TOKEN)

  // http webhook, for nginx/heroku users.
  app.use(telegraf.webHookCallback('/' + process.env.BOT_TOKEN, null, process.env.PORT))
} else {
  throw new Error('Define OPERATING_MODE environment variable.')
}
