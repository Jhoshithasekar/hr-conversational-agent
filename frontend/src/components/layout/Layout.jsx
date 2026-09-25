import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { fetchEmployee } from '../../api/employeeApi'
import { useAuth } from '../../context/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'

const pageDetails = {
  '/employee': {
    eyebrow: 'Employee workspace',
    title: 'Dashboard',
    description: 'Here is a clear view of your HR workspace for today.',
  },
  '/employee/ask-hr': {
    eyebrow: 'Employee workspace',
    title: 'Ask HR',
    description: 'Get quick guidance on policies, processes, and workplace questions.',
  },
  '/employee/requests': {
    eyebrow: 'Employee workspace',
    title: 'My Requests',
    description: 'Review your leave, workplace, and expense request history.',
  },
  '/employee/policies': {
    eyebrow: 'Employee workspace',
    title: 'Policies',
    description: 'Find current company policies and workplace guidance.',
  },
  '/employee/report-concern': {
    eyebrow: 'Employee workspace',
    title: 'Report a Concern',
    description: 'Use this confidential channel to share a workplace concern.',
  },
  '/manager': {
    eyebrow: 'Manager workspace',
    title: 'Manager Dashboard',
    description: 'Direct reports overview, pending approvals, and team activity.',
  },
  '/manager/team': {
    eyebrow: 'Manager workspace',
    title: 'My Team',
    description: 'Direct reports overview, leave availability, and request status.',
  },
  '/manager/requests': {
    eyebrow: 'Manager workspace',
    title: 'Team Requests',
    description: 'Review and manage time off and work arrangements for your team.',
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

  let details = pageDetails[location.pathname]
  if (!details) {
    if (location.pathname.startsWith('/manager/requests/')) {
      details = {
        eyebrow: 'Manager workspace',
        title: 'Request Details',
        description: 'Review employee request information, balance, and take action.',
      }
    } else if (location.pathname.startsWith('/manager')) {
      details = pageDetails['/manager']
    } else {
      details = pageDetails['/employee']
    }
  }

  const getGreeting = () => {
    const currentHour = new Date().getHours()

    if (currentHour >= 5 && currentHour < 12) return 'Good morning'
    if (currentHour >= 12 && currentHour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const greeting = getGreeting()
  const isManagerWorkspace = location.pathname.startsWith('/manager')
  const isEmployeeDashboard = location.pathname === '/employee'

  const title = isEmployeeDashboard && employee
    ? `${greeting}, ${employee.name}`
    : details.title

  const sidebarEmployee = employee || {
    name: user?.name || 'Employee',
    designation: employeeState.loading ? 'Loading profile...' : (user?.role || 'Profile unavailable'),
    initials: user?.name
      ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : '--',
  }

  return (
    <div className="app-shell">
      <Sidebar employee={sidebarEmployee} />
      <main className="main-content">
        <Header
          description={details.description}
          eyebrow={details.eyebrow || (isManagerWorkspace ? 'Manager workspace' : 'Employee workspace')}
          title={title}
        />
        <Outlet context={{ employee, employeeState }} />
      </main>
    </div>
  )
}

export default Layout
