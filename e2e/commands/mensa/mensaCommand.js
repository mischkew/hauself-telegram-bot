import { expect } from 'chai'
import debug from 'debug'
import { getNextMenus } from '../../../src/commands/mensa/mensaCommand'
const log = debug('e2e')

describe('mensa command', () => {
  it('should retrieve data from mensa and filter by date', (done) => {
    getNextMenus()
      .then(menus => {
        log('menus', menus)
        done()
      })
  })
})
