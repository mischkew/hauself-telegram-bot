import _ from 'lodash'

export function bold(value) {
  return `*${value}*`
}

export function italic(value) {
  return `_${value}_`
}

export function repeat(times, value) {
  return _.times(times, () => value).join('')
}

export function underline(value, character = '-') {
  return repeat(value.length, character)
}
