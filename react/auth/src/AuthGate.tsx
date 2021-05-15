import AuthContext from './AuthContext'
import React, { FunctionComponent, useContext, useEffect, useRef, useState } from 'react'
import AuthDrivers from './AuthDrivers'
import { clients } from './AuthProvider'
import FirebasePermissionsClient from './permissions/FirebasePermissionsClient'

interface AuthGateProps {
  MaskComponent?: FunctionComponent
  should?: (permissions: FirebasePermissionsClient) => boolean
}
const AuthGate: FunctionComponent<AuthGateProps> = ({ children, should, MaskComponent }) => {
  const [isRendered, setIsRendered] = useState(false)
  const clientRef = useRef<FirebasePermissionsClient | null>(null)
  const { permissions: permissionsReady } = useContext<any>(AuthContext)

  useEffect(() => {
    if (permissionsReady === true) {
      clientRef.current = clients[AuthDrivers.FIREBASE_PERMISSIONS] as unknown as FirebasePermissionsClient

      setIsRendered(Boolean(should?.(clientRef.current)))
    } else {
      clientRef.current = null
      setIsRendered(false)
    }
  }, [permissionsReady])

  return (
    <>
      {isRendered
        ? children
        : MaskComponent !== undefined ? <MaskComponent /> : null}
    </>
  )
}

export default AuthGate
