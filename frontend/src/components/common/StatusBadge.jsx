function StatusBadge({ status }) {
  if (!status) return null
  const normalizedClass = status.trim().toLowerCase().replace(/\s+/g, '-')
  return <span className={`status-badge ${normalizedClass}`}>{status}</span>
}

export default StatusBadge

