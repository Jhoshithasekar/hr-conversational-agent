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

function App() {
  return (
    <Routes>
      <Route element={<Login />} path="/login" />

      {/* Employee Workspace */}
      <Route
        element={(
          <ProtectedRoute>
            <Layout />
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
          <ProtectedRoute allowedRoles={['Manager', 'HR']}>
            <Layout />
          </ProtectedRoute>
        )}
        path="/manager"
      >
        <Route index element={<ManagerDashboard />} />
        <Route element={<ManagerTeam />} path="team" />
        <Route element={<ManagerRequests />} path="requests" />
        <Route element={<ManagerRequestDetail />} path="requests/:id" />
      </Route>

      <Route element={<Navigate replace to="/login" />} path="/" />
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}

export default App
