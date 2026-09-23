import { ArrowUpRight } from 'lucide-react'

function StatCard({ label, remaining, used, total, tone }) {
  const percentage = Math.round((used / total) * 100)

  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-card-topline">
        <span className="stat-label">{label}</span>
        <ArrowUpRight aria-hidden="true" size={17} />
      </div>
      <div className="stat-value-row">
        <strong>{remaining} / {total}</strong>
        <span>days remaining</span>
      </div>
      <div className="progress-track" aria-label={`${percentage}% used`}>
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="stat-footnote">{used} used of {total} days</div>
    </article>
  )
}

export default StatCard
