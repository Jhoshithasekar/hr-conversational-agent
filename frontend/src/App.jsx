





import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/layout/Layout'
import AskHR from './pages/employee/AskHR'
import Dashboard from './pages/employee/Dashboard'
import MyRequests from './pages/employee/MyRequests'
import Policies from './pages/employee/Policies'
import ReportConcern from './pages/employee/ReportConcern'

function App() {
  return (
    <Routes>
      <Route element={<Layout />} path="/employee">
        <Route index element={<Dashboard />} />
        <Route element={<AskHR />} path="ask-hr" />
        <Route element={<MyRequests />} path="requests" />
        <Route element={<Policies />} path="policies" />
        <Route element={<ReportConcern />} path="report-concern" />
      </Route>
      <Route element={<Navigate replace to="/employee" />} path="/" />
      <Route element={<Navigate replace to="/employee" />} path="*" />
    </Routes>
  )
}

export default App
