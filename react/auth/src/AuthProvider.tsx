import React, { FunctionComponent, useEffect, useState } from 'react'

import { each, is, omit } from './lib'
import AuthContext from './AuthContext'
import Auth0Client, { Auth0ClientOptions } from './clients/Auth0Client'
import FirebaseAuthClient, { FirebaseAuthClientOptions } from './clients/FirebaseAuthClient'
import AuthDrivers from './AuthDrivers'
import FirebaseProfileClient, { FirebaseProfileClientOptions } from './clients/FirebaseProfileClient'
import FirebasePermissionsClient from './permissions/FirebasePermissionsClient'

interface AuthProviderProps {
  withAuth0: Auth0ClientOptions
  withFirebaseAuth: FirebaseAuthClientOptions
  withFirebaseProfile: FirebaseProfileClientOptions
  withFirebasePermissions: any
  onUserChange: (driverId: AuthDrivers, user: any) => void
  onError: (driverId: AuthDrivers, error: Error) => void
}

type ClientType = Auth0Client | FirebaseAuthClient
export const clients: {[key in AuthDrivers]?: ClientType} = {}

const AuthProvider: FunctionComponent<Partial<AuthProviderProps>> = ({
  children,
  withAuth0,
  withFirebaseAuth,
  withFirebaseProfile,
  withFirebasePermissions,
  onUserChange,
  onError
}) => {
  const [auth, setAuth] = useState({})

  useEffect(() => {
    if (typeof window === 'undefined') {
      // We only support browser environment for now
      return
    }

    const configMap: {[key in AuthDrivers]: any} = {
      [AuthDrivers.AUTH0]: {
        config: withAuth0,
        Client: Auth0Client
      },
      [AuthDrivers.FIREBASE_AUTH]: {
        config: withFirebaseAuth,
        Client: FirebaseAuthClient
      },
      [AuthDrivers.FIREBASE_PROFILE]: {
        config: withFirebaseProfile,
        Client: FirebaseProfileClient
      },
      [AuthDrivers.FIREBASE_PERMISSIONS]: {
        config: withFirebasePermissions,
        Client: FirebasePermissionsClient
      }
    }

    // PREPARE CLIENTS
    each(configMap, ({ config, Client }, driverId) => {
      if (is('object', config)) {
        const client = new Client(config)

        // Bind events
        client.on('user:set', (user: any) => {
          onUserChange?.(client.driverId, user)
          setAuth((auth: any) => ({
            ...auth,
            [client.driverId]: user
          }))
        })

        client.on('user:unset', (user: any) => {
          onUserChange?.(client.driverId, null)
          setAuth((auth: any) => omit(auth, client.driverId))
        })

        client.on('error', (err: Error) => {
          onError?.(client.driverId, err)
        })

        clients[driverId as AuthDrivers] = client
      }
    })

    // INIT CLIENTS
    Object.values(clients).forEach(client => {
      client?.emit('init', clients)
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
