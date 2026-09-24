import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { fetchEmployee } from '../../api/employeeApi'
import { useAuth } from '../../context/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'

const pageDetails = {
  '/employee': {
    title: 'Good morning',
    description: 'Here is a clear view of your HR workspace for today.',
  },
  '/employee/ask-hr': {
    title: 'Ask HR',
    description: 'Get quick guidance on policies, processes, and workplace questions.',
  },
  '/employee/requests': {
    title: 'My Requests',
    description: 'Review your leave, workplace, and expense request history.',
  },
  '/employee/policies': {
    title: 'Policies',
    description: 'Find current company policies and workplace guidance.',
  },
  '/employee/report-concern': {
    title: 'Report a Concern',
    description: 'Use this confidential channel to share a workplace concern.',
  },
}

function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  const employeeId = user?.employee_id
  const [employee, setEmployee] = useState(null)
  const [employeeState, setEmployeeState] = useState({
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!employeeId) {
      setEmployee(null)
      setEmployeeState({ loading: false, error: null })
      return
    }

    let isCurrent = true

    fetchEmployee(employeeId)
      .then((employeeData) => {
        if (isCurrent) {
          setEmployee(employeeData)
          setEmployeeState({ loading: false, error: null })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setEmployeeState({
            loading: false,
            error: error.message || 'Unable to load employee profile.',
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  const details = pageDetails[location.pathname] ?? pageDetails['/employee']
  const title = location.pathname === '/employee' && employee
    ? `Good morning, ${employee.name}`
    : details.title
  const sidebarEmployee = employee || {
    name: 'Employee',
    designation: employeeState.loading ? 'Loading profile...' : 'Profile unavailable',
    initials: '--',
  }

  return (
    <div className="app-shell">
      <Sidebar employee={sidebarEmployee} />
      <main className="main-content">
        <Header description={details.description} title={title} />
        <Outlet context={{ employee, employeeState }} />
      </main>
    </div>
  )
}

export default Layout
