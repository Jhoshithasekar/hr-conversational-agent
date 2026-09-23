import { Bell, Search } from 'lucide-react'

function Header({ title, description }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Employee workspace</p>
        <h1>{title}</h1>
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
