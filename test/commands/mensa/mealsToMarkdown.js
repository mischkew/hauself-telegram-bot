import { expect } from 'chai'
import debug from 'debug'
import mealsToMarkdown from '../../../src/commands/mensa/mealsToMarkdown'
const log = debug('test')

describe('Meals to Markdown', () => {
  const dateString = 'Meals on Thursday, May 12 2016\n=====================\n\n'

  it('should build markdown for no mensas', () => {
    const md = mealsToMarkdown('2016-05-12', [])
    log(md)
    expect(md).to.equal(dateString)
  })

  it('should build markdown for a single mensa with no meals', () => {
    const md = mealsToMarkdown('2016-05-12', [{ name: 'Mensa1', menu: { meals: [] } }])
    log(md)
    expect(md).to.equal(
      dateString
        + '*Mensa1*\n'
        + '------\n\n'
    )
  })

  it('should build markdown for a single mensa', () => {
    const meals = [{
      name: 'Mensa1',
      menu: {
        meals: [
          { name: 'Meal1', category: 'Cat1' },
          { name: 'Meal2', category: 'Cat2' }
        ]
      }
    }]
    const md = mealsToMarkdown('2016-05-12', meals)
    log(md)
    expect(md).to.equal(
      dateString
        + '*Mensa1*\n'
        + '------\n\n'
        + '*Cat1*\n'
        + 'Meal1\n\n'
        + '*Cat2*\n'
        + 'Meal2'
    )
  })
})
