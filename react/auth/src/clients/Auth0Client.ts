import { AuthorizeOptions, WebAuth } from 'auth0-js'

import { get, EventEmitter, pick, is } from '../lib'
import AuthDrivers from '../AuthDrivers'
import IAuthClient from './IAuthClient'

export interface Auth0Result {
  token: string
  profile: any
  expiresAt: number
}

export interface Auth0Profile {
  _token: string
  _tokenExpiresAt: number
  email: string
  emailVerified: boolean
  name: string
  picture: string
}

export interface Auth0ClientOptions {
  domain: string
  clientId: string
  redirectUri: string
  responseType?: string
  scope?: string
}

export default class Auth0Client extends EventEmitter implements IAuthClient {
  static readonly SSO_DELAY = 20 * 60 * 1000 // 20min

  readonly driverId = AuthDrivers.AUTH0

  private readonly options: Auth0ClientOptions
  private readonly client: WebAuth
  private ssoInterval: any = null

  constructor (options: Auth0ClientOptions) {
    super()

    this.options = Object.assign({
      responseType: 'token id_token',
      scope: 'openid profile email'
    }, options) as Auth0ClientOptions

    if (['domain', 'clientId', 'redirectUri'].some(
      configKey => !is('string', this.options, configKey)
    )) {
      throw TypeError("Auth0Client requires 'domain', 'clientId' and 'redirectUri'")
    }

    this.client = new WebAuth(Object.assign({}, this.options, {
      clientID: this.options.clientId
    }))

    this.on('logout', () => this.onLogout())
    this.on('login', () => this.onLogin())
    this.on('signup', () => this.onLogin({
      screen_hint: 'signup'
    }))

    this.once('site:load', window => this.onSiteLoad(window))
  }

  onSiteLoad (window: any): void {
    const { pathname, hash, origin } = get(window, 'location', {})

    if (
      pathname !== undefined &&
      this.options.redirectUri.replace(/\/$/, '') === `${origin as string}${pathname as string}`.replace(/\/$/, '')
    ) {
      // Function handles errors internally
      // eslint-disable-next-line no-void
      void this._handleCallback(hash)
    } else if (hash === '') {
      // Function handles errors internally
      // eslint-disable-next-line no-void
      void this._handleSilentSSO()
    }
  }

  onLogin (options?: AuthorizeOptions): void {
    try {
      this.client.authorize(options)
    } catch (err) {
      this._reportError(err)
    }
  }

  onLogout (): void {
    try {
      this.client.logout({
        returnTo: window.location.origin,
        clientID: this.options.clientId
      })
      this.emit('user:unset')
    } catch (err) {
      this._reportError(err)
    }
  }

  private async _handleSilentSSO (): Promise<void> {
    const isFirstCall = this.ssoInterval === null

    try {
      // Possibly restored from redux persist
      const result = await this._checkSession()

      this.emit('user:set', this._getProfile(result))

      if (isFirstCall) {
        this.ssoInterval = setInterval(() => {
          // Function handles errors internally
          // eslint-disable-next-line no-void
          void this._handleSilentSSO()
        }, Auth0Client.SSO_DELAY)
      }
    } catch (err) {
      if (!isFirstCall) {
        this.emit('user:unset')
        this.onLogout()
      } else {
        this.emit('user:load', null)
        this._reportError(err)
      }
    }
  }

  private async _handleCallback (hash: string | undefined): Promise<void> {
    try {
      if (hash?.includes('access_token=') === true) {
        const result = await this._parseHash()

        this.emit('user:set', this._getProfile(result))
      } else {
        this.onLogin()
      }
    } catch (err) {
      this._reportError(err)
    }
  }

  private async _parseHash (): Promise<Auth0Result> {
    return await new Promise((resolve, reject) => {
      this.client.parseHash((err, result) => {
        if (err != null) {
          return reject(err)
        }

        const token: string = get(result, 'idToken') ?? ''

        if (token === '') {
          return reject(Error('No id token found'))
        }

        const profile = get(result, 'idTokenPayload', {})
        const expiresAt = get(result, 'idTokenPayload.exp', 0) * 1000

        return resolve({
          token,
          profile,
          expiresAt
        })
      })
    })
  }

  private async _checkSession (): Promise<Auth0Result> {
    return await new Promise((resolve, reject) => {
      this.client.checkSession({}, (err, result) => {
        if (err != null) {
          return reject(err)
        }

        const token: string = get(result, 'idToken') ?? ''

        if (token === '') {
          return reject(Error('No id token found'))
        }

        const profile = get(result, 'idTokenPayload', {})
        const expiresAt = get(result, 'idTokenPayload.exp', 0) * 1000

        return resolve({
          token,
          profile,
          expiresAt
        })
      })
    })
  }

  private _getProfile (result: Auth0Result): Auth0Profile {
    const profile = pick(result.profile, [
      'email',
      'name',
      'picture'
    ])

    if (profile.name === profile.email) {
      // User hasn't set custom name
      profile.name = get(result.profile, 'nickname', profile.name)
    }

    const _token = get(result, 'token')
    const _tokenExpiresAt = get(result, 'expiresAt')
    const emailVerified = get(result.profile, 'email_verified', false)

    return Object.assign({
      _token,
      _tokenExpiresAt,
      emailVerified
    }, profile)
  }

  private _reportError (err: any): void {
    if (err instanceof Error) {
      this.emit('error', err)
    } else {
      // auth0 has special error format (object)
      const code = get(err, 'code')
      const message = get(err, 'error', get(err, 'errorDescription', 'unknown')).replace(/_/g, ' ')

      if (code !== 'login_required') {
        // ignore sso error of auth0
        this.emit('error', Error(message))
      }
    }
  }
}
