import createAuth0Client, { Auth0Client as Auth0SpaClient, RedirectLoginOptions } from '@auth0/auth0-spa-js'

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
  private client: Auth0SpaClient | undefined = undefined
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

    this.on('logout', () => this.onLogout())
    this.on('login', () => this.onLogin())
    this.on('signup', () => this.onLogin({ screen_hint: 'signup' }))

    // Function handles errors internally
    // eslint-disable-next-line no-void
    this.once('init', () => void this._getClient())
    this.once('site:load', window => {
      void this._getClient().then(() => this._onSiteLoad(window)) // eslint-disable-line no-void
    })
  }

  _onSiteLoad (window: any): void {
    const { pathname, href, origin } = get(window, 'location', {})

    if (
      pathname !== undefined &&
      this.options.redirectUri.replace(/\/$/, '') === `${origin as string}${pathname as string}`.replace(/\/$/, '')
    ) {
      // Function handles errors internally
      // eslint-disable-next-line no-void
      void this._handleCallback(href)
    } else {
      // Function handles errors internally
      // eslint-disable-next-line no-void
      void this._handleSilentSSO()
    }
  }

  onLogin (options?: RedirectLoginOptions): void {
    if (this.client === undefined) {
      throw Error('Client has not been setup yet')
    }

    this.client.loginWithRedirect(options)
      .catch(err => this._reportError(err))
  }

  onLogout (): void {
    try {
      this.client?.logout({
        returnTo: window.location.origin,
        client_id: this.options.clientId
      })

      // Softly notify about on-going logout process
      // instead of remove user in state immediately
      this.emit('user:load', null)
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

  private async _handleCallback (url: string | undefined): Promise<void> {
    try {
      if (url?.includes('?error=') === true) {
        this.onLogout()
      } else if (url?.includes('?code=') === true) {
        const result = await this._parseHash(url)

        this.emit('user:set', this._getProfile(result))
      } else {
        this.onLogin()
      }
    } catch (err) {
      this._reportError(err)
    }
  }

  private async _parseHash (url?: string): Promise<Auth0Result> {
    if (this.client === undefined) {
      throw Error('Client has not been setup yet')
    }

    await this.client.handleRedirectCallback(url)

    const result = await this.client.getIdTokenClaims()
    const token: string = get(result, '__raw') ?? ''

    if (token === '') {
      throw Error('No id token found')
    }

    const expiresAt = get(result, 'exp', 0)

    return {
      token,
      profile: result,
      expiresAt
    }
  }

  private async _checkSession (): Promise<Auth0Result> {
    if (this.client === undefined) {
      throw Error('Client has not been setup yet')
    }

    await this.client.getTokenSilently()

    const result = await this.client.getIdTokenClaims()
    const token: string = get(result, '__raw') ?? ''

    if (token === '') {
      throw Error('No id token found')
    }

    const expiresAt = get(result, 'exp', 0)

    return {
      token,
      profile: result,
      expiresAt
    }
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

  private _reportError (err: Error): void {
    const code = get(err, 'error')

    if (code !== 'login_required') {
      // ignore sso error of auth0
      this.emit('error', Error(err.message))
    }

    if (code === 'consent_required') {
      this.onLogout()
    }
  }

  private async _getClient (): Promise<Auth0SpaClient | null> {
    try {
      if (this.client !== undefined) {
        return this.client
      }

      this.client = await createAuth0Client(Object.assign({}, this.options, {
        client_id: this.options.clientId,
        redirect_uri: this.options.redirectUri,
        useRefreshTokens: true
      }))

      return this.client
    } catch (err) {
      this._reportError(err)

      return null
    }
  }
}
