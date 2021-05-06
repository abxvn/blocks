import omit from 'lodash-es/omit'
import get from 'lodash-es/get'
import kindOf from 'kind-of'
import React, { FunctionComponent, useEffect, useState } from 'react'
import AuthContext from './AuthContext'
import Auth0Client, { Auth0ClientOptions } from './clients/Auth0Client'
import FirebaseAuthClient, { FirebaseAuthClientOptions } from './clients/FirebaseAuthClient'
import AuthDrivers from './AuthDrivers'

interface AuthProviderProps {
  withAuth0?: Auth0ClientOptions
  withFirebase?: FirebaseAuthClientOptions
  withProfile?: any
  onUserChange?: (driverId: AuthDrivers, user: any) => void
  onError?: (driverId: AuthDrivers, error: Error) => void
}

type ClientType = Auth0Client | FirebaseAuthClient
const clients: {[key in AuthDrivers]?: ClientType} = {}

const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  children,
  withAuth0,
  withFirebase,
  onUserChange,
  onError
}) => {
  const [auth, setAuth] = useState({})

  useEffect(() => {
    if (typeof window === 'undefined') {
      // We only support browser environment for now
      return
    }

    if (kindOf(withFirebase) === 'object' && withFirebase !== undefined) {
      clients[AuthDrivers.FIREBASE_AUTH] = new FirebaseAuthClient(withFirebase)
    }

    if (kindOf(withAuth0) === 'object' && withAuth0 !== undefined) {
      const auth0 = new Auth0Client(withAuth0)

      // Use Auth0 as main authenticator
      // Firebase as sub-authenticator
      if (typeof clients[AuthDrivers.FIREBASE_AUTH] !== 'undefined') {
        const firebase = clients[AuthDrivers.FIREBASE_AUTH] as FirebaseAuthClient

        auth0.on('user:set', user => {
          firebase?.emit('login:token', get(user, 'token'))
        })

        auth0.on('user:unset', () => firebase?.onLogout())
      }

      clients[AuthDrivers.AUTH0] = auth0
    }

    // BIND CALLBACKS INTO CREATED DRIVERS
    Object.values(clients).forEach(client => {
      if (client === undefined) {
        return
      }

      client.on('user:set', user => {
        onUserChange?.(client.driverId, user)
        setAuth({
          ...auth,
          [client.driverId]: user
        })
      })

      client.on('user:unset', user => {
        onUserChange?.(client.driverId, null)
        setAuth(omit(auth, client.driverId))
      })

      client.on('error', err => {
        onError?.(client.driverId, err)
      })
    })

    // TRIGGER SITE LOAD
    Object.values(clients).forEach(client => {
      client?.emit('site:load', window)
    })
  }, [])

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

export const trigger = (driver: AuthDrivers, event: string, params: any = undefined): void => {
  clients[driver]?.emit(event, params)
}

export const triggerAll = (event: string, params: any = undefined): void => {
  Object.values(clients).forEach(client => client?.emit(event, params))
}
