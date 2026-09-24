import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="auth-loading">Checking your session…</div>
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  return children
}

export default ProtectedRoute
