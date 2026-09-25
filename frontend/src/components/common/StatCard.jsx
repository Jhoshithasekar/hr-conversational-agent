import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'teal',
  remaining,
  used,
  total,
  footnote,
  linkTo,
  linkLabel,
}) {
  // Mode 1: Leave balance progress meter
  if (remaining !== undefined && total !== undefined) {
    const percentage = total > 0 ? Math.min(100, Math.round(((used || 0) / total) * 100)) : 0

    return (
      <article className={`stat-card ${tone}`}>
        <div className="stat-card-topline">
          <span className="stat-label">{label}</span>
          <ArrowUpRight aria-hidden="true" size={16} />
        </div>
        <div className="stat-value-row">
          <strong>{remaining} / {total}</strong>
          <span>days remaining</span>
        </div>
        <div className="progress-track" aria-label={`${percentage}% used`}>
          <span style={{ width: `${percentage}%` }} />
        </div>
        <div className="stat-footnote">{used || 0} used of {total} days</div>
      </article>
    )
  }

  // Mode 2: Standard metric card
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-card-topline">
        <span className="stat-label">{label}</span>
        {Icon && <Icon aria-hidden="true" size={17} />}
      </div>
      <div className="stat-value-row">
        <strong>{value}</strong>
        {subtext && <span>{subtext}</span>}
      </div>
      {(linkTo && linkLabel) ? (
        <div className="stat-footnote">
          <Link className="text-link" to={linkTo}>
            {linkLabel} <ArrowRight size={13} style={{ marginLeft: '3px' }} />
          </Link>
        </div>
      ) : footnote ? (
        <div className="stat-footnote">
          <span>{footnote}</span>
        </div>
      ) : null}
    </article>
  )
}

export default StatCard
