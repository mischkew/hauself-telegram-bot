import VBBApi, { GRIEBNITZSEE_ID } from '../../../src/commands/sbahn/sbahnApi'
import { extend } from 'chai'

describe.skip('e2e VBBApi', () => {
  let api = null
  beforeEach(() => {
    api = new VBBApi()
  })

  // it('should get location from api', (done) => {
  //   api.getLocation(GRIEBNITZSEE_ID)
  //     .then((location) => {
  //       debugger
  //       done()
  //     })
  //     .catch(done)
  // })
})
