import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import FilterBar from '../../components/common/FilterBar'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
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

  // State for inline modal detail review
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
    let isCurrent = true

    async function fetchRequests() {
      try {
        setError('')
        const data = await fetchManagerRequests({
          status: statusFilter,
          requestType: typeFilter,
          search: searchQuery,
        })
        if (isCurrent) {
          setRequests(data)
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || 'Unable to load team requests.')
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    fetchRequests()

    return () => {
      isCurrent = false
    }
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
      <FilterBar
        activeTab={statusFilter}
        onSearchChange={setSearchQuery}
        onSelectChange={setTypeFilter}
        onTabChange={handleStatusChange}
        searchPlaceholder="Search by employee name or reason..."
        searchValue={searchQuery}
        selectLabel="Filter by request type"
        selectOptions={requestTypes}
        selectValue={typeFilter}
        tabs={statusTabs}
      />

      {/* Content Section */}
      {loading && <LoadingState message="Loading team requests..." />}

      {!loading && error && (
        <ErrorState message={error} onRetry={loadRequests} retryLabel="Reload Requests" />
      )}

      {!loading && !error && requests.length === 0 && (
        <EmptyState
          description={
            searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No requests match your current filters. Try adjusting your search query or status filter.'
              : 'Your direct reports have not submitted any requests yet.'
          }
          icon="clock"
          title="No team requests found"
        />
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
                  <span style={{ fontSize: '0.74rem', color: '#87949d' }}>
                    ({request.employee_role} • {request.department_name})
                  </span>
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
                  {request.total_days} Day{request.total_days !== 1 ? 's' : ''}{' '}
                  {request.half_full_day ? `(${request.half_full_day})` : ''}
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
                  padding: '0 14px',
                  marginLeft: '12px',
                  fontSize: '0.78rem',
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
