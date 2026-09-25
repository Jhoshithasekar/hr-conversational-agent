import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { getCurrentUser, login as loginUser } from '../api/authApi'
import { AUTH_STATUS } from '../utils/workspaceRouting'

const AuthContext = createContext(null)

const STORAGE_KEY = 'hr_auth_token'

export { AUTH_STATUS }

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY)))
  const [error, setError] = useState(null)

  // Validate session on initial application load
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY)
    if (!savedToken) {
      return
    }

    let isCurrent = true

    getCurrentUser(savedToken)
      .then((currentUser) => {
        if (!isCurrent) return
        setUser(currentUser)
        setError(null)
      })
      .catch((err) => {
        if (!isCurrent) return
        localStorage.removeItem(STORAGE_KEY)
        setToken('')
        setUser(null)
        setError(err.message || 'Your session has expired. Please log in again.')
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const login = async (email, password) => {
    const response = await loginUser(email, password)
    const nextToken = response.access_token

    // Synchronously write to localStorage before any component triggers API requests
    localStorage.setItem(STORAGE_KEY, nextToken)

    setToken(nextToken)
    setUser({
      employee_id: response.employee_id,
      name: response.name,
      email: response.email,
      role: response.role,
    })
    setLoading(false)
    setError(null)

    return response
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setUser(null)
    setError(null)
    setLoading(false)
  }

  const authStatus = loading
    ? AUTH_STATUS.INITIALIZING
    : user && token
    ? AUTH_STATUS.AUTHENTICATED
    : AUTH_STATUS.UNAUTHENTICATED

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    authStatus,
    isAuthenticated: authStatus === AUTH_STATUS.AUTHENTICATED,
    login,
    logout,
    setUser,
  }), [user, token, loading, error, authStatus])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export { AuthContext, AuthProvider, useAuth }
