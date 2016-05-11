import fetch from 'isomorphic-fetch'


function tryRejectWithJson(response) {
  return response.json()
    .then(json => Promise.reject(({response, json})))
    .catch(error => Promise.reject(({response, error})))
}

function tryResolveWithJson(response) {
  // do not try to parse body if there is no content
  if (response.status !== 204) {
    return response.json()
      .then(json => ({response, json}))
      .catch(error => ({response, error}))
  }

  // else resolve without json
  return {response, json: {}}
}

export function checkStatus(response) {
  if (process.env.NODE_ENV === 'development') {
    console.info('fetch response status', response)
  }

  if (!response.ok) {
    return tryRejectWithJson(response)
  }

  return tryResolveWithJson(response)
}

function logParseError({response, error = null, json = {}}) {
  if (!error) {
    return {response, json}
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('json parse error', error)
  }

  return {response, json}
}


let configuredOptions = {
  apiRoot: '',
  fetch: {}
}

export default class Api {
  constructor(options = {
    apiUrl: '',
    fetch: {}
  }) {
    this.constructorOptions = options

    this.API_ROOT = configuredOptions.apiRoot + options.apiUrl
    this.options = {...configuredOptions.fetch, ...options.fetch}
  }

  static config(options) {
    configuredOptions = {...configuredOptions, ...options}
  }

  buildFullUrl(url) {
    return (/$(http:\/\/|www)/.test(url)) ? url : this.API_ROOT + url
  }

  auth(token) {
    if (token === null) {
      throw new Error('AuthToken is null. Authorized API calls cannot be send.')
    }

    const authHeaders = {
      'Authorization': `Token ${token}`
    }
    const mergedHeaders = {...this.options.headers, ...authHeaders}
    const mergedFetch = {
      ...this.constructorOptions.fetch,
      headers: mergedHeaders,
      mode: 'cors'
    }

    return new Api({
      apiUrl: this.constructorOptions.apiUrl,
      fetch: mergedFetch
    })
  }

  fetch(url, options) {
    const mergedHeaders = {...this.options.headers || {}, ...options.headers || {}}
    const mergedOptions = {...this.options, ...options, headers: mergedHeaders}
    const fullUrl = this.buildFullUrl(url)

    if (process.env.NODE_ENV === 'development') {
      console.group('fetch on %s', fullUrl)
      console.debug('fetch Options', mergedOptions)
      console.groupEnd()
    }

    return fetch(fullUrl, mergedOptions)
      .then(checkStatus)
      .then(logParseError)
  }

  get(url, options) {
    return this.fetch(url, {...options, method: 'get'})
  }

  post(url, options) {
    return this.fetch(url, {...options, method: 'post'})
  }

  put(url, options) {
    return this.fetch(url, {...options, method: 'put'})
  }
}
