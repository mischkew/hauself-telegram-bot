import { expect } from 'chai'
import moment from 'moment'
import nextMealDate from '../../../src/commands/mensa/nextMealDate'

describe('Next Meal Date', () => {
  it('should retrieve date of today as next meal date', () => {
    const m = moment('2016-05-12 13:15')
    expect(nextMealDate(m)).to.equal('2016-05-12')
  })

  it('should retrieve date of tomorrow as next meal date', () => {
    const m = moment('2016-05-12 14:15')
    expect(nextMealDate(m)).to.equal('2016-05-13')
  })

  it('should retrieve date of friday as next meal date', () => {
    const m = moment('2016-05-13 13:15')
    expect(nextMealDate(m)).to.equal('2016-05-13')
  })

  it('should retrieve date of next monday on friday afternoon', () => {
    const m = moment('2016-05-13 14:15')
    expect(nextMealDate(m)).to.equal('2016-05-16')
  })

  it('should retrieve date of next monday on weekend', () => {
    const m = moment('2016-05-14')
    expect(nextMealDate(m)).to.equal('2016-05-16')
  })
})
