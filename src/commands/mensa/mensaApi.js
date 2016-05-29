import debug from 'debug'
import _ from 'lodash'
import Api from 'fetch-api'
const log = debug('mensaCommand:api')

const URL_API = 'http://openmensa.org/api/v2/'
const URL_MENSA = URL_API + 'canteens/'
const ENDPOINT_MENU = 'meals/'

export const MENSA_GRIEBNITZSEE = 62
export const MENSA_ULF = 112
export const MENSA_TASTIES_BABELSBERG = 104

export const MENSAS = [
  MENSA_GRIEBNITZSEE,
  MENSA_ULF,
  MENSA_TASTIES_BABELSBERG
]

export default class MensaApi extends Api {
  constructor(options = {}) {
    super(URL_MENSA, options)
  }

  //
  // Url Helper
  //

  getMensaMenuUrl(id) {
    return id + '/' + ENDPOINT_MENU
  }

  //
  // API Calls
  //

  getMensa(id) {
    return this.get(id).then(r => r.data)
  }

  getMensaMenus(id) {
    const url = this.getMensaMenuUrl(id)
    return this.get(url).then(r => r.data)
  }

  //
  // Compound API Calls & Formatting
  //

  getMenus(id) {
    log('getMenus for canteen %s', id)

    return Promise.join(
      this.getMensa(id),
      this.getMensaMenus(id),
      (mensa, menus) => {
        let _menus = []
        if (!_.isEmpty(menus)) {
          _menus = menus.map(menu => {
            let _meals = []
            if (!_.isEmpty(menu.meals)) {
              _meals = menu.meals.map(meal => _.pick(meal, ['name', 'category']))
            }

            return {
              closed: menu.closed,
              date: menu.date,
              meals: _meals
            }
          })
        }

        return {
          name: mensa.name,
          menus: _menus
        }
      }
    )
  }

  getMensas(ids) {
    return Promise.all(ids.map(this.getMenus.bind(this)))
  }
}
