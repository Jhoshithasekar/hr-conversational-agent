import { Outlet, useLocation } from 'react-router-dom'

import { employee } from '../../data/mockData'
import Header from './Header'
import Sidebar from './Sidebar'

const pageDetails = {
  '/employee': {
    title: 'Good morning, Neha',
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
  const details = pageDetails[location.pathname] ?? pageDetails['/employee']

  return (
    <div className="app-shell">
      <Sidebar employee={employee} />
      <main className="main-content">
        <Header description={details.description} title={details.title} />
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
