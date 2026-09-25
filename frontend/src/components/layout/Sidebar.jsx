import {
  ArrowLeftRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  NotebookTabs,
  ShieldAlert,
  UserRound,
  Users,
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

const employeeNavigationItems = [
  { label: 'Dashboard', path: '/employee', icon: LayoutDashboard, end: true },
  { label: 'Ask HR', path: '/employee/ask-hr', icon: MessageCircle },
  { label: 'My Requests', path: '/employee/requests', icon: NotebookTabs },
  { label: 'Policies', path: '/employee/policies', icon: NotebookTabs },
  { label: 'Report a Concern', path: '/employee/report-concern', icon: ShieldAlert },
]

const managerNavigationItems = [
  { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, end: true },
  { label: 'My Team', path: '/manager/team', icon: Users },
  { label: 'Team Requests', path: '/manager/requests', icon: ClipboardList },
]

function Sidebar({ employee }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const userRole = (user?.role || '').toLowerCase()
  const isManager = userRole.includes('manager') || userRole === 'hr'
  const activeWorkspace = location.pathname.startsWith('/manager') ? 'manager' : 'employee'
  const isManagerWorkspace = activeWorkspace === 'manager'

  const navItems = isManagerWorkspace ? managerNavigationItems : employeeNavigationItems
  const sectionLabel = isManagerWorkspace ? 'Manager workspace' : 'Employee workspace'
  const brandCaption = isManagerWorkspace ? 'Manager workspace portal' : 'Employee self-service'

  return (
    <aside className="sidebar" aria-label={sectionLabel}>
      <Link
        className="sidebar-brand"
        to={isManagerWorkspace ? '/manager' : '/employee'}
      >
        <div className="brand-mark">HR</div>
        <div>
          <p className="brand-name">PeopleDesk</p>
          <p className="brand-caption">{brandCaption}</p>
        </div>
      </Link>

      <div className="sidebar-section-label">{sectionLabel}</div>
      <nav className="sidebar-nav">
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            end={Boolean(end)}
            key={path}
            to={path}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* For Managers only: Workspace switcher */}
      {isManager && (
        <div className="sidebar-workspace-switch">
          <NavLink
            className="sidebar-link switcher-link"
            to={isManagerWorkspace ? '/employee' : '/manager'}
          >
            <ArrowLeftRight aria-hidden="true" size={16} />
            <span>{isManagerWorkspace ? 'Switch to Employee View' : 'Switch to Manager View'}</span>
          </NavLink>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="avatar avatar-small">{employee.initials}</div>
          <div className="sidebar-profile-copy">
            <strong>{employee.name}</strong>
            <span>{employee.designation}</span>
          </div>
          <UserRound aria-hidden="true" size={16} />
        </div>
        <button className="logout-button" onClick={handleLogout} type="button">
          <LogOut aria-hidden="true" size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

