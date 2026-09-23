import { ArrowUpRight } from 'lucide-react'

import StatusBadge from './StatusBadge'

function RequestCard({ request }) {
  return (
    <article className="request-card">
      <div className="request-icon">{request.type.slice(0, 1)}</div>
      <div className="request-details">
        <strong>{request.type}</strong>
        <span>{request.detail}</span>
      </div>
      <div className="request-date">{request.date}</div>
      <StatusBadge status={request.status} />
      <button aria-label={`Open ${request.type}`} className="row-action" type="button">
        <ArrowUpRight aria-hidden="true" size={17} />
      </button>
    </article>
  )
}

export default RequestCard
