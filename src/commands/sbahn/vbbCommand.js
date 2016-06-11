import _ from 'lodash'
import debug from 'debug'
import VBBApi, { STATION_IDS } from './sbahnApi'
import flow from '../../flow'
import { bold, underline } from '../../lib/markdown'
const log = debug('vbbCommand:command')

const DATE_FORMAT = 'h:mm:ss a, dddd, MMMM Do YYYY'
const api = new VBBApi()

//
// ## Telegraf Reply
//

function heading(stationName) {
  const headline = 'Departures from ' + stationName
  return bold(headline) + '\n'
    + bold(underline(headline)) + '\n'
}

function departure(departure) {
  return [
    `${bold(departure.name)} to ${bold(departure.direction)}`,
    `on ${departure.date.format(DATE_FORMAT)}`
  ].join('\n') + '\n'
}

function departuresToMarkdown(stationName, departures) {
  return [heading(stationName)]
    .concat(departures.map(departure))
    .join('\n')
}

export function * chooseStation() {
  log('Choose Station Action')

  const stationLayout = _.map(STATION_IDS, ({ name }) => [{ text: name }])

  yield this.reply('Choose a station', {
    reply_markup: {
      keyboard: stationLayout,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  })
}

export function * replyDepartures(context, id) {
  log(`Reply Departures for ${id}`)

  yield api.getDepartureBoardForStation(id)
    .then((departures) => context.reply(
      departuresToMarkdown(STATION_IDS[id].name, departures.slice(0, 10)),
      { parse_mode: 'Markdown' }
    ))
    .catch((error) => context.reply(`Could not fetch departures. ${error.stack}`))
}

//
// ## Flows
//

flow.registerFlow(
  'sbahn-departures',
  chooseStation,
  function * () {
    if (this.message && this.message.text) {
      const station = _.findKey(STATION_IDS, { name: this.message.text })
      yield replyDepartures(this, station)
    } else {
      yield this.reply('I don\'t know that station, sorry Master!')
    }
  }
)

//
// ## Telegraf Hearing
//

export function * startVBB(next) {
  log('Start VBB Command')

  this.session.vbb = {
    station: null
  }

  yield next
}

export function setupVBB(telegraf, ...middlewares) {
  telegraf.hears('/sbahn', ...middlewares, function * () {
    log('Sbahn Action')
    yield this.flow.start('sbahn-departures')
  })
}
