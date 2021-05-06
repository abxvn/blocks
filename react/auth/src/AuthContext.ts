import { createContext, useContext } from 'react'

const AuthContext = createContext({})

AuthContext.displayName = 'ReactAuthContext'

export default AuthContext
export const useAuth = (): any => useContext(AuthContext)
