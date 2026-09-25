import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import AskHR from './pages/employee/AskHR'
import Dashboard from './pages/employee/Dashboard'
import MyRequests from './pages/employee/MyRequests'
import Policies from './pages/employee/Policies'
import ReportConcern from './pages/employee/ReportConcern'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerTeam from './pages/manager/ManagerTeam'
import ManagerRequests from './pages/manager/ManagerRequests'
import ManagerRequestDetail from './pages/manager/ManagerRequestDetail'
import HRDashboard from './pages/hr/HRDashboard'
import HRRequests from './pages/hr/HRRequests'
import HRKnowledgeBase from './pages/hr/HRKnowledgeBase'
import HRAnalytics from './pages/hr/HRAnalytics'
import HRAuditLog from './pages/hr/HRAuditLog'
import HRUsers from './pages/hr/HRUsers'
import ICCDashboard from './pages/icc/ICCDashboard'
import ICCCases from './pages/icc/ICCCases'
import ICCCaseDetail from './pages/icc/ICCCaseDetail'

import ErrorBoundary from './components/common/ErrorBoundary'
import { useAuth } from './context/AuthContext'
import { AUTH_STATUS, getDefaultWorkspaceRoute } from './utils/workspaceRouting'

function RootRoute() {
  const { authStatus, user } = useAuth()

  if (authStatus === AUTH_STATUS.INITIALIZING) {
    return (
      <div className="auth-page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-loading">Checking your session…</div>
      </div>
    )
  }

  if (authStatus === AUTH_STATUS.AUTHENTICATED && user) {
    return <Navigate replace to={getDefaultWorkspaceRoute(user.role)} />
  }

  return <Navigate replace to="/login" />
}

function App() {
  return (
    <Routes>
      <Route element={<Login />} path="/login" />

      {/* Employee Workspace */}
      <Route
        element={(
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
        path="/employee"
      >
        <Route index element={<Dashboard />} />
        <Route element={<AskHR />} path="ask-hr" />
        <Route element={<MyRequests />} path="requests" />
        <Route element={<Policies />} path="policies" />
        <Route element={<ReportConcern />} path="report-concern" />
      </Route>

      {/* Manager Workspace */}
      <Route
        element={(
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
        path="/manager"
      >
        <Route index element={<ManagerDashboard />} />
        <Route element={<ManagerTeam />} path="team" />
        <Route element={<ManagerRequests />} path="requests" />
        <Route element={<ManagerRequestDetail />} path="requests/:id" />
      </Route>

      {/* HR Workspace */}
      <Route
        element={(
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
        path="/hr"
      >
        <Route index element={<HRDashboard />} />
        <Route element={<HRRequests />} path="requests" />
        <Route element={<HRKnowledgeBase />} path="knowledge-base" />
        <Route element={<HRAnalytics />} path="analytics" />
        <Route element={<HRAuditLog />} path="audit-log" />
        <Route element={<HRUsers />} path="users" />
      </Route>

      {/* ICC Workspace */}
      <Route
        element={(
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
        path="/icc"
      >
        <Route index element={<ICCDashboard />} />
        <Route element={<ICCCases />} path="cases" />
        <Route element={<ICCCaseDetail />} path="cases/:id" />
      </Route>

      <Route element={<RootRoute />} path="/" />
      <Route element={<RootRoute />} path="*" />
    </Routes>
  )
}

export default App
