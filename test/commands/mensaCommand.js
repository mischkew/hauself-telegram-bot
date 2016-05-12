import { expect } from 'chai'
import debug from 'debug'
import moment from 'moment'
import { today,
         tomorrow,
         nextMonday,
         isWeekend,
         hours,
         nextMealDate,
         menuToMarkdown
       } from '../../src/commands/mensaCommand'
const log = debug('test')

describe('Mensa Command', () => {
  describe('Date Checks', () => {
    it('should retrieve today (2016-05-12) as string', () => {
      const m = moment('2016-05-12')
      const t = today(m)
      log(t)
      expect(t).to.equal('2016-05-12')
    })

    it('should retrieve tomorrow of 2016-01-31 as string', () => {
      const m = moment('2016-01-31')
      const t = tomorrow(m)
      log(t)
      expect(t).to.equal('2016-02-01')
    })

    it('should retreive date of next monday (2016-05-16) as string', () => {
      const m = moment('2016-05-12')
      const mo = nextMonday(m)
      log(mo)
      expect(mo).to.equal('2016-05-16')
    })

    it('should detect weekend correctly', () => {
      expect(isWeekend('2016-05-13 13:15')).to.be.false
      expect(isWeekend('2016-05-14 14:15')).to.be.true
    })

    it('should retrieve hours of 13:15 as number', () => {
      const m = moment('2016-05-12 13:15')
      const h = hours(m)
      log(h)
      expect(h).to.be.a.number
      expect(h).to.equal(13)
    })

    it.skip('should retrieve date of tomorrow as next meal date', () => {
      const m = moment('2016-05-12 14:15')
      expect(nextMealDate(m)).to.equal('2016-05-13')
    })

    it.skip('should retrieve date of today as next meal date', () => {
      const m = moment('2016-05-12 13:15')
      expect(nextMealDate(m)).to.equal('2016-05-12')
    })

    it.skip('should retrieve date of next monday on friday afternoon', () => {
      const m = moment('2016-05-13 14:15')
      expect(nextMealDate(m)).to.equal('2016-05-16')
    })

    it.skip('should retrieve date of next monday on weekend', () => {
      const m = moment('2016-05-14')
      expect(nextMealDate(m)).to.equal('2016-05-16')
    })
  })

  describe('parse menu response', () => {
    const menu = {
      date: '2016-05-17',
      closed: false,
      meals: [
        { id: 1910965,
        name: 'Hausgemachte Kartoffelpuffer mit Apfelmus',
        category: 'Angebot 1',
        prices: { students: null, employees: null, pupils: null, others: null },
        notes: ['ovo-lacto-vegetabil'], },
        { id: 1910966,
        name: 'Chili con Carne oder Chili sin Carne mit  Langkornreis oder Twister Potatos, dazu bunter Salat',
        category: 'Angebot 2',
        prices: { students: null, employees: null, pupils: null, others: null },
        notes: ['mit Rindfleisch'], },
        { id: 1910967,
        name: 'Seelachsfilet in Sesampanade mit hausgemachter Remoulade, dazu Rucola-Kartoffeln und bunter Salatmix',
        category: 'Angebot 3',
        prices: { students: null, employees: null, pupils: null, others: null },
        notes: ['mit Fisch'], },
        { id: 1913105,
        name: 'Mit Gemüse und Grünkern gefüllte frische Zucchini, dazu Kürbis-Salsa und Feldsalat mit Kirschtomaten und Honig-Senfdressing',
        category: 'Angebot 4',
        prices: { students: null, employees: null, pupils: null, others: null },
        notes: ['ovo-lacto-vegetabil'], }, ],
    }

    it('should parse a meal to markdown', () => {
      const markdown = '*Angebot 1*\\Hausgemachte Kartoffelpuffer mit Apfelmus'
      expect(menuToMarkdown(menu.meals[0])).to.equal(markdown)
    })
  })

})
