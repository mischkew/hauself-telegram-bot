import _ from 'lodash'
import debug from 'debug'
import MensaApi, { MENSAS } from './mensaApi'
import nextMealDate from './nextMealDate'
import mealsToMarkdown from './mealsToMarkdown'
const log = debug('mensaCommand:command')

// TODO: build a cache for openmensa results
// as the api may timeout
// clear cache a day after
// build up cache at night

//
// ## Parse Api Response
//

const api = new MensaApi()

function getMensas() {
  log('mensas %s', MENSAS)
  return api
    .getMensas(MENSAS)
    .tap(menus => log('menus', menus))
}

function filterMenusByDate(dateString, mensas) {
  return mensas.map(mensa => ({
    name: mensa.name,
    menus: mensa.menus.filter(menu => menu.date == dateString)
  }))
}

function extractNextMenu(mensas) {
  return mensas.map((mensa) => {
    if (mensa.menus.length > 1) {
      throw new Error('There should only be a single next date.')
    }

    let menu = null
    if (!_.isEmpty(mensa.menus)) {
      menu = mensa.menus[0]
    }

    return {
      name: mensa.name,
      menu
    }
  })
}

export function getNextMenus() {
  log('Get Next Menus')

  const dateString = nextMealDate()
  log('nextMealDate %s', dateString)

  return getMensas()
    .then(_.partial(filterMenusByDate, dateString))
    .tap((mensas) => log('filtered', mensas))
    .then(extractNextMenu)
    .tap((mensas) => log('extracted', mensas))
    .then(_.partial(mealsToMarkdown, dateString))
}

//
// ## Telegraf Reply
//

export function * replyMenus() {
  getNextMenus()
    .then((message) => this.reply(message, { parse_mode: 'Markdown' }))
}

//
// ## Telegraf Hearing
//

export function setupMensa(telegraf) {
  telegraf.hears('/mensa', replyMenus)
}
