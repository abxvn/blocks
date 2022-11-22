import { EventEmitter, get, omit } from '../lib'

import AuthDrivers from '../AuthDrivers'
import FirebaseAuthClient, { FirebaseAuthProfile } from '../clients/FirebaseAuthClient'
import IAuthClient from '../clients/IAuthClient'
import type { CollectionRules, IFirebaseRuleResource, IFirebaseRuleAuth } from './permissionTypes'

export interface FirebasePermissionsClientOptions {
  permissions: {
    [key: string]: CollectionRules
  }
}

export default class FirebasePermissionsClient extends EventEmitter implements IAuthClient {
  readonly driverId = AuthDrivers.FIREBASE_PERMISSIONS
  private hasSet = false
  private auth?: IFirebaseRuleAuth

  constructor (readonly options: FirebasePermissionsClientOptions) {
    super()

    this.once('user:set', () => (this.hasSet = true))
    this.once('init', clients => {
      if (typeof clients[AuthDrivers.FIREBASE_AUTH] === 'undefined') {
        throw TypeError(
          'FirebaseProfileClient requires firebaseAuth client'
        )
      }

      const firebaseAuth: FirebaseAuthClient = clients[AuthDrivers.FIREBASE_AUTH]

      firebaseAuth.on('user:unset', () => {
        this.auth = undefined
        this.emit('user:unset')
      })
      firebaseAuth.on('user:set', user => {
        this.auth = {
          uid: user.uid,
          token: omit(user, [
            '_token',
            'uid',
            'picture'
          ]) as FirebaseAuthProfile
        }
        this.emit('user:set', true)
      })
    })
  }

  canList (object: string, query: any, resource?: IFirebaseRuleResource): boolean {
    return [
      get(this.options, `permissions.${object}.list`),
      get(this.options, `permissions.${object}.read`),
      get(this.options, 'permissions._all.read')
    ].filter(Boolean).some(fn => typeof fn === 'function' &&
      fn({ auth: this.auth, query }, resource) === true
    )
  }

  canGet (object: string, resource?: IFirebaseRuleResource): boolean {
    return [
      get(this.options, `permissions.${object}.get`),
      get(this.options, `permissions.${object}.read`),
      get(this.options, 'permissions._all.read')
    ].some(fn => typeof fn === 'function' &&
        fn({ auth: this.auth }, resource) === true
    )
  }

  canCreate (object: string, data: any): boolean {
    return [
      get(this.options, `permissions.${object}.create`),
      get(this.options, `permissions.${object}.write`),
      get(this.options, 'permissions._all.write')
    ].some(fn => typeof fn === 'function' &&
        fn({ auth: this.auth, resource: { data } }) === true
    )
  }

  canUpdate (object: string, data: any, resource?: IFirebaseRuleResource): boolean {
    return [
      get(this.options, `permissions.${object}.create`),
      get(this.options, `permissions.${object}.write`),
      get(this.options, 'permissions._all.write')
    ].some(fn => typeof fn === 'function' &&
        fn({ auth: this.auth, resource: { data } }, resource) === true
    )
  }

  canDelete (object: string, resource: IFirebaseRuleResource): boolean {
    return [
      get(this.options, `permissions.${object}.delete`),
      get(this.options, `permissions.${object}.write`),
      get(this.options, 'permissions._all.write')
    ].some(fn => typeof fn === 'function' &&
        fn({ auth: this.auth }, resource) === true
    )
  }
}
