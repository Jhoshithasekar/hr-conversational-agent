import {
  ArrowLeftRight,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  LogOut,
  MessageCircle,
  NotebookTabs,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { normalizeRole } from '../../utils/workspaceRouting'

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

const hrNavigationItems = [
  { label: 'Dashboard', path: '/hr', icon: LayoutDashboard, end: true },
  { label: 'Requests & Approvals', path: '/hr/requests', icon: ClipboardList },
  { label: 'Knowledge Base', path: '/hr/knowledge-base', icon: BookOpen },
  { label: 'Analytics & Reports', path: '/hr/analytics', icon: LineChart },
  { label: 'Audit Log', path: '/hr/audit-log', icon: ShieldCheck },
  { label: 'Users & Roles', path: '/hr/users', icon: Users },
]

const iccNavigationItems = [
  { label: 'Dashboard', path: '/icc', icon: LayoutDashboard, end: true },
  { label: 'Cases', path: '/icc/cases', icon: Scale },
]

function Sidebar({ employee }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isManager = normalizeRole(user?.role) === 'Manager'

  let activeWorkspace = 'employee'
  if (location.pathname.startsWith('/manager')) {
    activeWorkspace = 'manager'
  } else if (location.pathname.startsWith('/hr')) {
    activeWorkspace = 'hr'
  } else if (location.pathname.startsWith('/icc')) {
    activeWorkspace = 'icc'
  }

  let navItems = employeeNavigationItems
  let sectionLabel = 'Employee workspace'
  let brandCaption = 'Employee self-service'
  let brandDestination = '/employee'

  if (activeWorkspace === 'manager') {
    navItems = managerNavigationItems
    sectionLabel = 'Manager workspace'
    brandCaption = 'Manager workspace portal'
    brandDestination = '/manager'
  } else if (activeWorkspace === 'hr') {
    navItems = hrNavigationItems
    sectionLabel = 'HR Workspace'
    brandCaption = 'HR Operations Portal'
    brandDestination = '/hr'
  } else if (activeWorkspace === 'icc') {
    navItems = iccNavigationItems
    sectionLabel = 'ICC Workspace'
    brandCaption = 'Confidential ICC Portal'
    brandDestination = '/icc'
  }

  const showWorkspaceSwitcher =
    isManager && (activeWorkspace === 'manager' || activeWorkspace === 'employee')

  return (
    <aside className="sidebar" aria-label={sectionLabel}>
      <Link className="sidebar-brand" to={brandDestination}>
        <div className="brand-mark">{activeWorkspace === 'icc' ? 'ICC' : 'HR'}</div>
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

      {/* For Managers only on Employee or Manager views: Workspace switcher */}
      {showWorkspaceSwitcher && (
        <div className="sidebar-workspace-switch">
          <NavLink
            className="sidebar-link switcher-link"
            to={activeWorkspace === 'manager' ? '/employee' : '/manager'}
          >
            <ArrowLeftRight aria-hidden="true" size={16} />
            <span>
              {activeWorkspace === 'manager' ? 'Switch to Employee View' : 'Switch to Manager View'}
            </span>
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

