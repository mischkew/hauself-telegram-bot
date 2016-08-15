import _ from 'lodash'
import debug from 'debug'
import VBBApi, { STATION_IDS } from './sbahnApi'
import flowEngine from '../../flow'
import { bold, underline } from '../../lib/markdown'
import { CANCEL_COMMANDS } from '../../sharedCommands'

const log = debug('sbahnCommand:command')
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

export function chooseStation(ctx) {
  log('Choose Station Action')

  const stationLayout = _.map(STATION_IDS, ({ name }) => [{ text: name }])

  return ctx.reply(bold('Choose a station.'), {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: stationLayout,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  })
}

export function replyDepartures(ctx, id) {
  log(`Reply Departures for ${id}`)

  return api.getDepartureBoardForStation(id)
    .then((departures) => ctx.replyWithMarkdown(
      departuresToMarkdown(STATION_IDS[id].name, departures.slice(0, 10))
    ))
    .catch((error) => ctx.reply(`Could not fetch departures. ${error.stack}`))
}

//
// ## Flows
//

const { Flow } = flowEngine.constructor
const departureFlow = new Flow('departures')
departureFlow.onStart(chooseStation)
departureFlow.on('text', (ctx, next) => {
  if (CANCEL_COMMANDS.indexOf(ctx.message.text) !== -1) {
    log('Cancel Sbahn Departures')
    return ctx.reply('Ok, we cancel this.', {
      reply_markup: { hide_keyboard: true }
    }).then(() => ctx.flow.stop())
  }
  return next()
})
departureFlow.on('text', (ctx) => {
  log('Answer Chosen Station')

  if (ctx.message && ctx.message.text) {
    log(ctx.message)
    const station = _.findKey(STATION_IDS, { name: ctx.message.text })
    if (station) {
      return replyDepartures(ctx, station)
        .then(() => ctx.flow.stop())
    }
  }

  ctx.reply(
    'I don\'t know that station, sorry Master!\n'
    + 'Either select a station from the keyboard or use the /cancel command.'
  ).then(() => ctx.flow.restart('departures'))
})

flowEngine.register(departureFlow)

//
// ## Telegraf Hearing
//

export function setupSbahn(telegraf, ...middlewares) {
  telegraf.command('/sbahn', ...middlewares, function (ctx) {
    log('Sbahn Action')
    ctx.flow.start('departures')
  })
}
