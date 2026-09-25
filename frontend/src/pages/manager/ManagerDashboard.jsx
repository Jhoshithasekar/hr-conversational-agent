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
import StatCard from '../../components/common/StatCard'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
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

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')
      const data = await fetchManagerDashboard()
      setDashboardData(data)
    } catch (err) {
      setError(err.message || 'Unable to load manager dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function initialLoad() {
      try {
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

    initialLoad()

    return () => {
      isCurrent = false
    }
  }, [])

  if (loading) {
    return (
      <div className="page-content">
        <LoadingState message="Loading manager workspace data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <ErrorState message={error} onRetry={loadDashboard} retryLabel="Reload Dashboard" />
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
          <StatCard
            icon={Users}
            label="Direct Reports"
            linkLabel="View team directory"
            linkTo="/manager/team"
            subtext="employees"
            tone="teal"
            value={teamCount}
          />

          <StatCard
            icon={Clock}
            label="Pending Requests"
            linkLabel="Review pending items"
            linkTo="/manager/requests?status=Pending"
            subtext="awaiting review"
            tone="coral"
            value={pendingCount}
          />

          <StatCard
            footnote={
              leaveTodayCount > 0
                ? 'Approved arrangements active today'
                : 'All team members on regular schedule'
            }
            icon={CalendarDays}
            label="Out / WFH Today"
            subtext="team members"
            tone="gold"
            value={leaveTodayCount}
          />
        </div>
      </section>

      {/* Action Required Banner if pending requests exist */}
      {actionCount > 0 && (
        <section
          className="confidential-banner"
          style={{
            background: '#fff9ea',
            borderColor: '#f5e3ba',
            color: '#825619',
            marginBottom: '28px',
          }}
        >
          <AlertCircle aria-hidden="true" size={20} style={{ color: '#b57922', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#684512' }}>Action Required ({actionCount} Pending)</strong>
            <p style={{ color: '#8a6225' }}>
              You have {actionCount} request{actionCount > 1 ? 's' : ''} submitted by your direct reports awaiting review.
            </p>
          </div>
          <Link
            className="primary-button"
            style={{
              height: '36px',
              minHeight: '36px',
              padding: '0 14px',
              background: '#b57922',
              borderColor: '#9e6717',
            }}
            to="/manager/requests?status=Pending"
          >
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
          <EmptyState
            description="No recent requests recorded for your direct reports."
            icon="clock"
            title="No recent requests"
          />
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
