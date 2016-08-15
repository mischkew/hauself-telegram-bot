import PocketApi, { REDIRECT_URI_AUTH } from './pocketApi'
import debug from 'debug'
import _ from 'lodash'
import { replyError } from '../../lib/error'
import { bold, italic } from '../../lib/markdown'
import redisSession from '../../session'

const log = debug('pocketCommand:command')
const api = new PocketApi()

function replyPocketError(ctx, error) {
  let message = ['Pocket Error:']

  if (error.response && error.response.headers.get('x-error')) {
    message.push(
      error.response.headers.get('x-error-code') +
        ' - ' +
        error.response.headers.get('x-error')
    )
  } else {
    message.push(error.message)
  }

  replyError(ctx, message.join(' '))
}

const ARTICLE_SAYINGS = [
  'Master, Dobby chose this nice article for you!',
  'Dobby thinks reading this will help you be smarter, Master <%= first_name %>'
]

function randomSaying(ctx) {
  return _.template(_.sample(ARTICLE_SAYINGS))(ctx.message.from)
}

function replyPocketArticle(ctx, article) {
  log('PocketApi showing random article:', article)

  // retrieve and derive data from article
  const { resolved_url, excerpt, word_count, resolved_title } = article

  let estimatedTime = null
  if (word_count && word_count > 0) {
    // avg. adult reads 300 words per minute
    // http://www.forbes.com/sites/brettnelson/2012/06/04/do-you-read-fast-enough-to-be-successful/#d3fc3d658f7e
    estimatedTime = Math.ceil(word_count / 300)
  }

  // compose a message object
  const message = [
    randomSaying(ctx) + '\n',
    bold(resolved_title)
  ]

  if (estimatedTime) {
    message.push(italic(`Estimated Reading Time: ${estimatedTime}min`))
  }

  if (excerpt) {
    message.push('\n' + excerpt)
  }

  message.push(`[${resolved_url}]`)

  // send message to user
  return ctx.replyWithMarkdown(message.join('\n'))
}

// show a message that the user is not logged in yet and provide a
// shortcut to the command that will provide that link. We do that to
// renew the context of the chat interaction
function hintAuthorization(ctxOrChatId, telegraf = null) {
  const message = 'Master! Please consider signing in to the [Pocket](getpocket.com)'
          + ' service first. Dobby shows you how.\n\n/pocketauth'

  if (typeof ctxOrChatId === 'object' &&
      typeof ctxOrChatId.replyWithMarkdown === 'function') {
    return ctxOrChatId.replyWithMarkdown(message)
  }

  if (telegraf === null) {
    throw new Error('Provide a telegraf instance!')
  }

  return telegraf.telegram.sendMessage(ctxOrChatId, message, {
    parse_mode: 'Markdown'
  })
}

// authorize the current user at the pocket service by providing a
// link for credentials
function provideAuthorizationLink(ctx) {
  if (ctx.session.access_token) {
    return ctx.reply(
      'You are successfully connected to Pocket, master.'
        + ' Dobby wants you to try the /pocket command!'
    )
  }

  return api.init(ctx, process.env.POCKET_TOKEN).then(() => {
    return ctx.reply([
      'You have not logged in to Pocket yet, master.'
        + ' Please follow the link below to do so.',
      api.buildAuthorizeUrl(ctx)
    ].join('\n'))
  })
}

//
// ## Telegraf Reply
//

export function replyRandomArticle(ctx) {
  console.log('random', ctx.session)
  return api.getArticles(
    process.env.POCKET_TOKEN,
    ctx.session.access_token,
    {
      detailType: 'simple',
      state: 'unread'
    }
  )
  .then(({ data }) => {
    return replyPocketArticle(ctx, _.sample(data.list))
  })
  .catch((error) => {
    console.log(error)

    if (error.response &&
        error.response.headers.get('x-error-code') === '107') {
      return hintAuthorization(ctx)
    }

    return replyPocketError(ctx, error)
  })
}

//
// ## Telegraf Hearing & Configuration
//

export function setupPocketAuthApi(telegraf, app) {
  // when user successfully authorized, this callback will be
  // triggered. we can than store the access token.
  app.get(REDIRECT_URI_AUTH, (req, res) => {
    const sessionId = req.query.sessionId
    const chatId = req.query.chatId

    // access the users session
    redisSession
      .getSession(sessionId)
      .then(({ session, saveSession }) => {
        log('Session for sessionId %s', sessionId, session)

        // renew authentication when there is no request token
        if (!session.request_token) {
          log('No request_token defined in session.')
          api.logout(session)

          res
            .status(500)
            .send('No request_token defined in session.')
          return hintAuthorization(chatId, telegraf)
        }

        // try to get an access toke
        api.getAccessToken(
          process.env.POCKET_TOKEN,
          session.request_token
        ).then(({ data }) => {
          session.access_token = data.access_token
          log('Updated Session with access_token', session)
          res.send('Successfully logged in. Return to Telegram.')

          return telegraf.telegram.sendMessage(
            chatId,
            'You have been successfully logged in, master.\n'
              + 'Try the /pocket command.'
          )
        }).catch((error) => {
          api.logout(session)
          res
            .status(500)
            .send(error)

          return hintAuthorization(chatId, telegraf)
        }).then(() => saveSession(session))
      })
  })
}

export function setupPocket(telegraf, ...middlewares) {
  telegraf.command('/pocket', ...middlewares, replyRandomArticle)
  telegraf.command('/pocketauth', provideAuthorizationLink)
}
