import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { fetchEmployeeRequests } from '../../api/requestApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import LoadingState from '../../components/common/LoadingState'
import RequestCard from '../../components/common/RequestCard'

function MyRequests() {
  const { user } = useAuth()
  const employeeId = user?.employee_id
  const [requests, setRequests] = useState([])
  const [state, setState] = useState({ loading: Boolean(employeeId), error: '' })
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!employeeId) return

    let isCurrent = true

    fetchEmployeeRequests(employeeId)
      .then((requestData) => {
        if (isCurrent) {
          setRequests(requestData)
          setState({ loading: false, error: '' })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setState({
            loading: false,
            error: error.message || 'Unable to load requests.',
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'all' && (req.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchType = (req.type || '').toLowerCase().includes(query)
        const matchDetail = (req.detail || '').toLowerCase().includes(query)
        const matchStatus = (req.status || '').toLowerCase().includes(query)
        if (!matchType && !matchDetail && !matchStatus) return false
      }
      return true
    })
  }, [requests, statusFilter, searchQuery])

  const filterTabs = [
    { label: 'All', value: 'all', count: requests.length },
    { label: 'Pending', value: 'Pending', count: requests.filter((r) => (r.status || '').toLowerCase() === 'pending').length },
    { label: 'Approved', value: 'Approved', count: requests.filter((r) => (r.status || '').toLowerCase() === 'approved').length },
    { label: 'Rejected', value: 'Rejected', count: requests.filter((r) => (r.status || '').toLowerCase() === 'rejected').length },
  ]

  return (
    <div className="page-content narrow-content">
      {/* Header & Subtitle */}
      <div className="section-heading" style={{ marginBottom: '18px' }}>
        <div>
          <p className="eyebrow">Request History</p>
          <h2>My Requests & Claims</h2>
        </div>
        <span className="section-note">
          {state.loading ? 'Updating records...' : `${filteredRequests.length} of ${requests.length} total`}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        activeTab={statusFilter}
        onSearchChange={setSearchQuery}
        onTabChange={setStatusFilter}
        searchPlaceholder="Filter by request type or detail..."
        searchValue={searchQuery}
        tabs={filterTabs}
      />

      {/* State Handlers */}
      {state.loading && <LoadingState message="Loading your submitted requests..." />}
      {!state.loading && state.error && <ErrorState message={state.error} />}

      {!state.loading && !state.error && filteredRequests.length === 0 && (
        <EmptyState
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No requests match your selected filters. Try choosing a different tab or clearing search.'
              : 'You have not submitted any leave applications or expense reimbursement claims yet.'
          }
          icon={searchQuery || statusFilter !== 'all' ? 'search' : 'inbox'}
          title={searchQuery || statusFilter !== 'all' ? 'No Matching Requests' : 'No Requests Submitted'}
        />
      )}

      {!state.loading && !state.error && filteredRequests.length > 0 && (
        <div className="request-list request-list-expanded">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyRequests
