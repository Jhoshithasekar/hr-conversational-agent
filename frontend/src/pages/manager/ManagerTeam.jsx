import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Clock,
  Search,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import { fetchManagerTeam } from '../../api/managerApi'

function ManagerTeam() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadTeam() {
      try {
        setLoading(true)
        setError('')
        const teamData = await fetchManagerTeam()
        if (isCurrent) {
          setTeam(teamData)
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || 'Unable to load direct reports.')
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadTeam()

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredTeam = team.filter((emp) => {
    if (!searchQuery.trim()) return true
    const term = searchQuery.toLowerCase()
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      (emp.role && emp.role.toLowerCase().includes(term)) ||
      (emp.department_name && emp.department_name.toLowerCase().includes(term))
    )
  })

  return (
    <div className="page-content">
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Organization</p>
          <h2>Direct Reports</h2>
        </div>
        <span className="section-note">
          {loading ? 'Loading team...' : `${team.length} direct report${team.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="policy-toolbar" style={{ margin: '0 0 24px' }}>
        <div className="search-field" style={{ flex: 1, maxWidth: '400px' }}>
          <Search aria-hidden="true" size={17} />
          <input
            aria-label="Search direct reports"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, or department..."
            type="search"
            value={searchQuery}
          />
        </div>
      </div>

      {loading && <p className="state-message">Loading direct reports...</p>}

      {!loading && error && (
        <div className="form-alert form-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filteredTeam.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <UserRound size={32} style={{ color: '#8fa0aa', margin: '0 auto 12px' }} />
          <h3>No direct reports found</h3>
          <p className="state-message">
            {searchQuery
              ? 'No team members match your search criteria.'
              : 'There are currently no employees assigned with you as their reporting manager.'}
          </p>
        </div>
      )}

      {!loading && !error && filteredTeam.length > 0 && (
        <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {filteredTeam.map((emp) => {
            const initials = emp.name
              ? emp.name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : '--'

            return (
              <article className="panel" key={emp.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="avatar avatar-large" style={{ width: '52px', height: '52px', fontSize: '1rem' }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontFamily: 'Manrope, sans-serif' }}>
                      {emp.name}
                    </h3>
                    <p style={{ margin: '0 0 4px', color: '#687789', fontSize: '0.82rem' }}>
                      {emp.role || 'Designation pending'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#87949d', fontSize: '0.74rem' }}>
                      <Briefcase size={13} />
                      <span>{emp.department_name}</span>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={emp.status} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #edf1ef', borderBottom: '1px solid #edf1ef', padding: '12px 0' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 700, color: '#8fa0aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Leave Balances (2026)
                  </p>
                  {emp.leave_balances && emp.leave_balances.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {emp.leave_balances.map((b) => (
                        <div
                          key={b.leave_type}
                          style={{
                            background: '#f8faf9',
                            border: '1px solid #dfe6e2',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <span style={{ color: '#687789' }}>{b.leave_type}: </span>
                          <strong style={{ color: '#1d2935' }}>{b.remaining_days}d left</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#87949d' }}>No balances recorded</p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                    {emp.pending_requests_count > 0 ? (
                      <span style={{ color: '#93621a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        <strong>{emp.pending_requests_count} pending request{emp.pending_requests_count > 1 ? 's' : ''}</strong>
                      </span>
                    ) : (
                      <span style={{ color: '#87949d' }}>No pending requests</span>
                    )}
                  </div>
                  <Link
                    className="text-link"
                    style={{ fontSize: '0.78rem' }}
                    to={`/manager/requests?search=${encodeURIComponent(emp.name)}`}
                  >
                    View Requests <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ManagerTeam
