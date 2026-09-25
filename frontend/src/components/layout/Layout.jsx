import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { fetchEmployee } from '../../api/employeeApi'
import { useAuth } from '../../context/AuthContext'
import ErrorBoundary from '../common/ErrorBoundary'
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
  '/hr': {
    eyebrow: 'HR Workspace',
    title: 'HR Dashboard',
    description: 'Overview of HR requests, workforce operations, and active policies.',
  },
  '/hr/requests': {
    eyebrow: 'HR Workspace',
    title: 'Requests & Approvals',
    description: 'Review, evaluate, and manage employee leave and workplace arrangement requests.',
  },
  '/hr/knowledge-base': {
    eyebrow: 'HR Workspace',
    title: 'Knowledge Base',
    description: 'Manage corporate HR policy documentation, revisions, and compliance guidelines.',
  },
  '/hr/analytics': {
    eyebrow: 'HR Workspace',
    title: 'Analytics & Reports',
    description: 'Inquiry trends, resolution metrics, and employee knowledge gap insights.',
  },
  '/hr/audit-log': {
    eyebrow: 'HR Workspace',
    title: 'Audit Log',
    description: 'System-wide administrative activity trail and policy version changes.',
  },
  '/hr/users': {
    eyebrow: 'HR Workspace',
    title: 'Users & Roles',
    description: 'Workforce directory, organizational roles, and system permission governance.',
  },
  '/icc': {
    eyebrow: 'ICC Workspace',
    title: 'ICC Dashboard',
    description: 'Confidential Internal Complaints Committee case tracking and statutory compliance.',
  },
  '/icc/cases': {
    eyebrow: 'ICC Workspace',
    title: 'ICC Cases',
    description: 'Manage confidential inquiry proceedings, hearings, and statutory reports.',
  },
}

function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  const employeeId = user?.employee_id
  const [employee, setEmployee] = useState(null)
  const [employeeState, setEmployeeState] = useState({
    loading: Boolean(employeeId),
    error: null,
  })

  useEffect(() => {
    if (!employeeId) {
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
    } else if (location.pathname.startsWith('/icc/cases/')) {
      details = {
        eyebrow: 'ICC Workspace',
        title: 'Case Investigation Detail',
        description: 'Confidential inquiry docket, milestone tracker, and committee notes.',
      }
    } else if (location.pathname.startsWith('/manager')) {
      details = pageDetails['/manager']
    } else if (location.pathname.startsWith('/hr')) {
      details = pageDetails['/hr']
    } else if (location.pathname.startsWith('/icc')) {
      details = pageDetails['/icc']
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
  const isEmployeeDashboard = location.pathname === '/employee'
  const isHrDashboard = location.pathname === '/hr'
  const isIccDashboard = location.pathname === '/icc'

  const displayName = user?.name || employee?.name || 'User'

  let title = details.title
  if (isEmployeeDashboard) {
    title = `${greeting}, ${displayName}`
  } else if (isHrDashboard) {
    title = `${greeting}, ${displayName}`
  } else if (isIccDashboard) {
    title = `${greeting}, ${displayName}`
  }

  const sidebarEmployee = employee || {
    name: user?.name || 'User',
    designation: employeeState.loading ? 'Loading profile...' : (user?.role || 'Staff'),
    initials: user?.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U',
  }

  return (
    <div className="app-shell">
      <Sidebar employee={sidebarEmployee} />
      <main className="main-content">
        <Header
          description={details.description}
          eyebrow={details.eyebrow}
          title={title}
        />
        <ErrorBoundary>
          <Outlet context={{ employee, employeeState }} />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default Layout

