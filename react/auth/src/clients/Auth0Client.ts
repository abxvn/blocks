import createAuth0Client, { Auth0Client as Auth0SpaClient, RedirectLoginOptions } from '@auth0/auth0-spa-js'

import { get, EventEmitter, pick, is } from '../lib'
import AuthDrivers from '../AuthDrivers'
import IAuthClient from './IAuthClient'

export interface Auth0Result {
  token: string
  claims: any
  expiresAt: number
}

export interface Auth0Profile {
  _token: string
  _tokenExpiresAt: number
  uid: string
  email: string
  emailVerified: boolean
  name: string
  picture: string
}

export interface Auth0ClientOptions {
  domain: string
  clientId: string
  loginRedirectUri: string,
  logoutRedirectUri: string,
  responseType?: string
  scope?: string,
  useRefreshTokens?: boolean,
  ssoCheckInterval?: number
}

export default class Auth0Client extends EventEmitter implements IAuthClient {
  static readonly POSSIBLE_SSO_LOGOUT = 'POSSIBLE_SSO_LOGOUT'
  static readonly DEFAULT_SSO_INTERVAL = 10 * 60 * 1000 // 10min if queue interval isn't greater than 0

  readonly driverId = AuthDrivers.AUTH0

  private readonly options: Auth0ClientOptions
  private client: Auth0SpaClient | undefined = undefined
  private ssoCheckTimer: any = null
  private hasSet: boolean = false
  private _profile: any = null // cached profile

  constructor (options: Auth0ClientOptions) {
    super()

    this.options = Object.assign({
      responseType: 'token id_token',
      scope: 'openid profile email',
      useRefreshTokens: true
    }, options) as Auth0ClientOptions

    if (['domain', 'clientId', 'loginRedirectUri', 'logoutRedirectUri'].some(
      configKey => !is('string', this.options, configKey)
    )) {
      throw TypeError("Auth0Client requires 'domain', 'clientId', 'loginRedirectUri' and 'logoutRedirectUri'")
    }

    this.on('logout', () => this.onLogout())
    this.on('login', () => this.onLogin())
    this.on('signup', () => this.onLogin({ screen_hint: 'signup' }))

    // Function handles errors internally
    this.once('init', () => void this._getClient()) // eslint-disable-line no-void
    // Function handles errors internally
    this.once('site:load', window => {
      void this._getClient() // eslint-disable-line no-void
        .then(() => this._onSiteLoad(window))
    })
  }

  _onSiteLoad (window: any): void {
    const { pathname, href, origin } = get(window, 'location', {})

    if (
      pathname !== undefined &&
      this.options.loginRedirectUri.replace(/\/$/, '') === `${origin as string}${pathname as string}`.replace(/\/$/, '')
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
        returnTo: this.options.logoutRedirectUri,
        client_id: this.options.clientId
      })

      // Softly notify about on-going logout process
      // instead of remove user in state immediately
      this.emit('user:load', null)
    } catch (err) {
      this._reportError(err)
    }
  }

  private _queueSilentSSO (delay: number): void {
    this.ssoCheckTimer = setTimeout(() => {
      clearTimeout(this.ssoCheckTimer)
      // Function handles errors internally
      // eslint-disable-next-line no-void
      void this._handleSilentSSO()
    }, delay > 0 ? delay : Auth0Client.DEFAULT_SSO_INTERVAL)
  }

  private async _handleSilentSSO (): Promise<void> {
    try {
      if (this.client === undefined) {
        throw Error('Client has not been setup yet')
      }

      if (!this.hasSet) {
        await this.client.getTokenSilently()
      } else {
        await this.client.checkSession()
      }

      const claims = await this.client.getIdTokenClaims()
      const token: string = get(claims, '__raw') ?? ''
      const expiresAt = get(claims, 'exp', 0)
      const profile = this._getProfile({ token, claims, expiresAt })

      if (token === '') {
        const err = Error('No token found')
        err.name = Auth0Client.POSSIBLE_SSO_LOGOUT

        throw err
      }

      this.setProfile(profile)
      this._queueSilentSSO(this.options.ssoCheckInterval ?? Math.floor(expiresAt - Date.now() / 1000) * 1000)
    } catch (err) {
      if (this.hasSet) {
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
        if (this.client === undefined) {
          throw Error('Client has not been setup yet')
        }

        await this.client.handleRedirectCallback(url)
        const claims = await this.client.getIdTokenClaims()
        const token: string = get(claims, '__raw') ?? ''
        const expiresAt = get(claims, 'exp', 0)

        if (token === '') {
          throw Error('No token found')
        }

        const profile = this._getProfile({ token, claims, expiresAt })

        this.setProfile(profile)
        this._queueSilentSSO(this.options.ssoCheckInterval ?? Math.round(expiresAt - Date.now() / 1000) * 1000)
      } else {
        this.onLogin()
      }
    } catch (err) {
      this._reportError(err)
    }
  }

  private _getProfile (result: Auth0Result): Auth0Profile {
    const profile = pick(result.claims, [
      'email',
      'name',
      'picture'
    ])

    if (profile.name === profile.email) {
      // User hasn't set custom name
      profile.name = get(result.claims, 'nickname', profile.name)
    }

    const _token = get(result, 'token')
    const _tokenExpiresAt = get(result, 'expiresAt')
    const uid = get(result.claims, 'sub', null)
    const emailVerified = get(result.claims, 'email_verified', false)

    return Object.assign({
      _token,
      _tokenExpiresAt,
      uid,
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
        redirect_uri: this.options.loginRedirectUri
      }))

      return this.client
    } catch (err) {
      this._reportError(err)

      return null
    }
  }

  private setProfile (profile: any): void {
    // Only update when uid is different
    if (get(this._profile, 'uid') !== get(profile, 'uid')) {
      this._profile = profile
      this.hasSet = true
      this.emit('user:set', this._profile)
    }
  }
}
