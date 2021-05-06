import omit from 'lodash-es/omit'
import get from 'lodash-es/get'
import kindOf from 'kind-of'
import React, { FunctionComponent, useEffect, useState } from 'react'
import AuthContext from './AuthContext'
import Auth0Driver, { Auth0DriverOptions } from './drivers/Auth0Driver'
import FirebaseAuthDriver, { FirebaseAuthDriverOptions } from './drivers/FirebaseAuthDriver'
import AuthDrivers from './AuthDrivers'

interface AuthProviderProps {
  withAuth0?: Auth0DriverOptions
  withFirebase?: FirebaseAuthDriverOptions
  withProfile?: any
  onUserChange?: (driverId: AuthDrivers, user: any) => void
  onError?: (driverId: AuthDrivers, error: Error) => void
}

type DriverType = Auth0Driver | FirebaseAuthDriver
const clients: {[key in AuthDrivers]?: DriverType} = {}

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
      clients[AuthDrivers.FIREBASE_AUTH] = new FirebaseAuthDriver(withFirebase)
    }

    if (kindOf(withAuth0) === 'object' && withAuth0 !== undefined) {
      const auth0 = new Auth0Driver(withAuth0)

      // Use Auth0 as main authenticator
      // Firebase as sub-authenticator
      if (typeof clients[AuthDrivers.FIREBASE_AUTH] !== 'undefined') {
        const firebase = clients[AuthDrivers.FIREBASE_AUTH] as FirebaseAuthDriver

        auth0.on('user:set', user => {
          firebase?.emit('login:token', get(user, 'token'))
        })

        auth0.on('user:unset', () => firebase?.onLogout())
      }

      clients[AuthDrivers.AUTH0] = auth0
    }

    // BIND CALLBACKS INTO CREATED DRIVERS
    Object.values(clients).forEach(driver => {
      if (driver === undefined) {
        return
      }

      driver.on('user:set', user => {
        onUserChange?.(driver.driverId, user)
        setAuth({
          ...auth,
          [driver.driverId]: user
        })
      })

      driver.on('user:unset', user => {
        onUserChange?.(driver.driverId, null)
        setAuth(omit(auth, driver.driverId))
      })

      driver.on('error', err => {
        onError?.(driver.driverId, err)
      })
    })

    // TRIGGER SITE LOAD
    Object.values(clients).forEach(driver => {
      driver?.emit('site:load', window)
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
  Object.values(clients).forEach(driver => driver?.emit(event, params))
}
