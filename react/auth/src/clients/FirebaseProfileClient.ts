import { get, EventEmitter } from '../lib'

import AuthDrivers from '../AuthDrivers'
import FirebaseAuthClient, { FirebaseAuthProfile } from './FirebaseAuthClient'
import IAuthClient from './IAuthClient'

export interface FirebaseProfileClientOptions {
  getQuery: (conditions: any) => any
  getSnapshot: (query: any, onChange: Function, onError: Function) => any
  userIdField?: string
  criteria?: any
}

export default class FirebaseProfileClient extends EventEmitter implements IAuthClient {
  readonly driverId = AuthDrivers.FIREBASE_PROFILE

  private readonly getQuery: Function
  private readonly getSnapshot: Function
  private readonly options: any
  private unsubscribe: Function | undefined
  private hasSet: boolean = false

  constructor (options: FirebaseProfileClientOptions) {
    super()

    const { getSnapshot, getQuery, ...otherOptions } = options

    if (getSnapshot === undefined || getQuery === undefined) {
      throw TypeError("FirebaseProfileClient requires profiles 'getQuery' and 'getSnapshot' functions")
    }

    this.getSnapshot = getSnapshot
    this.getQuery = getQuery
    this.options = otherOptions

    this.once('user:set', () => (this.hasSet = true))
    this.once('init', clients => {
      if (typeof clients[AuthDrivers.FIREBASE_AUTH] === 'undefined') {
        throw TypeError(
          'FirebaseProfileClient requires firebaseAuth client'
        )
      }

      const firebaseAuth: FirebaseAuthClient = clients[AuthDrivers.FIREBASE_AUTH]

      firebaseAuth.on('user:unset', () => this.onLogout())
      firebaseAuth.on('user:set', user => this._getProfile(user))
    })
  }

  onLogout (): void {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe()
    }

    if (this.hasSet) {
      this.emit('user:unset')
    }
  }

  private _getProfile (user: FirebaseAuthProfile): void {
    const userIdField = get(this.options, 'userIdField', 'uid')
    const conditions = Object.assign({
      [userIdField]: user.uid
    }, get(this.options, 'criteria'))

    const query = this.getQuery(conditions)

    this.unsubscribe = this.getSnapshot(
      query,
      (snapshot: any) => {
        if (snapshot.empty === true) {
          this.emit('user:unset')
        } else {
          this.emit('user:set', snapshot.docs[0].data())
        }
      },
      (err: Error) => {
        this.emit('error', err)
      })
  }
}
