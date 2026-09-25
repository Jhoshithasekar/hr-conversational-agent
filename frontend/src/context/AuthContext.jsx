import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { getCurrentUser, login as loginUser } from '../api/authApi'

const AuthContext = createContext(null)

const STORAGE_KEY = 'hr_auth_token'

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      setError(null)
      return
    }

    let isCurrent = true

    getCurrentUser(token)
      .then((currentUser) => {
        if (!isCurrent) {
          return
        }

        setUser({
          ...currentUser,
          authenticationStatus: 'authenticated',
        })
        setError(null)
      })
      .catch(() => {
        if (!isCurrent) {
          return
        }

        setUser(null)
        setToken('')
        localStorage.removeItem(STORAGE_KEY)
        setError('Your session has expired. Please log in again.')
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [token])

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [token])

  const login = async (email, password) => {
    const response = await loginUser(email, password)

    const nextToken = response.access_token
    setToken(nextToken)
    setUser({
      employee_id: response.employee_id,
      name: response.name,
      email: response.email,
      role: response.role,
      authenticationStatus: 'authenticated',
    })
    setError(null)

    return response
  }

  const logout = () => {
    setToken('')
    setUser(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    setUser,
  }), [user, token, loading, error])

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
