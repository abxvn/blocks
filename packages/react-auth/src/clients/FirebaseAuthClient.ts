import EventEmitter from 'eventemitter3'
import AuthDrivers from '../AuthDrivers'
import IAuthClient from './IAuthClient'
import { is, forOwn, get, pick } from '../lib'

export interface FirebaseAuthProfile {
  uid: string
  _token: string
  email: string
  emailVerified: boolean
  phoneNumber: string
  name: string
  picture: string
  [field: string]: any
}

export interface FirebaseAuthClientOptions {
  auth: any
  onAuthStateChanged: (user: any) => void
  customClaimMap?: {[key: string]: string}
  boundToAuth0?: boolean
  getCustomToken?: (token: string) => Promise<string>
}

export default class FirebaseAuthClient extends EventEmitter implements IAuthClient {
  readonly driverId = AuthDrivers.FIREBASE_AUTH

  private readonly options: any
  private readonly client: any
  private hasSet = false
  private readonly onAuthStateChanged: FirebaseAuthClientOptions[onAuthStateChanged]

  constructor (options: FirebaseAuthClientOptions) {
    super()

    const { auth, onAuthStateChanged, ...otherOptions } = options

    this.options = Object.assign({
      boundToAuth0: true
    }, otherOptions)
    this.onAuthStateChanged = onAuthStateChanged
    if ([auth, onAuthStateChanged].some(e => e === undefined)) {
      throw TypeError('FirebaseAuthClient needs \'auth\' client and \'onAuthStateChanged\' callback')
    }

    this.client = auth
    this.on('logout', () => this.onLogout())
    this.on('login:token', token => {
      // Function handles errors internally and send to error event
      // eslint-disable-next-line no-void
      void this._loginWithCustomToken(token)
    })

    this.once('user:set', () => (this.hasSet = true))
    this.once('init', clients => {
      // Connect with Auth0
      if (this.options.boundToAuth0 !== true) {
        // not combining with Auth0
        return this._bindAuthenticationState()
      }

      if (!is('function', this.options, 'getCustomToken')) {
        throw TypeError('FirebaseAuthClient needs \'getCustomToken\' async function to process login with custom tokens')
      }

      if (typeof clients[AuthDrivers.AUTH0] === 'undefined') {
        throw Error('FirebaseAuthClient cannot find Auth0 client to combine with, anyway boundToAuth0 can be turned off using options')
      }

      // Use Auth0 as main authenticator
      // Firebase as sub-authenticator
      const auth0 = clients[AuthDrivers.AUTH0]

      // Tightly bound auth0 and firebase
      // So notify auth0 to logout when user logout
      this.once('user:unset', () => auth0.emit('logout'))

      // Sync auth state with auth0
      return auth0.on('user:load', (auth0User: any) => {
        const emailVerified = get(auth0User, 'emailVerified')

        if (emailVerified === true && typeof auth0User._token === 'string') {
          this._bindAuthenticationState()
          this.emit('login:token', auth0User._token)
        } else {
          this.onLogout()
        }
      })
    })
  }

  onLogout (): void {
    try {
      this.client.signOut()

      if (this.hasSet) {
        this.emit('user:unset')
      }
    } catch (err) {
      this.emit('error', err)
    }
  }

  async _loginWithCustomToken (token: string): Promise<void> {
    try {
      if (!is('function', this.options, 'getCustomToken')) {
        throw TypeError('FirebaseAuthClient needs \'getCustomToken\' async function to process login with custom tokens')
      }

      const customToken = await this.options.getCustomToken(token)

      this.client.signInWithCustomToken(customToken)
    } catch (err) {
      this.emit('error', err)
    }
  }

  private _bindAuthenticationState (): void {
    // Connect to firebase auth SDK
    this.onAuthStateChanged((user: any) => {
      if (user !== null && user !== undefined) {
        user.getIdTokenResult(true).then((result: any) => {
          const customClaims = get(result, 'claims', {})
          const customClaimMap = get(this.options, 'customClaimMap', {})

          const profile: FirebaseAuthProfile = pick(user, [
            'uid',
            'email',
            'emailVerified',
            'phoneNumber',
            'name'
          ]) as FirebaseAuthProfile

          profile._token = result.token
          profile.picture = get(user, 'photoURL')

          forOwn(customClaimMap, (fromProp, toProp) => {
            profile[toProp] = get(customClaims, fromProp)
          })

          this.emit('user:set', profile)
        }).catch((err: Error) => {
          this.emit('error', err)
        })
      } else if (this.hasSet) {
        this.emit('user:unset')
      }
    })
  }
}
