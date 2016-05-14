import moment from 'moment'
import { bold,
         underline } from '../../lib/markdown'

const DATE_FORMAT = 'dddd, MMMM D YYYY'

//
// ### Markdown Transformations
//

function meal(meal) {
  return bold(meal.category) + '\n'
    + meal.name
}

function date(dateString) {
  const date = moment(dateString).format(DATE_FORMAT)
  return date + '\n'
    + underline(date, '=')
}

function menu(meals) {
  return meals
    .map(meal)
    .join('\n\n')
}

function mensa(name, _menu) {
  return bold(name) + '\n'
    + underline(name) + '\n\n'
    + (_menu === null ? 'No information available.' : menu(_menu.meals))
}

export default function mealsToMarkdown(dateString, mensas) {
  return `Meals on ${date(dateString)}` + '\n\n'
    + mensas.map(_mensa => mensa(_mensa.name, _mensa.menu)).join('\n\n')
}
