import Api from './api'

const URL_API = 'http://openmensa.org/api/v2/'
const URL_MENSA = URL_API + 'canteens/'
const ENDPOINT_MENU = 'meals/'

export const MENSA_GRIEBNITZSEE = 62
export const MENSA_ULF = 112
export const MENSAS = [MENSA_GRIEBNITZSEE, MENSA_ULF]

export default class MensaApi extends Api {
  constructor() {
    super({ apiUrl: URL_MENSA })
  }

  getMensaMenuUrl(id) {
    return id + '/' + ENDPOINT_MENU
  }

  getMenu(id) {
    const url = this.getMensaMenuUrl(id)
    return this.get(url)
  }
}
