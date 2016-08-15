import { bold } from './markdown'
import _ from 'lodash'

const SAYING_PROB = 0.4
const ERROR_SAYINGS = [
  'I am so deeply sorry Master <%= first_name %>, something went wrong. Dobby will fix it, yes he will!'
]

function shouldSaySaying() {
  return Math.random() > 1 - SAYING_PROB
}

function randomErrorSaying(sayings) {
  return _.template(_.sample(sayings))
}

export function errorSaying(ctx) {
  if (shouldSaySaying()) {
    ctx.reply(randomErrorSaying(ERROR_SAYINGS)(ctx.from))
  }
}

export function replyError(ctx, errorText) {
  errorSaying(ctx)
  ctx.replyWithMarkdown(bold(errorText))
}
