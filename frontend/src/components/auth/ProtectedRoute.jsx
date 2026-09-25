import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import {
  AUTH_STATUS,
  getDefaultWorkspaceRoute,
  isPathAllowedForRole,
} from '../../utils/workspaceRouting'

export { getDefaultWorkspaceRoute }

function ProtectedRoute({ children }) {
  const { authStatus, user } = useAuth()
  const location = useLocation()

  if (authStatus === AUTH_STATUS.INITIALIZING) {
    return (
      <div className="auth-page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-loading">Checking your session…</div>
      </div>
    )
  }

  if (authStatus === AUTH_STATUS.UNAUTHENTICATED) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  // Authorized role check
  if (!isPathAllowedForRole(location.pathname, user?.role)) {
    return <Navigate replace to={getDefaultWorkspaceRoute(user?.role)} />
  }

  return children
}

export default ProtectedRoute

