import { Bell, Search } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

function Header({ title, description }) {
  const { user } = useAuth()

  const displayName = user?.name || 'Employee'
  const headerTitle = title?.startsWith('Good morning,')
    ? `Good morning, ${displayName}`
    : title

  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Employee workspace</p>
        <h1>{headerTitle}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="header-actions">
        <button aria-label="Search" className="icon-button" type="button">
          <Search aria-hidden="true" size={19} />
        </button>
        <button aria-label="Notifications" className="icon-button notification-button" type="button">
          <Bell aria-hidden="true" size={19} />
          <span aria-hidden="true" className="notification-dot" />
        </button>
      </div>
    </header>
  )
}

export default Header
