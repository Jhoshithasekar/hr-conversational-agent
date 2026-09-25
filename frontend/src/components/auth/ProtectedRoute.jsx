import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="auth-loading">Checking your session…</div>
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.role || '').toLowerCase()
    const isAllowed = allowedRoles.some((role) => {
      const target = role.toLowerCase()
      return userRole === target || (target === 'manager' && userRole.includes('manager'))
    })

    if (!isAllowed) {
      return <Navigate replace to="/employee" />
    }
  }

  return children
}

export default ProtectedRoute
