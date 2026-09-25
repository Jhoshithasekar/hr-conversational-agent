import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import FilterBar from '../../components/common/FilterBar'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { fetchManagerTeam } from '../../api/managerApi'

function ManagerTeam() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  async function loadTeam() {
    try {
      setLoading(true)
      setError('')
      const teamData = await fetchManagerTeam()
      setTeam(teamData)
    } catch (err) {
      setError(err.message || 'Unable to load direct reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function initialLoad() {
      try {
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

    initialLoad()

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
      <FilterBar
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search direct reports by name, role, or department..."
        searchValue={searchQuery}
      />

      {loading && <LoadingState message="Loading direct reports..." />}

      {!loading && error && (
        <ErrorState message={error} onRetry={loadTeam} retryLabel="Reload Team" />
      )}

      {!loading && !error && filteredTeam.length === 0 && (
        <EmptyState
          description={
            searchQuery
              ? 'No team members match your search criteria. Try a different search term.'
              : 'There are currently no employees assigned with you as their reporting manager.'
          }
          icon="search"
          title="No direct reports found"
        />
      )}

      {!loading && !error && filteredTeam.length > 0 && (
        <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {filteredTeam.map((emp) => {
            const initials = emp.name
              ? emp.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '--'

            return (
              <article
                className="panel"
                key={emp.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="avatar avatar-large" style={{ width: '48px', height: '48px', fontSize: '0.95rem' }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: '0 0 2px',
                        fontSize: '1rem',
                        fontFamily: 'Manrope, sans-serif',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {emp.name}
                    </h3>
                    <p style={{ margin: '0 0 4px', color: '#687789', fontSize: '0.8rem' }}>
                      {emp.role || 'Designation pending'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#87949d', fontSize: '0.74rem' }}>
                      <Briefcase size={12} />
                      <span>{emp.department_name}</span>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={emp.status} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #edf1ef', borderBottom: '1px solid #edf1ef', padding: '12px 0' }}>
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#8fa0aa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
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
                            fontSize: '0.74rem',
                          }}
                        >
                          <span style={{ color: '#687789' }}>{b.leave_type}: </span>
                          <strong style={{ color: '#1d2935' }}>{b.remaining_days}d left</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#87949d' }}>No balances recorded</p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                    {emp.pending_requests_count > 0 ? (
                      <span style={{ color: '#93621a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Clock size={14} />
                        <span>{emp.pending_requests_count} pending request{emp.pending_requests_count > 1 ? 's' : ''}</span>
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
                    View Requests <ArrowRight size={13} style={{ marginLeft: '3px' }} />
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
