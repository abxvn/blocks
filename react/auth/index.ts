import { useContext } from 'react'
import AuthContext from './src/AuthContext'

export const useAuth = (): any => useContext(AuthContext)
export { default as AuthGate } from './src/AuthGate'
export { default as AuthDrivers } from './src/AuthDrivers'
export { default as AuthProvider, trigger, triggerAll } from './src/AuthProvider'
export { IPermissions } from './src/permissions/permissionTypes'
