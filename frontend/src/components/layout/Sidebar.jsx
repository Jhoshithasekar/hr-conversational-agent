import { LogOut, MessageCircle, NotebookTabs, ShieldAlert, UserRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

const navigationItems = [
  { label: 'Ask HR', path: '/employee/ask-hr', icon: MessageCircle },
  { label: 'My Requests', path: '/employee/requests', icon: NotebookTabs },
  { label: 'Policies', path: '/employee/policies', icon: NotebookTabs },
  { label: 'Report a Concern', path: '/employee/report-concern', icon: ShieldAlert },
]

function Sidebar({ employee }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar" aria-label="Employee navigation">
      <div className="sidebar-brand">
        <div className="brand-mark">HR</div>
        <div>
          <p className="brand-name">PeopleDesk</p>
          <p className="brand-caption">Employee self-service</p>
        </div>
      </div>

      <div className="sidebar-section-label">Employee workspace</div>
      <nav className="sidebar-nav">
        {navigationItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            key={path}
            to={path}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

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
