import EventEmitter from 'eventemitter3'
import AuthDrivers from '../AuthDrivers'
import IAuthClient from './IAuthClient'
import { is, each, get, pick } from '../lib'

export interface FirebaseAuthProfile {
  uid: string
  _token: string
  [field: string]: any
}

export interface FirebaseAuthClientOptions {
  auth: any
  onAuthStateChanged: (user: any) => void
  customClaimMap?: {[key: string]: string}
  withAuth0?: boolean
  getCustomToken?: (token: string) => Promise<any>
  customTokenOutput?: string
}

export default class FirebaseAuthClient extends EventEmitter implements IAuthClient {
  readonly driverId = AuthDrivers.FIREBASE_AUTH

  private readonly options: any
  private readonly client: any

  constructor (options: FirebaseAuthClientOptions) {
    super()

    const { auth, onAuthStateChanged, ...otherOptions } = options

    this.options = Object.assign({
      withAuth0: true
    }, otherOptions)
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

    this.once('init', clients => {
      // Connect to firebase auth SDK
      onAuthStateChanged((user: any) => {
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

            each(customClaimMap, (fromProp, toProp) => {
              profile[toProp] = get(customClaims, fromProp)
            })

            this.emit('user:set', profile)
          }).catch((err: Error) => {
            this.emit('error', err)
          })
        } else {
          this.emit('user:unset')
        }
      })

      // Connect with Auth0
      if (this.options.withAuth0 !== true) {
        return // not combining with Auth0
      }

      if (!is('function', this.options, 'getCustomToken')) {
        throw TypeError('FirebaseAuthClient needs \'getCustomToken\' async function to process login with custom tokens')
      }

      if (typeof clients[AuthDrivers.AUTH0] === 'undefined') {
        throw Error('FirebaseAuthClient cannot find Auth0 client to combine with, anyway withAuth0 can be turned off using options')
      }

      // Use Auth0 as main authenticator
      // Firebase as sub-authenticator
      const auth0 = clients[AuthDrivers.AUTH0]

      auth0.on('user:set', (auth0User: any) => auth0User.emailVerified === true && this.emit('login:token', get(auth0User, '_token')))
      auth0.on('user:unset', () => this.onLogout())
    })
  }

  onLogout (): void {
    try {
      this.client.signOut()
      this.emit('user:unset')
    } catch (err) {
      this.emit('error', err)
    }
  }

  async _loginWithCustomToken (token: string): Promise<void> {
    try {
      const tokenOutputName = get(this.options, 'customTokenOutput', 'token')

      if (!is('function', this.options, 'getCustomToken')) {
        throw TypeError('FirebaseAuthClient needs \'getCustomToken\' async function to process login with custom tokens')
      }

      const { data, error } = await this.options.getCustomToken(token)

      if (error !== undefined) {
        throw Error(get(error, 'message', 'Unknown error'))
      }

      this.client.signInWithCustomToken(get(data, tokenOutputName))
    } catch (err) {
      this.emit('error', err)
    }
  }
}
