import moment from 'moment'
import debug from 'debug'
const log = debug('mensaCommand:nextMealDate')

//
// ## Date Checks
//

const DATE_FORMAT = 'YYYY-MM-DD'
const HOURS_FORMAT = 'H'
const SHOW_TOMORROW_AFTER = 14

function today(_moment) {
  return _moment.format(DATE_FORMAT)
}

function tomorrow(_moment) {
  return _moment.add(1, 'days').format(DATE_FORMAT)
}

function nextMonday(_moment) {
  if (_moment.days() === 6) { // saturday
    return _moment.add(2, 'days').format(DATE_FORMAT)
  } else if (_moment.days() === 0) { // sunday
    return _moment.add(1, 'days').format(DATE_FORMAT)
  } else {
    throw new Error(`nextMonday can only be calculated from weekend-days, given ${_moment.days()}`)
  }
}

function isWeekend(dateString) {
  return moment(dateString).days() === 6 ||
    moment(dateString).days() === 0
}

function hours(_moment) {
  return parseInt(_moment.format(HOURS_FORMAT))
}

function isAfternoon(_moment) {
  return hours(_moment) >= SHOW_TOMORROW_AFTER
}

export default function nextMealDate(_moment = moment()) {
  const _today = today(_moment)
  const _tomorrow = tomorrow(_moment)
  const _isAfternoon = isAfternoon(_moment)

  log('_today %s', _today)
  log('_tomorrow %s', _tomorrow)
  log('_isAfternoon %s', _isAfternoon)

  if (isWeekend(_today)) {
    return nextMonday(moment(_today))
  }

  if (isWeekend(_tomorrow) && _isAfternoon) {
    return nextMonday(moment(_tomorrow))
  }

  if (_isAfternoon) {
    return _tomorrow
  }

  return _today
}
