import EventEmitter from 'eventemitter3'
import AuthDrivers from '../AuthDrivers'
import IAuthClient from './IAuthClient'
import get from 'lodash-es/get'
import each from 'lodash-es/each'

export interface FirebaseAuthProfile {
  id: string
  token: string
  [field: string]: any
}

export interface FirebaseAuthClientOptions {
  auth: any
  onAuthStateChanged: (user: any) => void
  customClaimMap?: {[key: string]: string}
  functions?: any
  customTokenEndpoint?: string
  customTokenMap?: {[key: string]: string}
}

export default class FirebaseAuthClient extends EventEmitter implements IAuthClient {
  readonly driverId = AuthDrivers.FIREBASE_AUTH

  private readonly options: any
  private readonly functions: any
  private readonly client: any

  constructor (options: FirebaseAuthClientOptions) {
    super()

    const { auth, onAuthStateChanged, functions, ...otherOptions } = options

    this.options = otherOptions
    if ([auth, onAuthStateChanged].some(e => e === undefined)) {
      throw TypeError("FirebaseAuthClient requires 'auth' client and 'onAuthStateChanged' callback")
    }

    this.functions = functions
    this.client = auth
    this.on('logout', () => this.onLogout())
    this.on('login:token', token => {
      // Function handles errors internally and send to error event
      // eslint-disable-next-line no-void
      void this._loginWithCustomToken(token)
    })

    this.once('init', () => {
      // Connect to firebase auth SDK
      onAuthStateChanged((user: any) => {
        if (user !== null && user !== undefined) {
          user.getIdTokenResult(true).then((result: any) => {
            const customClaims = get(result, 'claims', {})
            const customClaimMap = get(this.options, 'customClaimMap', {})

            const profile: FirebaseAuthProfile = {
              id: user.uid,
              token: result.token
            }

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
      if (typeof this.functions === 'undefined') {
        throw Error("FirebaseAuthClient requires 'functions' client to login with custom token")
      }

      const tokenInputName = get(this.options, 'customTokenMap.inputName', 't')
      const tokenOutputName = get(this.options, 'customTokenMap.c', 'ct')

      const exchangeToken = this.functions.httpsCallable(get(this.options, 'customTokenEndpoint', 'auth'))
      const { data } = await exchangeToken({ [tokenInputName]: token })

      if (data.error === true) {
        throw Error(data.message)
      }

      this.client.signInWithCustomToken(get(data, tokenOutputName))
    } catch (err) {
      this.emit('error', err)
    }
  }
}
