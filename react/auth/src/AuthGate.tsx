import AuthContext from './AuthContext'
import React, { FunctionComponent, useContext, useEffect, useState } from 'react'
import AuthDrivers from './AuthDrivers'
import { clients } from './AuthProvider'
import FirebasePermissionsClient from './permissions/FirebasePermissionsClient'
import { is } from './lib'

interface AuthGateProps {
  /**
   * Component to render in case of conditions unmet
   */
  FallbackComponent?: FunctionComponent

  /**
   * Component to render initially
   */
  MaskComponent?: FunctionComponent

  /**
   * Optionally check UI access using permissions
   *
   * @param {FirebasePermissionsClient} $permissions a client with useful methods for checking permissions
   *  like canGet, canList, canUpdate ...
   * @return {boolean}
   */
  withPermissions?: (permissions: FirebasePermissionsClient) => boolean
}

const AuthGate: FunctionComponent<AuthGateProps> = ({ children, withPermissions, FallbackComponent, MaskComponent }) => {
  const { permissions: permissionsReady, auth0, firebase } = useContext<any>(AuthContext)
  const isAuthenticated: boolean = is('object', auth0) || is('object', firebase)
  const [isRendered, setIsRendered] = useState(isAuthenticated)
  const [isTriggered, setIsTriggered] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof withPermissions !== 'function') {
      setIsRendered(isAuthenticated)

      return
    }

    let isAuthorized = false

    if (permissionsReady === true) {
      const permissionsClient = clients[AuthDrivers.FIREBASE_PERMISSIONS] as unknown as FirebasePermissionsClient

      isAuthorized = Boolean(withPermissions(permissionsClient))
    }

    setIsRendered(isAuthenticated && isAuthorized)
  }, [
    isAuthenticated,
    permissionsReady
  ])

  useEffect(() => {
    // May avoid init render of FallbackComponent
    setIsTriggered(isTriggered => isTriggered !== null)
  }, [isRendered])

  return (
    <>
      {isTriggered !== true && (MaskComponent !== undefined)
        ? <MaskComponent />
        : isRendered
          ? children
          : FallbackComponent !== undefined ? <FallbackComponent /> : null}
    </>
  )
}

export default AuthGate
