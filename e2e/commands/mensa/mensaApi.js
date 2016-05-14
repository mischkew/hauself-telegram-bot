import { expect } from 'chai'
import debug from 'debug'
import MensaApi, { MENSA_GRIEBNITZSEE } from '../../../src/commands/mensa/mensaApi'
const log = debug('e2e')

describe('mensa api', () => {
  it('should retrieve data from griebnitzsee', (done) => {
    const api = new MensaApi()
    api
      .getMensaMenus(MENSA_GRIEBNITZSEE)
      .then(json => {
        log('Response', json)
        log('Meals of first entry', json[0].meals)

        expect(json).to.be.an.array
        expect(json[0]).to.have.property('date')
        expect(json[0]).to.have.property('closed')
        expect(json[0]).to.have.property('meals')
        expect(json[0].meals).to.be.an.array
        expect(json[0].meals[0]).to.have.property('name')
        expect(json[0].meals[0]).to.have.property('category')
        done()
      })
  })
})
