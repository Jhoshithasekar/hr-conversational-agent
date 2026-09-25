import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Clock,
  Search,
  X,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import { fetchManagerRequests } from '../../api/managerApi'
import ManagerRequestDetail from './ManagerRequestDetail'

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'Dates pending'
  const start = new Date(startDate).toLocaleDateString()
  const end = new Date(endDate).toLocaleDateString()
  return start === end ? start : `${start} - ${end}`
}

function ManagerRequests() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const initialSearch = searchParams.get('search') || ''

  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State for inline drawer/modal detail review
  const [selectedRequestId, setSelectedRequestId] = useState(null)

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchManagerRequests({
        status: statusFilter,
        requestType: typeFilter,
        search: searchQuery,
      })
      setRequests(data)
    } catch (err) {
      setError(err.message || 'Unable to load team requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [statusFilter, typeFilter, searchQuery])

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    const newParams = new URLSearchParams(searchParams)
    if (status === 'all') {
      newParams.delete('status')
    } else {
      newParams.set('status', status)
    }
    setSearchParams(newParams)
  }

  const handleActionSuccess = () => {
    loadRequests()
  }

  const statusTabs = [
    { label: 'All Requests', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ]

  const requestTypes = [
    { label: 'All Types', value: 'all' },
    { label: 'Work from home', value: 'Work from home' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Earned Leave', value: 'Earned Leave' },
  ]

  return (
    <div className="page-content">
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Approvals</p>
          <h2>Team Requests</h2>
        </div>
        <span className="section-note">
          {loading ? 'Updating...' : `${requests.length} request${requests.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '16px 18px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#edf1ef', padding: '4px', borderRadius: '8px' }}>
            {statusTabs.map((tab) => {
              const active = statusFilter.toLowerCase() === tab.value.toLowerCase()
              return (
                <button
                  key={tab.value}
                  onClick={() => handleStatusChange(tab.value)}
                  style={{
                    background: active ? '#fff' : 'transparent',
                    color: active ? '#1d2935' : '#687789',
                    border: 0,
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: active ? 700 : 500,
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                  type="button"
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Request Type Select */}
          <div style={{ minWidth: '160px' }}>
            <select
              aria-label="Filter by request type"
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                height: '38px',
                border: '1px solid #cfdad5',
                borderRadius: '7px',
                padding: '0 10px',
                fontSize: '0.8rem',
                color: '#1d2935',
                background: '#fff',
                width: '100%',
              }}
              value={typeFilter}
            >
              {requestTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Field */}
          <div className="search-field" style={{ flex: 1, minWidth: '220px' }}>
            <Search aria-hidden="true" size={17} />
            <input
              aria-label="Search by employee or reason"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee name or reason..."
              type="search"
              value={searchQuery}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading && <p className="state-message">Loading requests...</p>}

      {!loading && error && (
        <div className="form-alert form-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Clock size={34} style={{ color: '#8fa0aa', margin: '0 auto 12px' }} />
          <h3>No team requests found</h3>
          <p className="state-message">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No requests match your current filters. Try adjusting your search or filters.'
              : 'Your direct reports have not submitted any requests yet.'}
          </p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="request-list request-list-expanded">
          {requests.map((request) => (
            <article className="request-card" key={request.id} style={{ padding: '14px 18px' }}>
              <div className="request-icon">
                {request.employee_name ? request.employee_name.slice(0, 1) : 'R'}
              </div>

              <div className="request-details" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '0.88rem' }}>{request.employee_name}</strong>
                  <span style={{ fontSize: '0.74rem', color: '#87949d' }}>({request.employee_role} • {request.department_name})</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#52626d', marginTop: '2px' }}>
                  <strong>{request.request_type}</strong> — &quot;{request.reason}&quot;
                </div>
                {request.manager_comment && (
                  <div style={{ fontSize: '0.72rem', color: '#27704d', marginTop: '4px', fontStyle: 'italic' }}>
                    Note: &quot;{request.manager_comment}&quot;
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', marginRight: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1d2935' }}>
                  {formatDateRange(request.start_date, request.end_date)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#87949d', marginTop: '2px' }}>
                  {request.total_days} Day{request.total_days !== 1 ? 's' : ''} {request.half_full_day ? `(${request.half_full_day})` : ''}
                </div>
              </div>

              <StatusBadge status={request.status} />

              <button
                aria-label={`Review request #${request.id}`}
                className="secondary-button"
                onClick={() => setSelectedRequestId(request.id)}
                style={{
                  height: '36px',
                  minHeight: '36px',
                  padding: '0 12px',
                  marginLeft: '12px',
                  fontSize: '0.76rem',
                }}
                type="button"
              >
                Review
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Modal / Drawer for Request Details */}
      {selectedRequestId && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(29, 41, 53, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative',
              padding: '24px',
            }}
          >
            <button
              aria-label="Close modal"
              onClick={() => setSelectedRequestId(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 0,
                color: '#687789',
                cursor: 'pointer',
                padding: '4px',
              }}
              type="button"
            >
              <X size={20} />
            </button>

            <ManagerRequestDetail
              isModal
              onActionSuccess={handleActionSuccess}
              onClose={() => setSelectedRequestId(null)}
              requestId={selectedRequestId}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerRequests
