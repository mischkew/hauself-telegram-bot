import _ from 'lodash'

const PRE_SAYING_PROB = 0.4
const POST_SAYING_PROB = 0.4
const PRE_SAYINGS = [
  'And if Dobby does it wrong, Dobby will throw himself off the topmost tower, <%= first_name %>!',
  'Dobby is a free house-elf and he can obey anyone he likes and Dobby will do '
    + 'whatever Master <%= first_name %>  wants him to do!',
  'Yes, <%= first_name %>!'
]
const POST_SAYINGS = [
  'Dobby can only be freed if his masters present him with clothes, sir.',
  '<%= first_name %> <%= last_name %> mustn\'t be angry with Dobby. Dobby did it for the best - '
]

function shouldSayPreSaying() {
  return Math.random() > 1 - PRE_SAYING_PROB
}

function shouldSayPostSaying() {
  return Math.random() > 1 - POST_SAYING_PROB
}

function randomSaying(sayings) {
  return _.template(_.sample(sayings))
}

export default function * sayingsMiddleware(next) {
  if (shouldSayPreSaying()) {
    yield this.reply(randomSaying(PRE_SAYINGS)(this.message.from))
  }

  yield next

  if (shouldSayPostSaying()) {
    yield this.reply(randomSaying(POST_SAYINGS)(this.message.from))
  }
}
