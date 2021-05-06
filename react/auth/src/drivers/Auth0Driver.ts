import EventEmitter from 'eventemitter3'
import kindOf from 'kind-of'
import { AuthorizeOptions, WebAuth } from 'auth0-js'
import get from 'lodash-es/get'
import pick from 'lodash-es/pick'
import AuthDrivers from '../AuthDrivers'
import IAuthDriver from './IAuthDriver'

export interface Auth0Result {
  token: string
  profile: any
  expiresAt: number
}

export interface Auth0Profile {
  email: string
  name: string
  picture: string
  verified: boolean
  token: string
  tokenExpiresAt: number
}

export interface Auth0DriverOptions {
  domain: string
  clientId: string
  redirectUri: string
  responseType?: string
  scope?: string
}

export default class Auth0Driver extends EventEmitter implements IAuthDriver {
  static readonly SSO_DELAY = 20 * 60 * 1000 // 20min

  readonly driverId = AuthDrivers.AUTH0

  private readonly options: Auth0DriverOptions
  private readonly client: WebAuth
  private ssoInterval: any = null

  constructor (options: Auth0DriverOptions) {
    super()

    this.options = Object.assign({
      responseType: 'token id_token',
      scope: 'openid profile email'
    }, options) as Auth0DriverOptions

    if (['domain', 'clientId', 'redirectUri'].some(
      configKey => kindOf(get(this.options, configKey)) !== 'string'
    )) {
      throw TypeError("Auth0Driver requires 'domain', 'clientId' and 'redirectUri'")
    }

    this.client = new WebAuth(Object.assign({}, this.options, {
      clientID: this.options.clientId
    }))

    this.on('site:load', window => this.onSiteLoad(window))

    this.on('logout', () => this.onLogout())
    this.on('login', () => this.onLogin())
    this.on('signup', () => this.onLogin({
      screen_hint: 'signup'
    }))
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
        }, Auth0Driver.SSO_DELAY)
      }
    } catch (err) {
      if (!isFirstCall) {
        this.emit('user:unset')
        this.onLogout()
      } else {
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

    const token = get(result, 'token')
    const tokenExpiresAt = get(result, 'expiresAt')
    const verified = get(result.profile, 'email_verified', 'verified')

    return Object.assign({
      token,
      tokenExpiresAt,
      verified
    }, profile)
  }

  private _reportError (err: any): void {
    if (err instanceof Error) {
      this.emit('error', err)
    } else {
      // auth0 has special error format (object)
      const message = get(err, 'error', get(err, 'errorDescription', 'unknown')).replace(/_/g, ' ')

      this.emit('error', Error(message))
    }
  }
}
