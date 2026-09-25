import { AlertCircle, Clock, FileText, Inbox, RefreshCw, Search } from 'lucide-react'

const defaultIcons = {
  inbox: Inbox,
  search: Search,
  clock: Clock,
  file: FileText,
  error: AlertCircle,
}

function EmptyState({
  icon = 'inbox',
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) {
  const IconComponent = typeof icon === 'string' ? defaultIcons[icon] || Inbox : icon

  return (
    <div className="empty-state-panel">
      <div className="empty-state-icon">
        <IconComponent aria-hidden="true" size={26} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button className="secondary-button" onClick={onAction} type="button">
          <RefreshCw aria-hidden="true" size={14} style={{ marginRight: '6px' }} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
