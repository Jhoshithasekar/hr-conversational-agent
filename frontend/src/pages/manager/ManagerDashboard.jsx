import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import { fetchManagerDashboard } from '../../api/managerApi'

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'Dates pending'
  const start = new Date(startDate).toLocaleDateString()
  const end = new Date(endDate).toLocaleDateString()
  return start === end ? start : `${start} - ${end}`
}

function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')
        const data = await fetchManagerDashboard()
        if (isCurrent) {
          setDashboardData(data)
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || 'Unable to load manager dashboard.')
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [])

  if (loading) {
    return (
      <div className="page-content">
        <p className="state-message">Loading manager workspace data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="form-alert form-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const {
    team_count: teamCount = 0,
    pending_requests_count: pendingCount = 0,
    action_required_count: actionCount = 0,
    on_leave_today_count: leaveTodayCount = 0,
    recent_activity: recentActivity = [],
  } = dashboardData || {}

  return (
    <div className="page-content">
      {/* Overview Stat Cards */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Team metrics</p>
            <h2>Workspace overview</h2>
          </div>
          <span className="section-note">Live data from HR records</span>
        </div>

        <div className="stat-grid">
          <article className="stat-card teal">
            <div className="stat-card-topline">
              <span className="stat-label">Direct Reports</span>
              <Users aria-hidden="true" size={18} />
            </div>
            <div className="stat-value-row">
              <strong>{teamCount}</strong>
              <span>employees</span>
            </div>
            <div className="stat-footnote">
              <Link className="text-link" to="/manager/team">
                View team directory <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <article className="stat-card coral">
            <div className="stat-card-topline">
              <span className="stat-label">Pending Requests</span>
              <Clock aria-hidden="true" size={18} />
            </div>
            <div className="stat-value-row">
              <strong>{pendingCount}</strong>
              <span>awaiting review</span>
            </div>
            <div className="stat-footnote">
              <Link className="text-link" to="/manager/requests?status=Pending">
                Review pending items <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <article className="stat-card gold">
            <div className="stat-card-topline">
              <span className="stat-label">Out / WFH Today</span>
              <CalendarDays aria-hidden="true" size={18} />
            </div>
            <div className="stat-value-row">
              <strong>{leaveTodayCount}</strong>
              <span>team members</span>
            </div>
            <div className="stat-footnote">
              <span>{leaveTodayCount > 0 ? 'Approved arrangements active today' : 'All team members on regular schedule'}</span>
            </div>
          </article>
        </div>
      </section>

      {/* Action Required Banner if pending requests exist */}
      {actionCount > 0 && (
        <section className="confidential-banner" style={{ background: '#fdf7ea', borderColor: '#f1e2be', color: '#825619' }}>
          <AlertCircle aria-hidden="true" size={20} />
          <div style={{ flex: 1 }}>
            <strong>Action required ({actionCount} pending)</strong>
            <p>
              You have {actionCount} request{actionCount > 1 ? 's' : ''} submitted by your direct reports waiting for your approval or rejection.
            </p>
          </div>
          <Link className="primary-button" style={{ height: '36px', minHeight: '36px', padding: '0 14px' }} to="/manager/requests?status=Pending">
            Review Now
          </Link>
        </section>
      )}

      {/* Recent Team Activity */}
      <section className="section-block requests-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Direct reports activity</p>
            <h2>Recent requests</h2>
          </div>
          <Link className="text-link" to="/manager/requests">
            View all requests
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="state-message">No recent requests recorded for your direct reports.</p>
        ) : (
          <div className="request-list">
            {recentActivity.map((activity) => (
              <article className="request-card" key={activity.id}>
                <div className="request-icon">
                  {activity.employee_name ? activity.employee_name.slice(0, 1) : 'R'}
                </div>
                <div className="request-details">
                  <strong>{activity.employee_name}</strong>
                  <span>
                    {activity.request_type} • {activity.total_days} day{activity.total_days > 1 ? 's' : ''} • &quot;{activity.reason}&quot;
                  </span>
                </div>
                <div className="request-date">
                  {formatDateRange(activity.start_date, activity.end_date)}
                </div>
                <StatusBadge status={activity.status} />
                <Link
                  aria-label={`Review request #${activity.id}`}
                  className="row-action"
                  to={`/manager/requests/${activity.id}`}
                >
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ManagerDashboard
