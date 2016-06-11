import { expect } from 'chai'
import debug from 'debug'
import MensaApi from '../../../src/commands/mensa/mensaApi'
const log = debug('test')

describe.skip('Mensa Api', () => {
  it('should get from openmensa', (done) => {
    const api = new MensaApi()

    // TODO

    api.get('/')
      .then(({ response }) => { debugger; done() })
      .catch(done)
  })
})
