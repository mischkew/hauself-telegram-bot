import moment from 'moment'
import MensaApi, { MENSAS,
                   MENSA_GRIEBNITZSEE,
                   MENSA_ULF } from '../apis/mensa'
import _ from 'lodash'

//
// ## Date Checks
//

const DATE_FORMAT = 'YYYY-MM-DD'
const HOURS_FORMAT = 'H'
const SHOW_TOMORROW_AFTER = 14

export function today(_moment = moment()) {
  return _moment.format(DATE_FORMAT)
}

export function tomorrow(_moment = moment()) {
  return _moment.add(1, 'days').format(DATE_FORMAT)
}

export function nextMonday(_moment = moment()) {
  console.log(_moment.days())
  if (_moment.days() > 5) {
    return _moment.day(1).format(DATE_FORMAT)
  } else {
    return _moment.day(8).format(DATE_FORMAT)
  }
}

export function isWeekend(dateString) {
  return moment(dateString).days() > 5
}

export function hours(_moment = moment()) {
  return parseInt(_moment.format(HOURS_FORMAT))
}

// export function nextMealDate(_moment = moment()) {
//   // check if it is already afternoon
//   // so we want to see the meal of tomorrow
//   const isAfternoon = hours(_moment) >= SHOW_TOMORROW_AFTER
//   console.log(isAfternoon)

//   // dates
//   const _today = today(_moment)
//   const _tomorrow = tomorrow(_moment)
//   console.log(_today, _tomorrow)

//   // show next monday if date would be on a weekend
//   if (isWeekend(_today) || (isWeekend(_tomorrow) && isAfternoon)) {
//     return nextMonday(_moment)
//   }

//   if (isAfternoon) {
//     return _tomorrow
//   }

//   return _today
// }

function isAfternoon() {
  return hours() >= SHOW_TOMORROW_AFTER
}

export function nextMealDate(_moment = moment()) {
  const isAfternoon = hours(_moment) >= SHOW_TOMORROW_AFTER
  const _today = today(_moment)
  const _tomorrow = tomorrow(_moment)

  if (isAfternoon) {
    return _tomorrow
  }

  return _today
}

//
// ## Parse Api Response
//

const api = new MensaApi()

function parseMenu({ json }) {
  if (isAfternoon()) {
    return json[1]
  }

  return json[0]

  // const meal = _.find(json.slice(0, 2), { date: nextMealDate() })
  // if (!meal) {
  //   return json[0]
  // }

  // return meal
}

function loadMenu(id) {
  return api.getMenu(id).then((menu) => {
    return {
      menu: parseMenu(menu),
      mensaId: id,
    }
  })
}

function loadMenus() {
  return Promise.all(MENSAS.map(loadMenu))
}

//
// Reply Creation
//

function mealToMarkdown(meal) {
  return `*${meal.category}*
${meal.name}`
}

function menuToMarkdown({ menu, mensaId }) {
  if (menu === undefined) {
    return 'No meal in ' + mensaId
  }

  return `Next Meal in ${mensaId}\n-------------\n\n` +
    menu.meals.map(mealToMarkdown).join('\n\n')
}

function replyMenu($, menusInMensa) {
  $.reply(menuToMarkdown(menusInMensa), { parse_mode: 'Markdown' })
}

function replyMenus($, menusInMensas) {
  menusInMensas.forEach(_.partial(replyMenu, $))
}

function* reply() {
  loadMenus().then(_.partial(replyMenus, this))
}

//
// Telegraf Hearing
//

export function setupMensa(telegraf) {
  telegraf.hears('/mensa', reply)
}
