import './src/polyfills'
import Telegraf from 'telegraf'

const telegraf = new Telegraf(process.env.BOT_TOKEN)
telegraf.use(Telegraf.memorySession())

// Logger middleware
telegraf.use(function * (next) {
  var start = new Date()
  this.state.started = start
  yield next
  var ms = new Date() - start
  console.log(ms)
})

// Sample middleware
var sayYoMiddleware = function * (next) {
  yield this.reply('yo')
  yield next
}

// Random advice bot!
telegraf.on('text', function * (next) {
  if (Math.random() > 0.5) {
    yield this.reply('Highly advised to visit:')
    yield this.replyWithLocation((Math.random() * 180) - 90, (Math.random() * 180) - 90)
  }
  yield next
})

// Text messages handling
telegraf.hears('Hey', sayYoMiddleware, function * () {
  this.session.heyCounter = this.session.heyCounter || 0
  this.session.heyCounter++
  this.reply(`${this.session.heyCounter} _Hey_`, {parse_mode: 'Markdown'})
})

// Command handling
telegraf.hears('/answer', sayYoMiddleware, function * () {
  debug(this.message)
  this.reply('*42*', {parse_mode: 'Markdown'})
})

// Wow! RegEx
telegraf.hears(/reverse (.+)/, function * () {
  this.reply(this.match[1].split('').reverse().join(''))
})

// Start polling


let domain = 'http://' + process.env.APP_NAME + '.herokuapp.com'
if (process.env.APP_NAME === 'localhost') {
  domain = 'http://localhost:5000'
}

console.log('Start Polling')
telegraf.startPolling()
