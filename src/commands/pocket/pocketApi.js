import debug from 'debug'
import Api from 'fetch-api'
import _ from 'lodash'
import queryString from 'query-string'
import session from '../../session'

const log = debug('pocketCommand:api')
const URL_POCKET = 'https://getpocket.com/v3/'
const HEADERS = {
  'X-Accept': 'application/json',
  'Content-Type': 'application/json; charset=UTF-8'
}
const URLS = {
  request: 'oauth/request',
  auth: 'oauth/authorize',
  get: 'get',
  authorize: 'https://getpocket.com/auth/authorize'
}

function host() {
  if (process.env.OPERATING_MODE === 'polling') {
    return 'http://localhost:' + process.env.PORT
  } else if (process.env.OPERATING_MODE === 'webhook') {
    return 'https://' + process.env.APP_NAME + '.herokuapp.com'
  }
}

function wrapHost (url) {
  return host() + url
}

export const REDIRECT_URI_AUTH = '/commands/pocket/auth'
export const REDIRECT_URI_REQUEST = '/command/pocket/request' // not used yet


export default class PocketApi extends Api {
  constructor(options = {}) {
    super(URL_POCKET, options)
  }

  init(ctx, consumer_key = null) {
    if (consumer_key === null) {
      consumer_key = process.env.POCKET_TOKEN
    }
    log('PocketApi with consumer_key %s', consumer_key)

    return this.getRequestToken(consumer_key)
      .then(({ data }) => {
        log('PocketApi retrieved request_token %s', data.code)
        ctx.session.request_token = data.code
      })
      .catch((error) => {
        log(error)
        this.logout(ctx.session)
      })
  }

  logout(session) {
    session.request_token = null
    session.access_token = null
  }

  buildAuthorizeUrl(ctx) {
    const { request_token } = ctx.session
    const url = URLS.authorize + '?' + queryString.stringify({
      request_token,
      redirect_uri: wrapHost(REDIRECT_URI_AUTH)
        + '?sessionId=' + session.options.getSessionKey(ctx)
        + '&chatId=' + ctx.chat.id
    })

    return this.buildFullUrl(url)
  }

  getRequestToken(consumer_key) {
    return this.postJSON(URLS.request, {
      consumer_key,
      redirect_uri: wrapHost(REDIRECT_URI_REQUEST)
    }, {
      headers: HEADERS
    })
  }

  getAccessToken(consumer_key, request_token) {
    return this.postJSON(URLS.auth, {
      consumer_key,
      code: request_token
    }, {
      headers: HEADERS
    })
  }

  getArticles(consumer_key, access_token, options) {
    return this.postJSON(URLS.get, {
      consumer_key,
      access_token,
      ...options
    }, {
      headers: HEADERS
    })
  }
}
