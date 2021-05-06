import EventEmitter from 'eventemitter3'
import AuthDrivers from '../AuthDrivers'
import IAuthClient from './IAuthClient'
import get from 'lodash-es/get'

export interface FirebaseAuthClientOptions {
  firebase: any
  firebaseAuth: any
  onAuthStateChanged: (user: any) => void
}

export default class FirebaseAuthClient extends EventEmitter implements IAuthClient {
  readonly driverId = AuthDrivers.FIREBASE_AUTH
  private readonly firebase: any
  private readonly client: any

  constructor (options: FirebaseAuthClientOptions) {
    super()

    const { firebase, firebaseAuth, onAuthStateChanged } = options

    if ([firebase, firebaseAuth, onAuthStateChanged].some(e => e === undefined)) {
      throw TypeError("FirebaseAuthClient requires 'firebase', 'firebaseAuth' client and 'onAuthStateChanged' callback")
    }

    this.firebase = firebase
    this.client = firebaseAuth
    this.on('logout', () => this.onLogout())
    this.on('login:token', token => {
      // Function handles errors internally and send to error event
      // eslint-disable-next-line no-void
      void this._loginWithCustomToken(token)
    })

    onAuthStateChanged((user: any) => {
      if (user !== null && user !== undefined) {
        user.getIdTokenResult(true).then((result: any) => {
          const profile = {
            id: user.uid,
            token: result.token,
            // TODO: Add mapping for custom claims options
            groups: get(result, 'claims.g', [])
          }

          this.emit('user:set', profile)
        }).catch((err: Error) => {
          this.emit('error', err)
        })
      } else {
        this.emit('user:unset')
      }
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
      const exchangeToken = this.firebase.functions().httpsCallable('auth')
      const { data } = await exchangeToken({ t: token })

      if (data.error === true) {
        throw Error(data.message)
      }

      this.client.signInWithCustomToken(data.ct)
    } catch (err) {
      this.emit('error', err)
    }
  }
}
